const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

function parsCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 1) return { headers: [], rows: [] };

  const headerLine = lines[0].trim();
  const headers = headerLine
    .split(';')
    .map(h => h.trim().replace(/^"|"$/g, '').toUpperCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line + ';') {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        values.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (values.length !== headers.length) continue;

    const row = {};
    let hasValue = false;
    for (let j = 0; j < headers.length; j++) {
      const val = values[j];
      row[headers[j]] = val;
      if (val !== '') hasValue = true;
    }

    if (hasValue && row.NOME) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

function transformarDadosParaDashboard(dadosBrutos) {
  if (!dadosBrutos || dadosBrutos.length === 0) {
    return {
      labelsMemoria: [],
      memoriaMB: [],
      horarios: [],
      processos24h: [],
      maximoProcessos: 0,
      mediaProcessos: 0,
      processoMaisFrequente: 'N/A'
    };
  }

  const primeira = dadosBrutos[0];
  const colNome = Object.keys(primeira).find(k => /NOME/i.test(k)) || 'NOME';
  const colMem = Object.keys(primeira).find(k => /MEMORIA|USO/i.test(k));
  const colTs = Object.keys(primeira).find(k => /TIMESTAMP|DATA|HORA/i.test(k));

  if (!colMem || !colNome) {
    throw new Error('Colunas obrigatórias não encontradas: NOME ou MEMORIA/USO');
  }

  const memoriaPorProcesso = new Map();
  const contagemPorHora = new Map();
  let totalProcessos = 0;

  for (const row of dadosBrutos) {
    const nome = String(row[colNome] || '').trim() || 'Desconhecido';
    const memoria = parseFloat(row[colMem]) || 0;

    if (memoria > (memoriaPorProcesso.get(nome) || 0)) {
      memoriaPorProcesso.set(nome, memoria);
    }

    if (colTs && row[colTs]) {
      const horaMatch = String(row[colTs]).match(/(\d{1,2}):\d{2}/);
      if (horaMatch) {
        const hora = horaMatch[1].padStart(2, '0') + ':00';
        contagemPorHora.set(hora, (contagemPorHora.get(hora) || 0) + 1);
        totalProcessos++;
      }
    }
  }

  const top5 = [...memoriaPorProcesso.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const horasOrdenadas = [...contagemPorHora.keys()].sort();
  const processosPorHora = horasOrdenadas.map(h => contagemPorHora.get(h));

  const somaProcessos = processosPorHora.reduce((a, b) => a + b, 0);
  const mediaProcessos = processosPorHora.length > 0
    ? Math.round(somaProcessos / processosPorHora.length)
    : totalProcessos;

  return {
    labelsMemoria: top5.map(([nome]) => nome),
    memoriaMB: top5.map(([, uso]) => uso),
    horarios: horasOrdenadas,
    processos24h: processosPorHora,
    maximoProcessos: processosPorHora.length > 0 ? Math.max(...processosPorHora) : totalProcessos,
    mediaProcessos,
    processoMaisFrequente: top5[0]?.[0] || 'N/A'
  };
}

async function lerArquivo() {
  const bucket = process.env.S3_BUCKET;
  const agora = new Date();
  const vinteQuatroHAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

  let arquivos = [];
  let continuationToken = null;
  do {
    const params = {
      Bucket: bucket,
      Prefix: 'ViaMobilidade/Servidor01/Processos/',
      MaxKeys: 1000,
      ...(continuationToken && { ContinuationToken: continuationToken })
    };
    const { Contents, IsTruncated, NextContinuationToken } = await s3.listObjectsV2(params).promise();
    arquivos = arquivos.concat(Contents || []);
    continuationToken = NextContinuationToken;
  } while (continuationToken);

  const arquivosValidos = arquivos
    .filter(obj => 
      obj.Key && !obj.Key.endsWith('/') && obj.Size > 0 &&
      new Date(obj.LastModified) >= vinteQuatroHAtras
    )
    .sort((a, b) => b.LastModified - a.LastModified);

  if (arquivosValidos.length === 0) throw new Error('Nenhum arquivo das últimas 24h');

  console.log(`Lidos ${arquivosValidos.length} arquivos das últimas 24h`);

  let todosDados = [];
  let memoriaPorProcessoGlobal = new Map();
  const contagemPorHora = new Map();

  for (const arquivo of arquivosValidos) {
    const { Body } = await s3.getObject({ Bucket: bucket, Key: arquivo.Key }).promise();
    const texto = Body.toString('utf-8').trim();
    const { rows } = parsCSV(texto);

    if (rows.length === 0) continue;

    todosDados.push(...rows);

    const primeiroTs = rows[0][Object.keys(rows[0]).find(k => /TIMESTAMP/i.test(k))];
    const horaMatch = primeiroTs.match(/(\d{1,2}):/);
    if (horaMatch) {
      const hora = horaMatch[1].padStart(2, '0') + ':00';
      contagemPorHora.set(hora, (contagemPorHora.get(hora) || 0) + rows.length);
    }

    for (const row of rows) {
      const nome = row.NOME?.trim() || 'Desconhecido';
      const mem = parseFloat(row['USO_MEMORIA (MB)']) || 0;
      memoriaPorProcessoGlobal.set(nome, Math.max(memoriaPorProcessoGlobal.get(nome) || 0, mem));
    }
  }

  const horasOrdenadas = [...contagemPorHora.keys()].sort();
  const processosPorHora = horasOrdenadas.map(h => contagemPorHora.get(h));
  const maximoProcessos = Math.max(...processosPorHora, 0);
  const mediaProcessos = processosPorHora.length > 0 ? Math.round(processosPorHora.reduce((a, b) => a + b, 0) / processosPorHora.length) : 0;

  const top5 = [...memoriaPorProcessoGlobal.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labelsMemoria: top5.map(([nome]) => nome),
    memoriaMB: top5.map(([, uso]) => uso),
    horarios: horasOrdenadas,
    processos24h: processosPorHora,
    maximoProcessos,
    mediaProcessos,
    processoMaisFrequente: top5[0]?.[0] || 'N/A'
  };
}
module.exports = { lerArquivo };
