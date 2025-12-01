const express = require('express');
const router = express.Router();

const s3Controller = require('../controllers/s3Controller');

router.get('/processos', async (req, res) => {
  try {
    const servidor = req.query.servidor;

    const dados = await s3Controller.lerArquivo(servidor);

    res.json(dados);

  } catch (err) {
    console.error("Falha na rota /api/processos:", err.message);

    const errorMessage = err.message.includes('Nenhum arquivo encontrado')
      ? err.message
      : 'Não foi possível carregar os dados do S3.';

    res.status(500).json({ erro: errorMessage });
  }
});



module.exports = router;
