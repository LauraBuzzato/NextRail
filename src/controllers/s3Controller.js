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

    for (let char of line + ';') { // +';' garante fechar última coluna
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        values.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (values.length !== headers.length) continue; // linha malformada

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

  const memoriaPorProcesso = new Map(); // mais rápido que objeto com chaves dinâmicas
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

  // Top 5 processos por memória
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
  if (!bucket) throw new Error('Variável S3_BUCKET não configurada');


  const { Contents } = await s3.listObjectsV2({
    Bucket: bucket,
    MaxKeys: 10
  }).promise();

  if (!Contents || Contents.length === 0) {
    throw new Error('Bucket vazio');
  }

  // Arquivo mais recente (não diretório)
  const arquivoMaisRecente = Contents
    .filter(obj => obj.Key && !obj.Key.endsWith('/'))
    .sort((a, b) => (b.LastModified || 0) - (a.LastModified || 0))[0];

  if (!arquivoMaisRecente) {
    throw new Error('Nenhum arquivo encontrado');
  }

  const { Body } = await s3.getObject({
    Bucket: bucket,
    Key: arquivoMaisRecente.Key
  }).promise();

  const texto = Body.toString('utf-8').trim();
  if (!texto) throw new Error('Arquivo vazio');

  const { rows } = parseCSV(texto);

  if (rows.length === 0) {
    console.warn('Nenhum dado válido após parsing');
    return {
      labelsMemoria: [], memoriaMB: [], horarios: [], processos24h: [],
      maximoProcessos: 0, mediaProcessos: 0, processoMaisFrequente: 'N/A'
    };
  }

  return transformarDadosParaDashboard(rows);
}

module.exports = { lerArquivo };
