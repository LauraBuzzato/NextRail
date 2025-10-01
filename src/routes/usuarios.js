var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.post("/procurarCargos", function (req, res) {
    usuarioController.procurarCargos(req, res);
});

router.post("/buscarUsuarios", function (req, res) {
    usuarioController.buscarUsuarios(req, res);
});

router.post("/excluir", function (req, res) {
    usuarioController.excluir(req, res);
});

module.exports = router;