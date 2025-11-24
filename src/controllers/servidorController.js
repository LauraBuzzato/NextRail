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

function carregarComponentes(req, res){
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

function listartop3(req, res){
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

function contarAlertas(req, res){
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

function buscarAlertasComponenteEspecifico(req, res){
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

function buscarPosicaoRank(req, res){
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

function buscarMetricas(req, res){
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

function pegarFrequencia(req, res){
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

<<<<<<< HEAD
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
=======
async function pegarUso(req, res) {
    try {
        const empresa = req.query.empresa;
        const servidor = req.query.servidor;
        const tipo = req.query.tipo; // "mensal" ou "anual"
        const ano = req.query.ano;
        const mes = req.query.mes;
        const componente = req.query.componente;

        // validações básicas
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
        console.error("❌ Erro no pegarUso Controller:", erro);

        return res.status(500).json({
            erro: "Erro ao obter dados de uso",
            detalhe: erro.message
        });
    }
>>>>>>> 5d12b4536cbbd36cb6a26b85fab8688a1cc91b42
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
<<<<<<< HEAD
  paramsNomes
=======
  pegarUso
>>>>>>> 5d12b4536cbbd36cb6a26b85fab8688a1cc91b42
};
