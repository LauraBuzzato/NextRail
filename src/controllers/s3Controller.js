const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

async function lerArquivo(servidor) {
  if (!servidor) {
    throw new Error("Servidor não informado");
  }

  const bucket = process.env.S3_BUCKET;
  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const prefixo = `ViaMobilidade/${servidor}/processos/`;

  const arquivos = await listarArquivos(bucket, prefixo);

  const arquivosRecentes = arquivos
    .filter(a => a.Key && !a.Key.endsWith('/') && a.Size > 0)
    .filter(a => a.LastModified >= ontem)
    .sort((a, b) => b.LastModified - a.LastModified);

  if (arquivosRecentes.length === 0) {
    throw new Error("Nenhum arquivo encontrado nas últimas 24 horas");
  }

  console.log(`Encontrados ${arquivosRecentes.length} arquivos recentes`);

  const usoMaximoMemoriaPorProcesso = new Map();
  const processosPorHora = new Map();

  for (const arquivo of arquivosRecentes) {
    const texto = await baixarArquivo(bucket, arquivo.Key);
    const linhasDeDados = parseCSV(texto);

    if (linhasDeDados.length > 0) {
      const hora = extrairHora(linhasDeDados[0]);
      if (hora) {
        processosPorHora.set(
          hora,
          (processosPorHora.get(hora) || 0) + linhasDeDados.length
        );
      }
    }

    for (const linha of linhasDeDados) {
      const nome = (linha.NOME || "Desconhecido").trim();
      const memoria = parseFloat(linha["USO_MEMORIA (MB)"]) || 0;

      if (memoria > (usoMaximoMemoriaPorProcesso.get(nome) || 0)) {
        usoMaximoMemoriaPorProcesso.set(nome, memoria);
      }
    }
  }

  return montarResultadoDashboard(
    usoMaximoMemoriaPorProcesso,
    processosPorHora
  );
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
      if (valor) temDados = true;
    }
    if (temDados && registro.NOME) dados.push(registro);
  }
  return dados;
}

//Trata linhas CSV com campos entre aspas e ponto-e-vírgula
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

function extrairHora(linha) {
  const colunas = Object.keys(linha);
  const colunaTempo = colunas.find(c => /TIMESTAMP|DATA|HORA/i.test(c));
  if (!colunaTempo) return null;

  const match = linha[colunaTempo].match(/(\d{1,2}):\d{2}/);
  return match ? match[1].padStart(2, '0') + ':00' : null;
}

function montarResultadoDashboard(memoriaMap, horaMap) {
  //Top 5 processos que mais consumiram memória
  const top5 = [...memoriaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  //Horários ordenados e quantidade de processos por hora
  const horas = [...horaMap.keys()].sort();
  const quantidades = horas.map(h => horaMap.get(h) || 0);

  const totalHoras = quantidades.length;
  const soma = quantidades.reduce((a, b) => a + b, 0);
  const media = totalHoras > 0 ? Math.round(soma / totalHoras) : 0;
  const maximo = totalHoras > 0 ? Math.max(...quantidades) : 0;

  return {
    labelsMemoria: top5.map(([nome]) => nome),
    memoriaMB: top5.map(([, mb]) => mb),
    horarios: horas,
    processos24h: quantidades,
    maximoProcessos: maximo,
    mediaProcessos: media,
    processoMaisFrequente: top5[0]?.[0] || 'N/A'
  };
}
