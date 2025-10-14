var servidorModel = require("../models/servidorModel");

function listarEmpresas(req, res) {
  servidorModel.listarEmpresas()
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

function listarTipos(req, res) {
  servidorModel.listarTipos()
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

function listarSO(req, res) {
  servidorModel.listarSO()
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

function cadastrarServidor(req, res) {
  var { 
    nome, 
    fk_tipo, 
    fk_so, 
    fk_empresa,
    logradouro,
    cep,
    numero,
    complemento,
    fk_estado
  } = req.body;

  if (!nome || !fk_tipo || !fk_so || !fk_empresa || !logradouro || !cep || !numero || !fk_estado) {
    res.status(400).send("Campos obrigatórios não preenchidos!");
    return;
  }

  servidorModel.cadastrarServidor(nome, fk_tipo, fk_so, fk_empresa, logradouro, cep, numero, complemento, fk_estado)
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
  listarEmpresas,
  listarTipos,
  listarSO,
  cadastrarServidor
};
