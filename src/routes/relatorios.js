var express = require('express');
var router = express.Router();

var relatorioController = require('../controllers/relatorios');

router.get('/anual/:ano', function (req, res) {
    relatorioController.buscarDadosAnuais(req, res);
});

router.get("/anos", function (req, res) {
    relatorioController.buscarAnosDisponiveis(req, res);
});

router.get("/meses", function (req, res) {
    relatorioController.buscarMesesDisponiveis(req, res);
});

router.get("/mensal-detalhado/:ano/:mes", function (req, res) {
    relatorioController.buscarDadosMensais(req, res);
});

module.exports = router;
