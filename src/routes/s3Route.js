const express = require('express');
const router = express.Router();
const path = require('path');

const s3Controller = require('../script/s3');

router.get('/dashProcessos/:arquivo', (req, res) => {
  s3Controller.lerArquivo(req, res);
});

router.get('/dashProcessos.html/:arquivo', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'dashProcessos.html'));
});

module.exports = router;
