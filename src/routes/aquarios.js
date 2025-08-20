var express = require("express");
var router = express.Router();

var aquarioController = require("../controllers/aquarioController");


router.post("/cadastrar", function (req, res) {
  aquarioController.cadastrar(req, res);
})

module.exports = router;