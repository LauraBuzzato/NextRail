var database = require("../database/config");

function buscarDadosAnuais(ano) {
    console.log("ACESSEI O RELATORIO MODEL, função buscarDadosAnuais, com o ano: ", ano);

    var instrucaoSql = `
        SELECT 
            alerta.id AS idAlerta,
            alerta.inicio, 
            alerta.fim, 
            tipo_componente.nome_tipo_componente AS nome_componente,
            servidor.nome AS nome_servidor, 
            gravidade.nome AS nome_gravidade,
            empresa.razao_social AS nome_empresa
        FROM alerta        
        JOIN tipo_componente ON alerta.fk_componenteServidor_tipoComponente = tipo_componente.id
        JOIN servidor ON alerta.fk_componenteServidor_servidor = servidor.id
        JOIN empresa on servidor.fk_empresa = empresa.id
        LEFT JOIN gravidade ON alerta.fk_gravidade = gravidade.id 
        WHERE YEAR(alerta.inicio) = ${ano} 
        ORDER BY alerta.inicio ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql).then(function (resultadoSql) {

        if (resultadoSql.length == 0) {
            return { ano: ano, totalAlertsAnual: 0, dadosMensais: [] };
        }

        var idsUnicos = new Set();
        var listaSemDuplicadas = [];

        for (var i = 0; i < resultadoSql.length; i++) {
            var item = resultadoSql[i];
            if (!idsUnicos.has(item.idAlerta)) {
                idsUnicos.add(item.idAlerta);
                listaSemDuplicadas.push(item);
            }
        }

        var totalAlertsAnual = idsUnicos.size; 
        console.log(`DEBUG: SQL retornou ${resultadoSql.length} linhas.`);
        console.log(`DEBUG: Após limpar duplicatas no JS, temos ${totalAlertsAnual} alertas reais.`);

        var totalMinutosParadoAnual = 0;
        var totalAlertasFinalizados = 0;
        var minutosSomadosParaMTTR = 0;
        var minutosSomadosParaDisponibilidade = 0;

        var contagemServidoresAno = {};
        var contagemComponentesAno = {};
        var contagemGravidadesAno = {};
        var mesesComAlertas = {};
        var nomeEmpresa = "nenhuma";

        for (var i = 0; i < listaSemDuplicadas.length; i++) {
            var alerta = listaSemDuplicadas[i];

            if (i == 0) nomeEmpresa = alerta.nome_empresa;
            if (alerta.nome_gravidade == null) alerta.nome_gravidade = "indefinida";

            var indiceMes = new Date(alerta.inicio).getMonth();

            if (!mesesComAlertas[indiceMes]) {
                var nomeDoMes = new Date(ano, indiceMes).toLocaleString('pt-BR', { month: 'long' });
                mesesComAlertas[indiceMes] = {
                    nome: nomeDoMes,
                    totalAlerts: 0,
                    totalMinutosParado: 0,
                    servidores: {},
                    componentes: {},
                    gravidades: { 'Baixo': 0, 'Médio': 0, 'Alto': 0 },
                    serverBreakdown: {}
                };
            }

            var mesParaAtualizar = mesesComAlertas[indiceMes];
            mesParaAtualizar.totalAlerts++;

            var duracaoMinutos = 0;
            var duracaoAteAgora = 0;
            var isFinalizado = false;

            if (alerta.fim !== null) {
                duracaoMinutos = (new Date(alerta.fim) - new Date(alerta.inicio)) / 60000;
                duracaoAteAgora = duracaoMinutos;
                isFinalizado = true;
            } else {
                duracaoAteAgora = (new Date() - new Date(alerta.inicio)) / 60000;
                duracaoMinutos = duracaoAteAgora;
                isFinalizado = false;
            }

            minutosSomadosParaDisponibilidade += duracaoAteAgora;

            if (isFinalizado) {
                minutosSomadosParaMTTR += duracaoMinutos;
                totalAlertasFinalizados++;
            }


            // Contadores Ano
            contagemServidoresAno[alerta.nome_servidor] = (contagemServidoresAno[alerta.nome_servidor] || 0) + 1;
            contagemComponentesAno[alerta.nome_componente] = (contagemComponentesAno[alerta.nome_componente] || 0) + 1;
            contagemGravidadesAno[alerta.nome_gravidade] = (contagemGravidadesAno[alerta.nome_gravidade] || 0) + 1;

            // Contadores Mês
            mesParaAtualizar.servidores[alerta.nome_servidor] = (mesParaAtualizar.servidores[alerta.nome_servidor] || 0) + 1;
            mesParaAtualizar.componentes[alerta.nome_componente] = (mesParaAtualizar.componentes[alerta.nome_componente] || 0) + 1;
            mesParaAtualizar.gravidades[alerta.nome_gravidade] = (mesParaAtualizar.gravidades[alerta.nome_gravidade] || 0) + 1;

            if (!mesParaAtualizar.serverBreakdown[alerta.nome_servidor]) {
                mesParaAtualizar.serverBreakdown[alerta.nome_servidor] = {};
            }
            mesParaAtualizar.serverBreakdown[alerta.nome_servidor][alerta.nome_componente] = (mesParaAtualizar.serverBreakdown[alerta.nome_servidor][alerta.nome_componente] || 0) + 1;

            mesParaAtualizar.totalMinutosParado += duracaoMinutos;
            totalMinutosParadoAnual += duracaoMinutos;
        }

        // Funções auxiliares e métricas finais
        function acharMaisFrequente(obj) {
            var max = 0, itemMax = 'N/A';
            for (var item in obj) {
                if (obj[item] > max) { max = obj[item]; itemMax = item; }
            }
            return itemMax;
        }

        for (var indiceMes in mesesComAlertas) {
            var mes = mesesComAlertas[indiceMes];
            var qtdServidoresMes = Object.keys(mes.servidores).length || 1;

            if (mes.totalAlerts > 0) {
                mes.mttr = mes.totalMinutosParado / mes.totalAlerts;
                var totalMinutosNoMes = 30 * 24 * 60 * qtdServidoresMes;
                mes.disponibilidade = ((totalMinutosNoMes - mes.totalMinutosParado) / totalMinutosNoMes) * 100;
            } else {
                mes.mttr = 0;
                mes.disponibilidade = 100;
            }
            mes.servidorMaisAfetadoMes = acharMaisFrequente(mes.servidores);
            mes.componenteMaisAfetadoMes = acharMaisFrequente(mes.componentes);
            mes.gravidadePredominante = acharMaisFrequente(mes.gravidades);
        }

        var arrayMesesFinal = [];
        var mesMaisCritico = 'N/A', mesMaisEstavel = 'N/A';
        var maxAlertas = -1, minAlertas = 999999;

        for (var indiceMes in mesesComAlertas) {
            var mes = mesesComAlertas[indiceMes];
            if (mes.totalAlerts > maxAlertas) { maxAlertas = mes.totalAlerts; mesMaisCritico = mes.nome; }
            if (mes.totalAlerts < minAlertas) { minAlertas = mes.totalAlerts; mesMaisEstavel = mes.nome; }
            arrayMesesFinal.push(mes);
        }

        var mttrMedioAnual = totalAlertasFinalizados > 0 ? (minutosSomadosParaMTTR / totalAlertasFinalizados) : 0;
        
        var qtdServidores = Object.keys(contagemServidoresAno).length || 1;
        var minutosTotaisNoAno = 365 * 24 * 60 * qtdServidores;
        var disponibilidadeMediaAnual = 100 - ((minutosSomadosParaDisponibilidade / minutosTotaisNoAno) * 100);

        var resultadoFinal = {
            empresa: nomeEmpresa,
            ano: ano,
            totalAlertsAnual: totalAlertsAnual, 
            mttrMedioAnual: Math.round(mttrMedioAnual),
            disponibilidadeMediaAnual: disponibilidadeMediaAnual,
            gravidadeMaisComumAno: acharMaisFrequente(contagemGravidadesAno),
            mesMaisCritico: mesMaisCritico.charAt(0).toUpperCase() + mesMaisCritico.slice(1),
            mesMaisEstavel: mesMaisEstavel.charAt(0).toUpperCase() + mesMaisEstavel.slice(1),
            servidorMaisAfetadoAno: acharMaisFrequente(contagemServidoresAno),
            componenteMaisAfetadoAno: acharMaisFrequente(contagemComponentesAno),
            dadosMensais: arrayMesesFinal,
        };

        console.log("Objeto final pronto:", resultadoFinal);
        return resultadoFinal;
    });
}

function buscarAnosDisponiveis() {

    var instrucaoSql = `
        SELECT DISTINCT YEAR(inicio) AS ano 
        FROM alerta 
        ORDER BY ano DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql).then(function (resultadoSql) {

        var anos = [];

        for (var i = 0; i < resultadoSql.length; i++) {
            var itemAtual = resultadoSql[i];
            var ano = itemAtual.ano;
            anos.push(ano);
        }

        console.log("Anos encontrados:", anos);
        return anos;
    });
}


function buscarMesesDisponiveis() {
    console.log("ACESSEI O RELATORIO MODEL, função buscarMesesDisponiveis");

    var instrucaoSql = `
        SELECT DISTINCT 
            YEAR(inicio) AS ano,
            MONTH(inicio) AS mes
        FROM alerta 
        ORDER BY ano DESC, mes DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql);
}


function buscarDadosMensais(ano, mes) {
    console.log(`MODEL: Buscando dados detalhados para o relatório de ${mes}/${ano}`);

    var instrucaoSql = `
        SELECT 
            alerta.inicio, alerta.fim, tipo_componente.nome_tipo_componente AS nome_componente,
            servidor.nome AS nome_servidor, gravidade.nome AS nome_gravidade,
            empresa.razao_social AS nome_empresa
        FROM alerta
        JOIN tipo_componente ON alerta.fk_componenteServidor_servidor = tipo_componente.id
        JOIN servidor ON alerta.fk_componenteServidor_servidor = servidor.id
        JOIN empresa on servidor.fk_empresa = empresa.id
        LEFT JOIN gravidade ON alerta.fk_gravidade = gravidade.id
        WHERE YEAR(alerta.inicio) = ${ano} AND MONTH(alerta.inicio) = ${mes}
        ORDER BY alerta.inicio ASC;
    `;

    return database.executar(instrucaoSql).then(function (resultadoSql) {

        if (resultadoSql.length == 0) {
            return { kpisGerais: {}, dadosSemanais: [] };
        }

        var semanas = {};

        var diasNoMes = new Date(ano, mes, 0).getDate();

        var numeroDeSemanas = Math.ceil(diasNoMes / 7);

        for (var i = 1; i <= numeroDeSemanas; i++) {
            semanas[i] = {
                numero: i,
                alertas: [],
                totalAlerts: 0,
                totalMinutosParado: 0,
                contagemServidores: {},
                contagemComponentes: {}
            };
        }


        function acharMaisFrequente(objetoDeContagem) {
            var maisFrequente = 'N/A';
            var maxContagem = 0;
            for (var item in objetoDeContagem) {
                if (objetoDeContagem[item] > maxContagem) {
                    maxContagem = objetoDeContagem[item];
                    maisFrequente = item;
                }
            }
            return maisFrequente;
        }



        for (var i = 0; i < resultadoSql.length; i++) {
            var alerta = resultadoSql[i];
            var dataInicio = new Date(alerta.inicio);

            // (dia 1-7 é semana 1, 8-14 é semana 2, etc.)
            var numeroSemana = Math.ceil(dataInicio.getDate() / 7);

            var duracaoMinutos = 0;
            if (alerta.fim) {
                duracaoMinutos = (new Date(alerta.fim) - new Date(alerta.inicio)) / 60000;
            }

            // Adiciona o alerta na lista da sua respectiva semana
            semanas[numeroSemana].alertas.push({
                inicio: alerta.inicio,
                fim: alerta.fim,
                duracao: duracaoMinutos,
                servidor: alerta.nome_servidor,
                componente: alerta.nome_componente,
                gravidade: alerta.nome_gravidade
            });
        }

        var kpisMes = {
            totalAlerts: 0,
            totalMinutosParado: 0,
            contagemServidores: {},
            contagemComponentes: {},
            contagemGravidades: {}
        };

        for (var numSemana in semanas) {
            var semana = semanas[numSemana];


            semana.totalAlerts = 0;
            semana.totalMinutosParado = 0;
            semana.contagemServidores = {};
            semana.contagemComponentes = {};

            // Loop dentro dos alertas daquela semana
            for (var i = 0; i < semana.alertas.length; i++) {
                var alertaDaSemana = semana.alertas[i];


                var duracaoMinutos = 0;
                if (alertaDaSemana.fim) {
                    //Duração em minutos do alerta
                    duracaoMinutos = (new Date(alertaDaSemana.fim) - new Date(alertaDaSemana.inicio)) / 60000;
                }


                semana.totalAlerts++;
                semana.totalMinutosParado += duracaoMinutos;


                kpisMes.totalAlerts++;
                kpisMes.totalMinutosParado += duracaoMinutos;


                var servidor = alertaDaSemana.servidor;
                var componente = alertaDaSemana.componente;
                var gravidade = alertaDaSemana.gravidade;

                // Contagem para a semana
                if (semana.contagemServidores[servidor] == undefined) {
                    semana.contagemServidores[servidor] = 1;
                } else {
                    semana.contagemServidores[servidor]++;
                }
                if (semana.contagemComponentes[componente] == undefined) {
                    semana.contagemComponentes[componente] = 1;
                } else {
                    semana.contagemComponentes[componente]++;
                }

                // Contagem para o mês
                if (kpisMes.contagemServidores[servidor] == undefined) {
                    kpisMes.contagemServidores[servidor] = 1;
                } else {
                    kpisMes.contagemServidores[servidor]++;
                }

                if (kpisMes.contagemComponentes[componente] == undefined) {
                    kpisMes.contagemComponentes[componente] = 1;
                } else {
                    kpisMes.contagemComponentes[componente]++;
                }

                if (kpisMes.contagemGravidades[gravidade] == undefined) {
                    kpisMes.contagemGravidades[gravidade] = 1;
                } else {
                    kpisMes.contagemGravidades[gravidade]++;
                }
            }

            // Métricas finais da semana
            if (semana.totalAlerts > 0) {
                semana.mttr = semana.totalMinutosParado / semana.totalAlerts;
            } else {
                semana.mttr = 0;
            }
            // 7 dias da semana, 24 hrs por dia, 60 min por hora -> calculo de min por semana
            semana.disponibilidade = (((7 * 24 * 60) - semana.totalMinutosParado) / (7 * 24 * 60)) * 100;
            semana.servidorDestaque = acharMaisFrequente(semana.contagemServidores);
            semana.componenteDestaque = acharMaisFrequente(semana.contagemComponentes);
        }

        var kpisGeraisFinais = {
            empresa: resultadoSql[0].nome_empresa,
            totalAlerts: kpisMes.totalAlerts,
            servidorMaisAfetado: acharMaisFrequente(kpisMes.contagemServidores),
            componenteMaisAfetado: acharMaisFrequente(kpisMes.contagemComponentes),
            gravidadePredominante: acharMaisFrequente(kpisMes.contagemGravidades)
        };

        if (kpisMes.totalAlerts > 0) {
            kpisGeraisFinais.mttrMedio = kpisMes.totalMinutosParado / kpisMes.totalAlerts;
        } else {
            kpisGeraisFinais.mttrMedio = 0;
        }
        kpisGeraisFinais.disponibilidade = (((30 * 24 * 60) - kpisMes.totalMinutosParado) / (30 * 24 * 60)) * 100;

        var arrayDeSemanas = [];
        var semanaMaisCritica = 0;
        var semanaMaisEstavel = 0;
        var maxAlertas = -1;
        var minAlertas = 999999;

        for (var numSemana in semanas) {
            if (semanas[numSemana].totalAlerts > maxAlertas) {
                maxAlertas = semanas[numSemana].totalAlerts;
                semanaMaisCritica = semanas[numSemana].numero;
            }
            if (semanas[numSemana].totalAlerts < minAlertas) {
                minAlertas = semanas[numSemana].totalAlerts;
                semanaMaisEstavel = semanas[numSemana].numero;
            }
            arrayDeSemanas.push(semanas[numSemana]);
        }
        kpisGeraisFinais.semanaMaisCritica = "Semana " + semanaMaisCritica;
        kpisGeraisFinais.semanaMaisEstavel = "Semana " + semanaMaisEstavel;

        return {
            kpisGerais: kpisGeraisFinais,
            dadosSemanais: arrayDeSemanas
        };
    });
}



module.exports = {
    buscarDadosAnuais,
    buscarDadosMensais,
    buscarAnosDisponiveis,
    buscarMesesDisponiveis


};