var express = require("express");
var router = express.Router();

var estadoController = require("../controllers/estadoController");

router.get("/listar", function (req, res) {
    estadoController.listarEstados(req, res);
});

module.exports = router;
