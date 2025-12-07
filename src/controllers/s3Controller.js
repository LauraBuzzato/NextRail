const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

async function lerArquivo(servidor) {
  if (!servidor) throw new Error("Servidor não informado");

  const bucket = process.env.S3_BUCKET;
  const prefixo = `ViaMobilidade/${servidor}/processos/`;
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

  console.log(`Encontrados ${arquivosRecentes.length} arquivos relevantes (hoje/ontem)`);

  if (arquivosRecentes.length === 0) {
    throw new Error("Nenhum arquivo encontrado na ultima hora");
  }

  const usoMaximoMemoriaPorProcesso = new Map();
  const processosPorHora = new Map();
  const umaHoraAtras = Date.now() - (1 * 60 * 60 * 1000);

  function parseTimestampBR(str) {
    if (!str) {
      return null;
    }
    const partes = str.trim().split(' ');
    if (partes.length !== 2) {
      return null;
    }

    const [data, hora] = partes;
    const [ano, mes, dia] = data.split('-').map(Number);
    const [h, m, s] = hora.split(':').map(Number);

    const date = new Date(ano, mes - 1, dia, h, m, s || 0);
    return isNaN(date.getTime()) ? null : date;
  }

  //Faz a formatação do horario para o padrão brasileiro e converte para float
  function parseFloatBR(str) {
    if (!str) return 0;
    const limpo = str.toString().trim().replace('.', '').replace(',', '.');
    return parseFloat(limpo) || 0;
  }

  function gerarChaveIntervalo(ts) {
    if (!ts) return null;

    // Obter o minuto e arredondar para o múltiplo de 5 mais próximo (inferior)
    const minutoOriginal = ts.getMinutes();
    const minutoArredondado = Math.floor(minutoOriginal / 5) * 5;

    // Criar a chave no formato "HH:MM"
    const hora = ts.getHours().toString().padStart(2, '0');
    const minutoFormatado = String(minutoArredondado).padStart(2, '0');

    return `${hora}:${minutoFormatado}`;
  }

  for (const arquivo of arquivosRecentes) {
    const texto = await baixarArquivo(bucket, arquivo.Key);
    const linhas = parseCSV(texto);

    console.log("=== DEBUG PRIMEIRAS 3 LINHAS DO CSV ===");
    linhas.slice(0, 3).forEach((l, i) => {
      console.log(`Linha ${i}:`, l);
      console.log("timestamp bruto:", l.timestamp);
      console.log("timestamp tratado:", l.timestamp?.trim().replace(' ', 'T'));
      console.log("Date result:", new Date(l.timestamp?.trim().replace(' ', 'T')));
    });
    console.log("=== FIM DEBUG ====");

    for (const linha of linhas) {
      const tsRaw = linha.TIMESTAMP || linha.timestamp || linha.Timestamp;
      const nomeRaw = linha.NOME || linha.Nome || linha.nome;
      const memoriaRaw = linha["USO_MEMORIA (MB)"] || linha["USO_MEMORIA_MB"];

      if (!tsRaw) continue;

      const ts = parseTimestampBR(tsRaw);
      if (!ts || ts.getTime() < umaHoraAtras) continue;

      const nome = (nomeRaw || "Desconhecido").trim();
      const memoria = parseFloatBR(memoriaRaw);

      // Pico de memória
      const atual = usoMaximoMemoriaPorProcesso.get(nome) || 0;
      if (memoria > atual) {
        usoMaximoMemoriaPorProcesso.set(nome, memoria);
      }

      // Por hora
      const intervalo = gerarChaveIntervalo(ts);
      if (intervalo) {
        processosPorHora.set(intervalo, (processosPorHora.get(intervalo) || 0) + 1);
      }
    }
  }

  if (usoMaximoMemoriaPorProcesso.size === 0) {
    throw new Error("Nenhum dado encontrado na ultima hora");
  }

  console.log(`Processados ${usoMaximoMemoriaPorProcesso.size} processos únicos com sucesso!`);
  return montarResultadoDashboard(usoMaximoMemoriaPorProcesso, processosPorHora);
}

module.exports = { lerArquivo };


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

//baixa o arquivo do S3 e retorna o conteúdo como string
async function baixarArquivo(bucket, key) {
  const { Body } = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  return Body.toString('utf-8').trim();
}

//Converte CSV separado por ; (com ou sem aspas)
function parseCSV(texto) {
  const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (linhas.length === 0) return [];

  const cabecalho = linhas[0].split(';').map(h => h.replace(/^"|"$/g, '').trim().toUpperCase());
  const dados = [];

  for (let i = 1; i < linhas.length; i++) {
    const colunas = parseLinhaCSV(linhas[i]);
    if (colunas.length !== cabecalho.length) continue;

    const registro = {};
    let temDados = false;
    for (let j = 0; j < cabecalho.length; j++) {
      const valor = colunas[j].replace(/^"|"$/g, '').trim();
      registro[cabecalho[j]] = valor;
      if (valor) {
        temDados = true;
      }
    }
    if (temDados && registro.NOME) {
      dados.push(registro);
    }
  }
  return dados;
}

//faz todo o trabalho de tratamento de cada linha CSV com ; e aspas
function parseLinhaCSV(linha) {
  const valores = [];
  let atual = '';
  let aspas = false;

  for (let char of linha + ';') { // adiciona ; no final pra fechar o último campo
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

//pega a hora formatada HH:00 de uma linha
function extrairHora(linha) {
  const colunas = Object.keys(linha);
  const colunaTempo = colunas.find(c => /TIMESTAMP|DATA|HORA/i.test(c));
  if (!colunaTempo) return null;

  const match = linha[colunaTempo].match(/(\d{1,2}):\d{2}/);
  return match ? match[1].padStart(2, '0') + ':00' : null;
}

//prepara o resultado final para o dashboard
function montarResultadoDashboard(memoriaMap, horaMap) {
  //Top 5 processos que mais consumiram memória
  const top5 = [...memoriaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const horariosIntervalos = [...horaMap.keys()].sort((a, b) => {
    // Converte HH:MM para um valor numérico de minutos para garantir a ordenação cronológica
    const [hA, mA] = a.split(':').map(Number);
    const [hB, mB] = b.split(':').map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  });

  const quantidades = horariosIntervalos.map(h => horaMap.get(h) || 0);

  const totalHoras = quantidades.length;
  const soma = quantidades.reduce((a, b) => a + b, 0);
  const media = totalHoras > 0 ? Math.round(soma / totalHoras) : 0;
  const maximo = totalHoras > 0 ? Math.max(...quantidades) : 0;

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