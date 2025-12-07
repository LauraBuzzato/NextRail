const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

async function lerArquivo(servidor) {
  if (!servidor) {
    throw new Error("Servidor não informado");
  }

  const bucket = process.env.S3_BUCKET;
  const prefixo = `ViaMobilidade/${servidor}/processos/`;
  
  console.log(`[S3Controller] Buscando arquivos em: ${bucket}/${prefixo}`);
  
  const todosArquivos = await listarArquivos(bucket, prefixo);

  // Data atual em São Paulo (UTC-3)
  const agora = new Date();
  const agoraSaoPaulo = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  const hoje = new Date(agoraSaoPaulo);
  hoje.setHours(0, 0, 0, 0);
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  const dataHoje = hoje.toISOString().slice(0, 10);
  const dataOntem = ontem.toISOString().slice(0, 10);

  console.log(`[S3Controller] Timezone Info:`);
  console.log(`  - Hora UTC: ${agora.toISOString()}`);
  console.log(`  - Hora São Paulo: ${agoraSaoPaulo.toISOString()}`);
  console.log(`  - Buscando arquivos de: ${dataOntem} e ${dataHoje}`);

  const arquivosRecentes = todosArquivos
    .filter(a => {
      if (!a.Key || a.Key.endsWith('/') || a.Size === 0) {
        return false;
      }
      const nome = a.Key.split('/').pop();
      return nome === `ProcessosUso_${dataHoje}.csv` ||
        nome === `ProcessosUso_${dataOntem}.csv`;
    })
    .sort((a, b) => (b.LastModified || 0) - (a.LastModified || 0));

  console.log(`[S3Controller] Encontrados ${arquivosRecentes.length} arquivos relevantes`);
  
  if (arquivosRecentes.length > 0) {
    console.log(`[S3Controller] Arquivos encontrados:`, arquivosRecentes.map(a => a.Key));
  }

  if (arquivosRecentes.length === 0) {
    throw new Error(`Nenhum arquivo encontrado para ${servidor} nas datas ${dataOntem} ou ${dataHoje}`);
  }

  const usoMaximoMemoriaPorProcesso = new Map();
  const processosPorIntervalo = new Map();
  
  // Pegar dados das últimas 24 horas (independente de timezone)
  const vinteCuatroHorasAtras = agoraSaoPaulo.getTime() - (24 * 60 * 60 * 1000);

  function parseTimestampBR(str) {
    if (!str) return null;
    
    const partes = str.trim().split(' ');
    if (partes.length !== 2) return null;

    const [data, hora] = partes;
    const [ano, mes, dia] = data.split('-').map(Number);
    const [h, m, s] = hora.split(':').map(Number);

    // Criar data assumindo que o CSV está em horário de São Paulo
    const date = new Date(ano, mes - 1, dia, h, m, s || 0);
    
    if (isNaN(date.getTime())) return null;
    
    return date;
  }

  function parseFloatBR(str) {
    if (!str) return 0;
    const limpo = str.toString().trim().replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
  }

  function gerarChaveIntervalo(ts) {
    if (!ts) return null;

    const minutoOriginal = ts.getMinutes();
    const minutoArredondado = Math.floor(minutoOriginal / 5) * 5;

    const hora = ts.getHours().toString().padStart(2, '0');
    const minutoFormatado = String(minutoArredondado).padStart(2, '0');

    return `${hora}:${minutoFormatado}`;
  }

  let totalLinhasProcessadas = 0;
  let linhasComTimestampValido = 0;
  let linhasDentroDoIntervalo = 0;
  let primeiroTimestamp = null;
  let ultimoTimestamp = null;

  // Processar cada arquivo
  for (const arquivo of arquivosRecentes) {
    console.log(`[S3Controller] Processando arquivo: ${arquivo.Key}`);
    
    const texto = await baixarArquivo(bucket, arquivo.Key);
    const linhas = parseCSV(texto);

    totalLinhasProcessadas += linhas.length;
    console.log(`[S3Controller] Linhas parseadas: ${linhas.length}`);
    
    if (linhas.length > 0) {
      console.log("[S3Controller] Exemplo de primeira linha:", JSON.stringify(linhas[0]));
      console.log("[S3Controller] Colunas disponíveis:", Object.keys(linhas[0]));
    }

    for (const linha of linhas) {
      const tsRaw = linha.TIMESTAMP || linha.timestamp || linha.Timestamp;
      const nomeRaw = linha.NOME || linha.Nome || linha.nome;
      const memoriaRaw = linha["USO_MEMORIA (MB)"] || linha["USO_MEMORIA_MB"] || linha.USO_MEMORIA_MB;

      if (!tsRaw) continue;

      const ts = parseTimestampBR(tsRaw);
      
      if (!ts) {
        if (linhasComTimestampValido === 0) {
          console.log(`[S3Controller] Exemplo de timestamp inválido: "${tsRaw}"`);
        }
        continue;
      }
      
      linhasComTimestampValido++;

      // Rastrear primeiro e último timestamp
      if (!primeiroTimestamp || ts.getTime() < primeiroTimestamp.getTime()) {
        primeiroTimestamp = ts;
      }
      if (!ultimoTimestamp || ts.getTime() > ultimoTimestamp.getTime()) {
        ultimoTimestamp = ts;
      }

      // Verificar se está dentro das últimas 24 horas
      if (ts.getTime() < vinteCuatroHorasAtras) {
        continue;
      }

      linhasDentroDoIntervalo++;

      const nome = (nomeRaw || "Desconhecido").trim();
      const memoria = parseFloatBR(memoriaRaw);

      // Pico de memória por processo
      const atual = usoMaximoMemoriaPorProcesso.get(nome) || 0;
      if (memoria > atual) {
        usoMaximoMemoriaPorProcesso.set(nome, memoria);
      }

      // Contagem por intervalo de 5 minutos
      const intervalo = gerarChaveIntervalo(ts);
      if (intervalo) {
        processosPorIntervalo.set(intervalo, (processosPorIntervalo.get(intervalo) || 0) + 1);
      }
    }
  }

  console.log(`[S3Controller] ========== RESUMO DO PROCESSAMENTO ==========`);
  console.log(`[S3Controller] Total de linhas processadas: ${totalLinhasProcessadas}`);
  console.log(`[S3Controller] Linhas com timestamp válido: ${linhasComTimestampValido}`);
  console.log(`[S3Controller] Linhas dentro do intervalo (24h): ${linhasDentroDoIntervalo}`);
  console.log(`[S3Controller] Processos únicos encontrados: ${usoMaximoMemoriaPorProcesso.size}`);
  
  if (primeiroTimestamp && ultimoTimestamp) {
    console.log(`[S3Controller] Range de timestamps no CSV:`);
    console.log(`  - Primeiro: ${primeiroTimestamp.toISOString()}`);
    console.log(`  - Último: ${ultimoTimestamp.toISOString()}`);
    console.log(`  - Diferença para agora: ${Math.round((agoraSaoPaulo.getTime() - ultimoTimestamp.getTime()) / (1000 * 60))} minutos`);
  }
  console.log(`[S3Controller] =============================================`);

  if (usoMaximoMemoriaPorProcesso.size === 0) {
    throw new Error(
      `Nenhum dado encontrado nas últimas 24 horas. ` +
      `Total de linhas: ${totalLinhasProcessadas}, ` +
      `Timestamps válidos: ${linhasComTimestampValido}, ` +
      `Dentro do intervalo: ${linhasDentroDoIntervalo}. ` +
      (primeiroTimestamp ? `Dados mais recentes de ${Math.round((agoraSaoPaulo.getTime() - ultimoTimestamp.getTime()) / (1000 * 60))} minutos atrás.` : '')
    );
  }

  return montarResultadoDashboard(usoMaximoMemoriaPorProcesso, processosPorIntervalo);
}

async function listarArquivos(bucket, prefix) {
  let todos = [];
  let token = null;
  
  do {
    const resultado = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 1000,
      ContinuationToken: token || undefined
    }).promise();

    todos = todos.concat(resultado.Contents || []);
    token = resultado.NextContinuationToken;
  } while (token);
  
  return todos;
}

async function baixarArquivo(bucket, key) {
  const { Body } = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  return Body.toString('utf-8').trim();
}

function parseCSV(texto) {
  const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (linhas.length === 0) return [];

  const cabecalho = linhas[0]
    .split(';')
    .map(h => h.replace(/^"|"$/g, '').trim().toUpperCase());
  
  const dados = [];

  for (let i = 1; i < linhas.length; i++) {
    const colunas = parseLinhaCSV(linhas[i]);
    
    if (colunas.length !== cabecalho.length) {
      continue;
    }

    const registro = {};
    let temDados = false;
    
    for (let j = 0; j < cabecalho.length; j++) {
      const valor = colunas[j].replace(/^"|"$/g, '').trim();
      registro[cabecalho[j]] = valor;
      if (valor) temDados = true;
    }
    
    if (temDados) {
      dados.push(registro);
    }
  }
  
  return dados;
}

function parseLinhaCSV(linha) {
  const valores = [];
  let atual = '';
  let aspas = false;

  for (let char of linha + ';') {
    if (char === '"') {
      aspas = !aspas;
    } else if (char === ';' && !aspas) {
      valores.push(atual);
      atual = '';
    } else {
      atual += char;
    }
  }
  
  return valores;
}

function montarResultadoDashboard(memoriaMap, intervaloMap) {
  // Top 5 processos que mais consumiram memória
  const top5 = [...memoriaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Ordenar intervalos cronologicamente
  const horariosIntervalos = [...intervaloMap.keys()].sort((a, b) => {
    const [hA, mA] = a.split(':').map(Number);
    const [hB, mB] = b.split(':').map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  });

  const quantidades = horariosIntervalos.map(h => intervaloMap.get(h) || 0);

  const totalIntervalos = quantidades.length;
  const soma = quantidades.reduce((a, b) => a + b, 0);
  const media = totalIntervalos > 0 ? Math.round(soma / totalIntervalos) : 0;
  const maximo = totalIntervalos > 0 ? Math.max(...quantidades) : 0;

  console.log(`[S3Controller] Dashboard montado com sucesso!`);
  console.log(`[S3Controller] Top 5 processos:`, top5.map(([nome]) => nome));
  console.log(`[S3Controller] Intervalos de tempo: ${horariosIntervalos.length}`);

  return {
    labelsMemoria: top5.map(([nome]) => nome),
    memoriaMB: top5.map(([, mb]) => mb),
    horarios: horariosIntervalos,
    processos24h: quantidades,
    maximoProcessos: maximo,
    mediaProcessos: media,
    processoMaisFrequente: top5[0]?.[0] || 'N/A'
  };
}

module.exports = { lerArquivo };