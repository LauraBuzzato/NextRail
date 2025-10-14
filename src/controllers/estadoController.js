var estadoModel = require("../models/estadoModel");

function listarEstados(req, res) {
    estadoModel.listarEstados()
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum estado encontrado!");
            }
        })
        .catch((erro) => {
            console.error("Erro ao listar estados:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listarEstados
};
