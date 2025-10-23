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

function selecionarServidores(fkEmpresa) {
    var instrucaoSql = `
        SELECT sv.nome AS servidor,tipo.nome AS tipo,so.descricao AS so,es.sigla AS estado,en.logradouro,en.numero,en.complemento 
        FROM servidor sv 
        INNER JOIN tipo ON tipo.id=sv.fk_tipo 
        INNER JOIN sistema_operacional so ON so.id=sv.fk_so 
        INNER JOIN endereco en ON en.id=sv.fk_endereco 
        INNER JOIN estado es ON es.id=en.fk_estado 
        WHERE fk_empresa=${fkEmpresa}
        ORDER BY servidor;
    `;
    console.log("Executando SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarServidores() {
    var instrucaoSql = `
        SELECT 
            s.id,
            s.nome,
            t.nome as tipo,
            so.descricao as sistema_operacional,
            s.fk_empresa
        FROM servidor s
        INNER JOIN tipo t ON s.fk_tipo = t.id
        INNER JOIN sistema_operacional so ON s.fk_so = so.id
        ORDER BY s.nome;
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
        .then(resultadoServidor => {
            const servidorId = resultadoServidor.insertId;
            console.log("ID do servidor criado:", servidorId);

            return criarComponentesServidor(servidorId)
                .then(() => resultadoServidor);
        })
        .catch(erro => {
            console.error("Erro no cadastro do servidor:", erro);
            throw erro;
        });
}
function criarComponentesServidor(servidorId) {
    // Mapeamento dos componentes para os IDs da tabela tipo_componente
    // 1: 'Cpu', 2: 'Ram', 3: 'Disco'
    const componentes = [
        { nome: 'CPU', id: 1, metricaNome: 'Uso de CPU' },
        { nome: 'Memória RAM', id: 2, metricaNome: 'Uso de Memória' },
        { nome: 'Disco Rígido', id: 3, metricaNome: 'Espaço em Disco' }
    ];

    // IDs de gravidade, conforme a tabela gravidade
    // 1: 'Baixo', 2: 'Médio', 3: 'Alto'
    const gravidades = [1, 2, 3];

    let promises = [];

    componentes.forEach(componente => {
        // 1. INSERIR NA TABELA componente_servidor
        // A inserção é feita uma vez para cada tipo de componente (CPU, RAM, Disco)
        var instrucaoComponente = `
            INSERT INTO componente_servidor (fk_servidor, fk_tipo_componente) 
            VALUES (${servidorId}, ${componente.id});
        `;

        // A Promise agora faz a inserção do componente E, em seguida, as métricas
        const componentePromise = database.executar(instrucaoComponente)
            .then(() => {
                console.log(`Componente ${componente.nome} (ID ${componente.id}) criado para o Servidor ${servidorId}.`);

                let metricasPromises = [];

                // 2. INSERIR NA TABELA metrica
                gravidades.forEach(gravidadeId => {
                    var instrucaoMetrica = `
                        INSERT INTO metrica (
                            fk_gravidade, 
                            nome, 
                            valor, 
                            fk_componenteServidor_servidor, 
                            fk_componenteServidor_tipoComponente
                        ) 
                        VALUES (${gravidadeId}, '${componente.metricaNome}', 0, ${servidorId}, ${componente.id}
                        );
                    `;
                    metricasPromises.push(database.executar(instrucaoMetrica));
                });
                return Promise.all(metricasPromises);
            })
            .catch(erro => {
                console.error(`Erro ao criar componente ou métricas para ${componente.nome} no Servidor ${servidorId}:`, erro);
                throw erro;
            });

        promises.push(componentePromise);
    });

    return Promise.all(promises);
}


function atualizarConfiguracaoAlerta(servidorId, configuracoes) {
    return new Promise(async (resolve, reject) => {
        try {
            const validarOrdem = (baixo, medio, alto, componente) => {
                if (parseInt(baixo) >= parseInt(medio)) {
                    throw new Error(`${componente}: Valor BAIXO (${baixo}%) deve ser menor que MÉDIO (${medio}%)`);
                }
                if (parseInt(medio) >= parseInt(alto)) {
                    throw new Error(`${componente}: Valor MÉDIO (${medio}%) deve ser menor que ALTO (${alto}%)`);
                }
                if (parseInt(baixo) >= parseInt(alto)) {
                    throw new Error(`${componente}: Valor BAIXO (${baixo}%) deve ser menor que ALTO (${alto}%)`);
                }
            };

            if (configuracoes.cpu) {
                validarOrdem(configuracoes.cpu.baixo, configuracoes.cpu.medio, configuracoes.cpu.alto, 'CPU');
            }
            if (configuracoes.ram) {
                validarOrdem(configuracoes.ram.baixo, configuracoes.ram.medio, configuracoes.ram.alto, 'RAM');
            }
            if (configuracoes.disco) {
                validarOrdem(configuracoes.disco.baixo, configuracoes.disco.medio, configuracoes.disco.alto, 'Disco');
            }

            var instrucaoComponentes = `
                SELECT id, nome_tipo_componente as nome FROM tipo_componente tc
                INNER JOIN componente_servidor cs ON tc.id = cs.fk_tipo_componente
                WHERE fk_servidor = ${servidorId};
            `;

            const componentes = await database.executar(instrucaoComponentes);

            if (componentes.length === 0) {
                throw new Error('Nenhum componente encontrado para este servidor');
            }

            let queries = [];

            componentes.forEach(componente => {
                let configComponente;
                let nomeMetrica;

                if (componente.nome === 'Cpu') {
                    configComponente = configuracoes.cpu;
                    nomeMetrica = 'Uso de CPU';
                } else if (componente.nome === 'Ram') {
                    configComponente = configuracoes.ram;
                    nomeMetrica = 'Uso de Memória';
                } else if (componente.nome === 'Disco') {
                    configComponente = configuracoes.disco;
                    nomeMetrica = 'Espaço em Disco';
                } else {
                    return;
                }

                if (configComponente && configComponente.baixo) {
                    queries.push(`
                        UPDATE metrica 
                        SET valor = ${configComponente.baixo} 
                        WHERE fk_componenteServidor_tipoComponente = ${componente.id} 
                        AND fk_gravidade = 1
                        AND nome = '${nomeMetrica}'
                    `);
                }

                if (configComponente && configComponente.medio) {
                    queries.push(`
                        UPDATE metrica 
                        SET valor = ${configComponente.medio} 
                        WHERE fk_componenteServidor_tipoComponente = ${componente.id} 
                        AND fk_gravidade = 2
                        AND nome = '${nomeMetrica}'
                    `);
                }

                if (configComponente && configComponente.alto) {
                    queries.push(`
                        UPDATE metrica 
                        SET valor = ${configComponente.alto} 
                        WHERE fk_componenteServidor_tipoComponente = ${componente.id} 
                        AND fk_gravidade = 3
                        AND nome = '${nomeMetrica}'
                    `);
                }
            });

            let results = [];
            for (let query of queries) {
                const result = await database.executar(query);
                results.push(result);
            }

            resolve(results);

        } catch (error) {
            reject(error);
        }
    });
}

function buscarConfiguracoesServidor(servidorId) {
    var instrucaoSql = `
        SELECT 
            tc.nome_tipo_componente as componente,
            g.id as gravidade_id,
            g.nome as gravidade_nome,
            m.valor
        FROM tipo_componente tc
        INNER JOIN componente_servidor cs ON tc.id = cs.fk_tipo_componente
        INNER JOIN metrica m ON m.fk_componenteServidor_servidor = cs.fk_servidor AND m.fk_componenteServidor_tipoComponente = cs.fk_tipo_componente
        INNER JOIN gravidade g ON m.fk_gravidade = g.id
        WHERE cs.fk_servidor = ${servidorId}
        ORDER BY tc.nome_tipo_componente, g.id;
    `;

    console.log("Buscando configurações do servidor: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listarEmpresas,
    listarTipos,
    listarSO,
    selecionarServidores,
    listarServidores,
    cadastrarServidor,
    criarComponentesServidor,
    atualizarConfiguracaoAlerta,
    buscarConfiguracoesServidor
};