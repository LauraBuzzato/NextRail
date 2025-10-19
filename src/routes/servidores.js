var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.get("/listarEmpresas", servidorController.listarEmpresas);
router.get("/listarTipos", servidorController.listarTipos);
router.get("/listarSO", servidorController.listarSO);
router.get("/listarServidores", servidorController.listarServidores);
router.post("/cadastrar", servidorController.cadastrarServidor);
router.post("/criarComponentesServidor", servidorController.criarComponentesServidor);
router.post("/atualizarConfiguracaoAlerta", servidorController.atualizarConfiguracaoAlerta);
router.get("/configuracoes/:servidorId", servidorController.buscarConfiguracoesServidor);

module.exports = router;