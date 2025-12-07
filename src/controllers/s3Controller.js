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

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  const dataHoje = hoje.toISOString().slice(0, 10);
  const dataOntem = ontem.toISOString().slice(0, 10);

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

  console.log(`[S3Controller] Encontrados ${arquivosRecentes.length} arquivos relevantes (hoje/ontem)`);

  if (arquivosRecentes.length === 0) {
    throw new Error(`Nenhum arquivo encontrado para ${servidor} nas datas ${dataHoje} ou ${dataOntem}`);
  }

  const usoMaximoMemoriaPorProcesso = new Map();
  const processosPorIntervalo = new Map();
  const umaHoraAtras = Date.now() - (1 * 60 * 60 * 1000);

  function parseTimestampBR(str) {
    if (!str) return null;
    
    const partes = str.trim().split(' ');
    if (partes.length !== 2) return null;

    const [data, hora] = partes;
    const [ano, mes, dia] = data.split('-').map(Number);
    const [h, m, s] = hora.split(':').map(Number);

    const date = new Date(ano, mes - 1, dia, h, m, s || 0);
    return isNaN(date.getTime()) ? null : date;
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

  // Processar cada arquivo
  for (const arquivo of arquivosRecentes) {
    console.log(`[S3Controller] Processando arquivo: ${arquivo.Key}`);
    
    const texto = await baixarArquivo(bucket, arquivo.Key);
    const linhas = parseCSV(texto);

    console.log(`[S3Controller] Linhas parseadas: ${linhas.length}`);
    
    if (linhas.length > 0) {
      console.log("[S3Controller] Exemplo de primeira linha:", linhas[0]);
    }

    for (const linha of linhas) {
      const tsRaw = linha.TIMESTAMP || linha.timestamp || linha.Timestamp;
      const nomeRaw = linha.NOME || linha.Nome || linha.nome;
      const memoriaRaw = linha["USO_MEMORIA (MB)"] || linha["USO_MEMORIA_MB"] || linha.USO_MEMORIA_MB;

      if (!tsRaw) continue;

      const ts = parseTimestampBR(tsRaw);
      if (!ts || ts.getTime() < umaHoraAtras) continue;

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

  if (usoMaximoMemoriaPorProcesso.size === 0) {
    throw new Error("Nenhum dado encontrado na última hora");
  }

  console.log(`[S3Controller] Processados ${usoMaximoMemoriaPorProcesso.size} processos únicos`);
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
    
    if (colunas.length !== cabecalho.length) continue;

    const registro = {};
    let temDados = false;
    
    for (let j = 0; j < cabecalho.length; j++) {
      const valor = colunas[j].replace(/^"|"$/g, '').trim();
      registro[cabecalho[j]] = valor;
      if (valor) temDados = true;
    }
    
    if (temDados && registro.NOME) {
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

  const top5 = [...memoriaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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