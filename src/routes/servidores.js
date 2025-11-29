var express = require("express");
var router = express.Router();

var servidorController = require("../controllers/servidorController");

router.get("/listarEmpresas", servidorController.listarEmpresas);
router.get("/listarTipos", servidorController.listarTipos);
router.get("/listarSO", servidorController.listarSO);
router.post("/listarAlertas", servidorController.listarAlertas);
router.post("/selecionarServidores", servidorController.selecionarServidores)
router.get("/listarServidores", servidorController.listarServidores);
router.post("/cadastrar", servidorController.cadastrarServidor);
router.post("/criarComponentesServidor", servidorController.criarComponentesServidor);
router.post("/atualizarConfiguracaoAlerta", servidorController.atualizarConfiguracaoAlerta);
router.get("/configuracoes/:servidorId", servidorController.buscarConfiguracoesServidor);
router.post("/carregarComponentes", servidorController.carregarComponentes);
router.post("/listartop3", servidorController.listartop3);
router.post("/contarAlertas", servidorController.contarAlertas);
router.post("/buscarAlertasComponenteEspecifico", servidorController.buscarAlertasComponenteEspecifico);
router.post("/buscarPosicaoRank", servidorController.buscarPosicaoRank);
router.post("/buscarMetricas", servidorController.buscarMetricas);
router.post("/pegarFrequencia", servidorController.pegarFrequencia);
router.post("/atualizarConfiguracaoScript", servidorController.atualizarConfiguracaoScript);
router.post("/listarIncidentes", servidorController.listarIncidentes);
router.get("/buscarAlertasDoServidor/:servidorId", servidorController.buscarAlertasDoServidor);
router.get("/buscarParametrosDoServidor/:servidorId/:componente", servidorController.buscarParametrosDoServidor);
router.get("/paramsNomes/:fk_servidor", servidorController.paramsNomes);
router.get("/pegarUso/:empresa/:servidorNome", servidorController.pegarUso);
router.post("/pegarPrevisao", servidorController.pegarPrevisao);
router.post("/atualizarSla", servidorController.atualizarConfiguracaoSla);


router.get("/script/:servidorId", servidorController.buscarScriptServidor);
router.post("/buscarAlertasHistorico", servidorController.buscarAlertasHistorico);

router.get("/uso", function (req, res) {
    servidorController.pegarUso(req, res);
});

router.get("/dados", function (req, res) {
    servidorController.listarDadosAlertas(req, res);
});

module.exports = router;
