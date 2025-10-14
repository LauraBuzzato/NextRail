var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.get("/listarEmpresas", servidorController.listarEmpresas);
router.get("/listarTipos", servidorController.listarTipos);
router.get("/listarSO", servidorController.listarSO);
router.post("/cadastrar", servidorController.cadastrarServidor);

module.exports = router;