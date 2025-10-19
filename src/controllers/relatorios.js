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


function buscarAnosDisponiveis(req, res) {
    console.log(`Buscando a lista de anos com relatórios`);

    relatorioModel.buscarAnosDisponiveis()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar os anos! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

    function buscarMesesDisponiveis(req, res) {
        console.log(`Buscando a lista de meses com relatórios`);

        relatorioModel.buscarMesesDisponiveis()
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar os meses! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }


    function buscarDadosMensais(req, res) {
    var ano = req.params.ano;
    var mes = req.params.mes;

    if (isNaN(ano) || isNaN(mes)) {
        res.status(400).send("Ano ou mês fornecido é inválido.");
        return;
    }

    relatorioModel.buscarDadosMensais(ano, mes)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarDadosAnuais,
    buscarDadosMensais,
    buscarAnosDisponiveis,
    buscarMesesDisponiveis
};
