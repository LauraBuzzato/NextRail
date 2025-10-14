var database = require("../database/config");

function listarEstados() {
    var instrucao = `
        SELECT id, nome, sigla
        FROM estado
        ORDER BY nome;
    `;

    console.log("Executando SQL:", instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listarEstados
};
