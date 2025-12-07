const express = require('express');
const router = express.Router();
const s3Controller = require('../controllers/s3Controller');

router.get('/processos', async (req, res) => {
  try {
    const servidor = req.query.servidor;

    if (!servidor) {
      return res.status(400).json({ 
        erro: 'Parâmetro "servidor" é obrigatório' 
      });
    }

    console.log(`[s3Route] Buscando dados do servidor: ${servidor}`);

    const dados = await s3Controller.lerArquivo(servidor);

    res.json(dados);

  } catch (err) {
    console.error("Erro na rota /api/processos:", err);

    const statusCode = err.message.includes('não encontrado') ? 404 : 500;
    const errorMessage = err.message || 'Não foi possível carregar os dados do S3.';

    res.status(statusCode).json({ erro: errorMessage });
  }
});

module.exports = router;