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

function listarAlertas(req, res) {
    var fkEmpresa = req.body.idempresa;
    servidorModel.listarAlertas(fkEmpresa)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function selecionarServidores(req, res) {
    var fkEmpresa = req.body.idempresa;
    servidorModel.selecionarServidores(fkEmpresa)
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

function atualizarConfiguracaoScript(req, res) {
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

    servidorModel.atualizarConfiguracaoScript(servidorId, configuracoes)
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

function buscarAlertasDoServidor(req, res) {
    var servidorId = req.params.servidorId;

    if (!servidorId) {
        res.status(400).send("ID do servidor não informado!");
        return;
    }

    servidorModel.buscarAlertasDoServidor(servidorId)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarParametrosDoServidor(req, res) {
    var servidorId = req.params.servidorId;
    var componente = req.params.componente;

    if (!servidorId) {
        res.status(400).send("ID do servidor não informado!");
        return;
    }
    if (!componente) {
        res.status(400).send("Componente do servidor não informado!");
        return;
    }

    servidorModel.buscarParametrosDoServidor(servidorId, componente)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarScriptServidor(req, res) {
    var servidorId = req.params.servidorId;

    if (!servidorId) {
        res.status(400).send("ID do servidor não informado!");
        return;
    }

    servidorModel.buscarScriptServidor(servidorId)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function carregarComponentes(req, res) {
    servidorModel.carregarComponentes()
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao procurar componentes! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function listartop3(req, res) {
    var fkEmpresa = req.body.idempresa

    servidorModel.listartop3(fkEmpresa)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao procurar servidores! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function contarAlertas(req, res) {
    var fkEmpresa = req.body.idempresa

    servidorModel.contarAlertas(fkEmpresa)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao contar alertas! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function buscarAlertasComponenteEspecifico(req, res) {
    var fkEmpresa = req.body.idempresa
    var fkComponente = req.body.idComponente
    var periodo = req.body.periodoAnalisado
    var fkServidor = req.body.idServidor

    servidorModel.buscarAlertasComponenteEspecifico(fkEmpresa, fkComponente, periodo, fkServidor)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao contar alertas! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function buscarPosicaoRank(req, res) {
    var fkEmpresa = req.body.idempresa
    var fkComponente = req.body.idComponente
    var periodo = req.body.periodoAnalisado
    var fkServidor = req.body.idServidor

    servidorModel.buscarPosicaoRank(fkEmpresa, fkComponente, periodo, fkServidor)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao pegar rank! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function buscarMetricas(req, res) {
    var fkEmpresa = req.body.idempresa
    var fkComponente = req.body.idComponente
    var fkServidor = req.body.idServidor

    servidorModel.buscarMetricas(fkEmpresa, fkComponente, fkServidor)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao pegar rank! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function pegarFrequencia(req, res) {
    var fkEmpresa = req.body.idempresa
    var fkComponente = req.body.idComponente
    var periodo = req.body.periodoAnalisado
    var fkServidor = req.body.idServidor

    servidorModel.pegarFrequencia(fkEmpresa, fkComponente, periodo, fkServidor)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao pegar rank! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function buscarAlertasHistorico(req, res) {
    var fkEmpresa = req.body.idempresa;
    var fkComponente = req.body.idComponente;
    var fkServidor = req.body.idServidor;
    var periodo = req.body.periodo;

    servidorModel.buscarAlertasHistorico(fkEmpresa, fkComponente, fkServidor, periodo)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function atualizarConfiguracaoSla(req, res) {
    var dadosSla = req.body;

    if (!dadosSla.servidorId || !dadosSla.baixo || !dadosSla.medio || !dadosSla.alto) {
        res.status(400).json({
            success: false,
            message: "Preencha todos os campos de tempo (Baixo, Médio e Alto)!"
        });
        return;
    }

    servidorModel.atualizarConfiguracaoSla(dadosSla)
        .then(
            function (resultado) {
                res.json({
                    success: true,
                    message: 'SLA atualizado com sucesso!'
                });
            }
        )
        .catch(
            function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function listarIncidentes(req, res) {
    var fkEmpresa = req.body.idempresa;
    servidorModel.listarIncidentes(fkEmpresa)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

async function pegarUsoTempoReal(req, res) {
    try {
        const empresa = req.params.empresa;
        const servidor = req.params.servidorNome;

        // validações básicas
        if (!empresa || !servidor) {
            return res.status(400).json({
                erro: "Parâmetros obrigatórios ausentes. Envie empresa, servidor"
            });
        }

        console.log("[API] Pegando uso real do S3:", {
            empresa,
            servidor
        });

        const resultado = await servidorModel.pegarUsoTempoReal(
            empresa,
            servidor,
        );

        return res.status(200).json(resultado);

    } catch (erro) {
        console.error("Erro no pegarUsoTempoReal Controller:", erro);

        return res.status(500).json({
            erro: "Erro ao obter dados de uso",
            detalhe: erro.message
        });
    }
}

async function pegarUso(req, res) {

    try {
        const empresa = req.query.empresa;
        const servidor = req.query.servidor;
        const tipo = req.query.tipo; // "mensal" ou "anual"
        const ano = req.query.ano;
        const mes = req.query.mes;
        const componente = req.query.componente;

        if (!empresa || !servidor || !tipo || !ano || !componente) {
            return res.status(400).json({
                erro: "Parâmetros obrigatórios ausentes. Envie empresa, servidor, tipo, ano, componente (e mes se mensal)."
            });
        }

        console.log("[API] Pegando uso real do S3:", {
            empresa,
            servidor,
            tipo,
            ano,
            mes,
            componente
        });

        const resultado = await servidorModel.pegarUso(
            empresa,
            servidor,
            tipo,
            ano,
            mes,
            Number(componente)
        );

        return res.status(200).json(resultado);

    } catch (erro) {
        console.error("Erro no pegarUso Controller:", erro);

        return res.status(500).json({
            erro: "Erro ao obter dados de uso",
            detalhe: erro.message
        });
    }
}




function paramsNomes(req, res) {
    var fk_servidor = req.params.fk_servidor;
    if (!fk_servidor) {
        res.status(400).send("ID do servidor não informado!");
        return;
    }
    servidorModel.paramsNomes(fk_servidor)
        .then(resultado => {
            res.json(resultado);
        })
        .catch(erro => {
            console.log("Erro ao buscar nomes:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function pegarPrevisao(req, res) {
    const { servidorId, periodo } = req.body;

    if (!servidorId || !periodo) {
        return res.status(400).json({ error: "servidorId e periodo são obrigatórios" });
    }

    servidorModel.pegarPrevisao(servidorId, periodo)
        .then(dados => {
            res.json(dados);
        })
        .catch(error => {
            console.error("Erro no controller:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        });
}


async function listarDadosAlertas(req, res) {
    var { nomeServer, tipo, ano, mes } = req.query;

    try {

        const resultadoBanco = await servidorModel.buscarEmpresaPorNomeServidor(nomeServer);

        if (resultadoBanco.length === 0) {
            return res.status(404).json({ error: "Servidor não encontrado no banco de dados." });
        }


        const nomeEmpresa = resultadoBanco[0].nomeEmpresa;

        const dados = await servidorModel.pegarJsonDoS3(servidorId, nomeServer, tipo, ano, mes);


        if (!dados) {
            console.log(`Arquivo S3 não encontrado para ${nomeServer}. Retornando padrão.`);

            const hoje = new Date();
            // Define os valores padrão para retornar ao front
            return res.status(200).json({
                total_alertas_baixo: 0,
                total_alertas_medio: 0,
                total_alertas_alto: 0,
                servidor_nome: nomeServer,
                mes_referencia: mes || (hoje.getMonth() + 1),
                ano_referencia: ano || hoje.getFullYear(),
                mttr: 0,
                sla: 0,
                historico_diario: [],
                grafico_linha: { labels: [], cpu: [], ram: [], disco: [] }
            });
        }

        // Se achou, retorna os dados reais
        return res.status(200).json(dados);

    } catch (erro) {
        console.log("Erro ao processar requisição:", erro.message);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
}



async function buscarSla(req, res) {
    var idServidor = req.params.idServidor;

    try {
        const registros = await servidorModel.buscarSla(idServidor);
        if (registros.length > 0) {
            let soma = 0;
            for (let i = 0; i < registros.length; i++) {
                soma += registros[i].sla;
            }

            let media = (soma / registros.length).toFixed(0);

            res.status(200).json({ mediaSla: media });
        } else {
            res.status(200).json({ mediaSla: 0 });
        }
    } catch (erro) {
        console.log(erro);
        res.status(500).json(erro.sqlMessage);
    }
}


async function compararAlertas(req, res) {
    var idServidor = req.params.idServidor;

    try {
        const resultado = await servidorModel.buscarComparacaoMes(idServidor);

        var atual = 0
        var anterior = 0

        if (resultado.length > 0) {
            var atual = resultado[0].qtd_atual || 0;
            var anterior = resultado[0].qtd_anterior || 0;
        }
        var porcentagem = 0;
        var cssCor = "";
        var icone = "";
        var texto = "";

        // Só pra evitar divisão por zero
        if (anterior == 0) {
            // Se não teve alertas mês passado e agora tem, subiu 100% 
            // Se ambos forem 0, continua 0%
            porcentagem = atual > 0 ? 100 : 0;
        } else {
            porcentagem = ((atual - anterior) / anterior) * 100;
        }

        porcentagem = porcentagem.toFixed(1);

        if (porcentagem > 0) {
            // Piorou (mais alertas)
            cssCor = "red";
            icone = "arrow-up-outline";
            texto = `vs. ${anterior} do Mês Anterior`;
        } else if (porcentagem < 0) {
            // Melhorou (menos alertas)}
            cssCor = "lightgreen";
            icone = "arrow-down-outline";
            texto = `vs. ${anterior} do Mês Anterior`;
            porcentagem = Math.abs(porcentagem); // Tira sinal negativo
        } else {
            // Igual
            cssCor = "white";
            icone = "remove-outline";
            texto = "Igual ao mês anterior";
        }

        res.json({
            percentual: porcentagem,
            cor: cssCor,
            icone: icone,
            texto: texto
        });
    } catch (erro) {
        console.log(erro);
        res.status(500).json(erro.sqlMessage);
    }
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
    pegarFrequencia,
    atualizarConfiguracaoScript,
    buscarScriptServidor,
    buscarAlertasHistorico,
    atualizarConfiguracaoSla,
    listarIncidentes,
    buscarAlertasDoServidor,
    buscarParametrosDoServidor,
    pegarUsoTempoReal,
    pegarUso,
    paramsNomes,
    pegarPrevisao,
    listarDadosAlertas,
    buscarSla,
    compararAlertas
};
