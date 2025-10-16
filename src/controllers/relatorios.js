const relatorioModel = require('../models/relatorioModel');

function buscarDadosAnuais(req, res) {
    const ano = req.params.ano;

    if (isNaN(ano)) {
        res.status(400).send("O ano fornecido não é válido.");
        return;
    }

    console.log(`Buscando dados para o relatório anual de: ${ano}`);

    relatorioModel.buscarDadosAnuais(ano)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar os dados do relatório! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}


module.exports = {
    buscarDadosAnuais
};
