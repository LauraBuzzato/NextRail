const express = require('express');
const router = express.Router();

const s3Controller = require('../controllers/s3Controller');

router.get('/processos', async (req, res) => {
  try {
    const dados = await s3Controller.lerArquivo(); 
    res.json(dados);
  } catch (err) {
    const errorMessage = err.message.includes('Arquivo S3 não encontrado') 
                         ? 'Não foi possível encontrar o arquivo de dados mais recente no S3.' 
                         : 'Não foi possível carregar os dados do S3.';
                         
    console.error('Falha na rota /api/processos:', err.message);
    res.status(500).json({ erro: errorMessage });
  }
});

module.exports = router;