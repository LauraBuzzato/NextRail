const { S3Client } = require('@aws-sdk/client-s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const Papa = require('papaparse');

// Configuração do cliente S3
const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN || undefined
    }
});

async function lerArquivo(req, res) {
  try {
    const fileKey = req.params.arquivo;

    if (!/^[\w.\-]+$/.test(fileKey)) {
      return res.status(400).send('Nome de arquivo inválido.');
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey
    });

    console.log(`Lendo do S3: ${process.env.S3_BUCKET}/${fileKey}`);

    const response = await s3.send(command);
    const text = await streamToString(response.Body);

    let content;
    if (text.startsWith('[') || text.startsWith('{')) {
      content = JSON.parse(text);
    } else {
      const parsed = Papa.parse(text, {
        header: true,
        delimiter: text.includes(';') ? ';' : ',',
        skipEmptyLines: true
      });
      content = parsed.data;
    }

    res.json(content);
  } catch (err) {
    console.error('Erro ao buscar arquivo:', err.message);
    res.status(500).send('Erro ao buscar arquivo: ' + err.message);
  }
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

module.exports = {
  lerArquivo
};