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

function listarAlertas(fkEmpresa) {
    var instrucaoSql = `
        SELECT emp.razao_social AS empresa,	srv.nome AS servidor, tc.nome_tipo_componente AS componente, 
               status.descricao AS status, gv.nome AS gravidade, inicio, fim
        FROM alerta
        JOIN status ON status.id = fk_status
        JOIN gravidade gv ON gv.id = fk_gravidade
        JOIN servidor srv ON srv.id = fk_componenteServidor_servidor
        JOIN tipo_componente tc ON tc.id = fk_componenteServidor_tipoComponente
        JOIN empresa emp ON emp.id = srv.fk_empresa
        WHERE emp.id = ${fkEmpresa} and (fk_status = 2 or fk_status = 1)
        ORDER BY srv.nome, inicio;
    `;
    console.log("Executando SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function selecionarServidores(fkEmpresa) {
    var instrucaoSql = `
        SELECT sv.id as id, sv.nome AS servidor,tipo.nome AS tipo,so.descricao AS so,es.sigla AS estado,en.logradouro,en.numero,en.complemento 
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

    const componentes = [
        { nome: 'CPU', id: 1},
        { nome: 'Memória RAM', id: 2 },
        { nome: 'Disco Rígido', id: 3}
    ];
    const gravidades = [1, 2, 3];

    let promises = [];

    componentes.forEach(componente => {
        var instrucaoComponente = `
            INSERT INTO componente_servidor (fk_servidor, fk_tipo_componente) 
            VALUES (${servidorId}, ${componente.id});
        `;


        const componentePromise = database.executar(instrucaoComponente)
            .then(() => {
                console.log(`Componente ${componente.nome} (ID ${componente.id}) criado para o Servidor ${servidorId}.`);

                let metricasPromises = [];
                let nivelRecomend = 0;

                gravidades.forEach(gravidadeId => {

                    if(gravidadeId == 1){
                        nivelRecomend = 70;
                    }else if (gravidadeId == 2) {
                        nivelRecomend = 80;
                    } else {
                        nivelRecomend = 90;
                    }

                    var instrucaoMetrica = `
                        INSERT INTO metrica (
                            fk_gravidade, 
                            valor, 
                            fk_componenteServidor_servidor, 
                            fk_componenteServidor_tipoComponente
                        ) 
                        VALUES (${gravidadeId}, ${nivelRecomend}, ${servidorId}, ${componente.id});
                    `;

                    metricasPromises.push(database.executar(instrucaoMetrica));
                });
                return Promise.all(metricasPromises);
            })
            .catch(erro => {
                console.error(`Erro ao criar componente ou métricas para ${componente.id} no Servidor ${servidorId}:`, erro);
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
                } else if (componente.nome === 'Ram') {
                    configComponente = configuracoes.ram;
                } else if (componente.nome === 'Disco') {
                    configComponente = configuracoes.disco;
                } else {
                    return;
                }

                if (configComponente && configComponente.baixo) {
                    queries.push(`
                        UPDATE metrica 
                        SET valor = ${configComponente.baixo} 
                        WHERE fk_componenteServidor_tipoComponente = ${componente.id} 
                        AND fk_gravidade = 1
                        AND fk_componenteServidor_servidor = ${servidorId}
                    `);
                }

                if (configComponente && configComponente.medio) {
                    queries.push(`
                        UPDATE metrica 
                        SET valor = ${configComponente.medio} 
                        WHERE fk_componenteServidor_tipoComponente = ${componente.id} 
                        AND fk_gravidade = 2
                        AND fk_componenteServidor_servidor = ${servidorId}
                    `);
                }

                if (configComponente && configComponente.alto) {
                    queries.push(`
                        UPDATE metrica 
                        SET valor = ${configComponente.alto} 
                        WHERE fk_componenteServidor_tipoComponente = ${componente.id} 
                        AND fk_gravidade = 3
                        AND fk_componenteServidor_servidor = ${servidorId}
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

function carregarComponentes() {
    var instrucaoSql = `
        select id, nome_tipo_componente as nome from tipo_componente;`
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listartop3(fkEmpresa) {
    var instrucaoSql = `
        select count(alerta.id) as totalAlerta, ser.nome from alerta 
inner join servidor ser on alerta.fk_componenteServidor_servidor = ser.id
where fk_empresa = ${fkEmpresa}
group by fk_componenteServidor_servidor 
order by totalAlerta 
desc limit 3;`
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function contarAlertas(fkEmpresa) {
    var instrucaoSql = `
        select count(*) as totalAlerta from alerta 
inner join servidor ser on alerta.fk_componenteServidor_servidor = ser.id
where (DATE(inicio) = CURDATE()) or (DATE(inicio)<CURDATE() and fim is null) or(DATE(fim) = CURDATE()) and fk_empresa = ${fkEmpresa};`
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarAlertasComponenteEspecifico(fkEmpresa, fkComponente, periodo, fkServidor) {
    let instrucaoSql = "";

    if (periodo === "Mensal") {
        instrucaoSql = `
            SELECT 
                gra.nome,
                COUNT(alerta.id) AS total_alertas
            FROM gravidade gra
            LEFT JOIN alerta 
                ON alerta.fk_gravidade = gra.id
                AND alerta.fk_componenteServidor_tipoComponente = ${fkComponente}
                AND (
                    (
                        -- Alerta começou antes do fim do mês e terminou depois do início do mês
                        (alerta.inicio <= LAST_DAY(CURDATE())) AND 
                        (alerta.fim IS NULL OR alerta.fim >= DATE_FORMAT(CURDATE(), '%Y-%m-01'))
                    )
                )
            LEFT JOIN servidor ser 
                ON alerta.fk_componenteServidor_servidor = ser.id
            WHERE 
                ser.fk_empresa = ${fkEmpresa}
                AND ser.id = ${fkServidor}
            GROUP BY gra.nome;
        `;
    } else { // Anual
        instrucaoSql = `
            SELECT 
                gra.nome,
                COUNT(alerta.id) AS total_alertas
            FROM gravidade gra
            LEFT JOIN alerta 
                ON alerta.fk_gravidade = gra.id
                AND alerta.fk_componenteServidor_tipoComponente = ${fkComponente}
                AND (
                    (
                        alerta.inicio <= LAST_DAY(CONCAT(YEAR(CURDATE()), '-12-31')) AND 
                        (alerta.fim IS NULL OR alerta.fim >= CONCAT(YEAR(CURDATE()), '-01-01'))
                    )
                )
            LEFT JOIN servidor ser 
                ON alerta.fk_componenteServidor_servidor = ser.id
            WHERE 
                ser.fk_empresa = ${fkEmpresa}
                AND ser.id = ${fkServidor}
            GROUP BY gra.nome;
        `;
    }

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPosicaoRank(fkEmpresa, fkComponente, periodo, fkServidor) {
    let instrucaoSql = "";

    if (periodo === "Mensal") {
        instrucaoSql = `
            SELECT *
FROM (
    SELECT 
        s.id AS id_servidor,
        s.nome AS nome_servidor,
        COUNT(a.id) AS total_alertas,
        COALESCE(SUM(
            CASE g.nome
                WHEN 'Alto' THEN 3
                WHEN 'Médio' THEN 2
                WHEN 'Baixo' THEN 1
                ELSE 0
            END
        ), 0) AS pontuacao_gravidade,
        ROW_NUMBER() OVER (
            ORDER BY 
                COUNT(a.id) DESC, 
                COALESCE(SUM(
                    CASE g.nome
                        WHEN 'Alto' THEN 3
                        WHEN 'Médio' THEN 2
                        WHEN 'Baixo' THEN 1
                        ELSE 0
                    END
                ), 0) DESC
        ) AS posicao_ranking
    FROM servidor s
    JOIN componente_servidor cs 
        ON s.id = cs.fk_servidor
    LEFT JOIN alerta a 
        ON a.fk_componenteServidor_servidor = cs.fk_servidor
        AND a.fk_componenteServidor_tipoComponente = cs.fk_tipo_componente
        AND a.fk_componenteServidor_tipoComponente = ${fkComponente}
        AND (
            (
                MONTH(a.inicio) = MONTH(CURDATE()) 
                AND YEAR(a.inicio) = YEAR(CURDATE())
            )
            OR (
                MONTH(a.fim) = MONTH(CURDATE()) 
                AND YEAR(a.fim) = YEAR(CURDATE())
            )
            OR (a.inicio < CURDATE() AND a.fim IS NULL)
        )
    LEFT JOIN gravidade g ON a.fk_gravidade = g.id
    WHERE s.fk_empresa = ${fkEmpresa}
    GROUP BY s.id
) ranking
WHERE ranking.id_servidor = ${fkServidor};
        `;
    } else { // Anual
        instrucaoSql = `
            SELECT *
FROM (
    SELECT 
        s.id AS id_servidor,
        s.nome AS nome_servidor,
        COUNT(a.id) AS total_alertas,
        COALESCE(SUM(
            CASE g.nome
                WHEN 'Alto' THEN 3
                WHEN 'Médio' THEN 2
                WHEN 'Baixo' THEN 1
                ELSE 0
            END
        ), 0) AS pontuacao_gravidade,
        ROW_NUMBER() OVER (
            ORDER BY 
                COUNT(a.id) DESC, 
                COALESCE(SUM(
                    CASE g.nome
                        WHEN 'Alto' THEN 3
                        WHEN 'Médio' THEN 2
                        WHEN 'Baixo' THEN 1
                        ELSE 0
                    END
                ), 0) DESC
        ) AS posicao_ranking
    FROM servidor s
    JOIN componente_servidor cs 
        ON s.id = cs.fk_servidor
    LEFT JOIN alerta a 
        ON a.fk_componenteServidor_servidor = cs.fk_servidor
        AND a.fk_componenteServidor_tipoComponente = cs.fk_tipo_componente
        AND a.fk_componenteServidor_tipoComponente = ${fkComponente}
        AND (
            (
                YEAR(a.inicio) = YEAR(CURDATE())
            )
            OR (
                YEAR(a.fim) = YEAR(CURDATE())
            )
            OR (a.inicio < CURDATE() AND a.fim IS NULL)
        )
    LEFT JOIN gravidade g ON a.fk_gravidade = g.id
    WHERE s.fk_empresa = ${fkEmpresa}
    GROUP BY s.id
) ranking
WHERE ranking.id_servidor = ${fkServidor};
        `;
    }

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarMetricas(fkEmpresa, fkComponente, fkServidor) {
    var instrucaoSql = `
        SELECT 
    m.id,
    m.valor,
    g.nome AS nome_gravidade,
    s.nome AS nome_servidor,
    tc.nome_tipo_componente AS nome_componente,
    e.razao_social AS empresa
FROM metrica m
JOIN gravidade g 
    ON m.fk_gravidade = g.id
JOIN componente_servidor cs 
    ON cs.fk_servidor = m.fk_componenteServidor_servidor
   AND cs.fk_tipo_componente = m.fk_componenteServidor_tipoComponente
JOIN servidor s 
    ON s.id = cs.fk_servidor
JOIN tipo_componente tc
    ON tc.id = cs.fk_tipo_componente
JOIN empresa e
    ON e.id = s.fk_empresa
WHERE e.id = ${fkEmpresa}
  AND s.id = ${fkServidor}
  AND tc.id = ${fkComponente};
    `;

    console.log("Buscando configurações do servidor: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function pegarFrequencia(fkEmpresa, fkComponente, periodo, fkServidor) {
    let instrucaoSql = "";

    if (periodo === "Mensal") {
        instrucaoSql = `
            SELECT
    a.fk_componenteServidor_servidor AS servidor,
    SUM(TIMESTAMPDIFF(SECOND, a.inicio, COALESCE(a.fim, NOW()))) AS tempo_alerta_segundos,
    ROUND(
        (
            SUM(TIMESTAMPDIFF(SECOND, a.inicio, COALESCE(a.fim, NOW())))
            /
            (DAY(LAST_DAY(CURDATE())) * 24 * 60 * 60)
        ) * 100
    , 2) AS frequencia_alerta_percentual
FROM alerta a
JOIN componente_servidor cs
    ON cs.fk_servidor = a.fk_componenteServidor_servidor
    AND cs.fk_tipo_componente = a.fk_componenteServidor_tipoComponente
JOIN servidor s
    ON s.id = cs.fk_servidor
WHERE 
    a.fk_componenteServidor_tipoComponente = ${fkComponente}
    AND MONTH(a.inicio) = MONTH(CURDATE())
    AND YEAR(a.inicio) = YEAR(CURDATE())
    AND s.fk_empresa = ${fkEmpresa}
    AND s.id = ${fkServidor}
GROUP BY a.fk_componenteServidor_servidor;
        `;
    } else { // Anual
        instrucaoSql = `
            SELECT
    a.fk_componenteServidor_servidor AS servidor,
    SUM(TIMESTAMPDIFF(SECOND, a.inicio, COALESCE(a.fim, NOW()))) AS tempo_alerta_segundos,
    ROUND(
        (
            SUM(TIMESTAMPDIFF(SECOND, a.inicio, COALESCE(a.fim, NOW())))
            /
            ( 
                -- total de segundos do ano atual
                (CASE 
                    WHEN YEAR(CURDATE()) % 400 = 0 OR (YEAR(CURDATE()) % 4 = 0 AND YEAR(CURDATE()) % 100 <> 0)
                        THEN 366
                    ELSE 365
                END) * 24 * 60 * 60
            )
        ) * 100
    , 2) AS frequencia_alerta_percentual
FROM alerta a
JOIN componente_servidor cs
    ON cs.fk_servidor = a.fk_componenteServidor_servidor
    AND cs.fk_tipo_componente = a.fk_componenteServidor_tipoComponente
JOIN servidor s
    ON s.id = cs.fk_servidor
WHERE 
    a.fk_componenteServidor_tipoComponente = ${fkComponente}
    AND YEAR(a.inicio) = YEAR(CURDATE())
    AND s.fk_empresa = ${fkEmpresa}
    AND s.id = ${fkServidor}
GROUP BY a.fk_componenteServidor_servidor;
        `;
    }

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listarEmpresas,
    listarTipos,
    listarSO,
    listarAlertas,
    selecionarServidores,
    listarServidores,
    cadastrarServidor,
    criarComponentesServidor,
    atualizarConfiguracaoAlerta,
    buscarConfiguracoesServidor,
    carregarComponentes,
    listartop3,
    contarAlertas,
    buscarAlertasComponenteEspecifico,
    buscarPosicaoRank,
    buscarMetricas,
    pegarFrequencia
};
