var express = require('express');
var router = express.Router();

var relatorioController = require('../controllers/relatorios');

router.get('/anual/:ano', function (req, res) {
    relatorioController.buscarDadosAnuais(req, res);
});

module.exports = router;
