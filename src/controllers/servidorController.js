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

function listarServidores(req, res) {
  servidorModel.listarServidores()
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

function criarComponentesServidor(req, res) {
    var servidorId = req.params.servidorId;

    if (!servidorId) {
        res.status(400).send("ID do servidor não informado!");
        return;
    }

    servidorModel.criarComponentesServidor(servidorId)
        .then(resultado => {
            res.json({ 
                success: true, 
                message: 'Componentes criados com sucesso!',
                resultado: resultado
            });
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json({ 
                success: false, 
                message: erro.sqlMessage || 'Erro ao criar componentes' 
            });
        });
}

function atualizarConfiguracaoAlerta(req, res) {
    var { 
        servidorId, 
        configuracoes 
    } = req.body;

    if (!servidorId || !configuracoes) {
        res.status(400).json({ 
            success: false, 
            message: "Dados incompletos para atualização!" 
        });
        return;
    }

    console.log("Recebendo configurações para servidor:", servidorId, configuracoes);

    servidorModel.atualizarConfiguracaoAlerta(servidorId, configuracoes)
        .then(resultado => {
            res.json({ 
                success: true, 
                message: 'Todas as configurações atualizadas com sucesso!',
                affectedRows: resultado.length
            });
        })
        .catch(erro => {
            console.log("Erro no controller:", erro);
            res.status(400).json({ 
                success: false, 
                message: erro.message || 'Erro ao atualizar configurações' 
            });
        });
}

function buscarConfiguracoesServidor(req, res) {
    var servidorId = req.params.servidorId;

    if (!servidorId) {
        res.status(400).send("ID do servidor não informado!");
        return;
    }

    servidorModel.buscarConfiguracoesServidor(servidorId)
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
  listarServidores,
  cadastrarServidor,
   criarComponentesServidor,
  atualizarConfiguracaoAlerta,
  buscarConfiguracoesServidor
};
