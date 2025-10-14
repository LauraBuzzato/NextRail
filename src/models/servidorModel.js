var database = require("../database/config");

function listarEmpresas() {
  var instrucaoSql = `
        SELECT id, razao_social FROM empresa;
    `;
  console.log("Executando SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarTipos() {
  var instrucaoSql = `
        SELECT id, nome FROM tipo;
    `;
  console.log("Executando SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarSO() {
  var instrucaoSql = `
        SELECT id, descricao FROM sistema_operacional;
    `;
  console.log("Executando SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrarServidor(nome, fk_tipo, fk_so, fk_empresa, logradouro, cep, numero, complemento, fk_estado) {
    
    const complementoValue = complemento || null;
    
    var instrucaoEndereco = `
        INSERT INTO endereco (logradouro, cep, numero, complemento, fk_estado) 
        VALUES ('${logradouro}', '${cep}', '${numero}', ${complementoValue ? `'${complementoValue}'` : 'NULL'}, ${fk_estado});
    `;
    
    console.log("Executando SQL Endereço: \n" + instrucaoEndereco);
    
    return database.executar(instrucaoEndereco)
        .then(resultadoEndereco => {
            const fk_endereco = resultadoEndereco.insertId;
            console.log("ID do endereço criado:", fk_endereco);
            
            var instrucaoServidor = `
                INSERT INTO servidor (nome, fk_tipo, fk_so, fk_endereco, fk_empresa) 
                VALUES ('${nome}', ${fk_tipo}, ${fk_so}, ${fk_endereco}, ${fk_empresa});
            `;
            
            console.log("Executando SQL Servidor: \n" + instrucaoServidor);
            return database.executar(instrucaoServidor);
        })
        .catch(erro => {
            console.error("Erro no cadastro do servidor:", erro);
            throw erro;
        });
}

module.exports = {
  listarEmpresas,
  listarTipos,
  listarSO,
  cadastrarServidor
};