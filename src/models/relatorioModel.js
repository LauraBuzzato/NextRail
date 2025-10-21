var database = require("../database/config");

function buscarDadosAnuais(ano) {
    console.log("ACESSEI O RELATORIO MODEL, função buscarDadosAnuais, com o ano: ", ano);

    var instrucaoSql = `
        SELECT 
            alerta.inicio,
            alerta.fim,
            componente.nome AS nome_componente,
            servidor.nome AS nome_servidor,
            gravidade.nome AS nome_gravidade,
            empresa.razao_social AS nome_empresa
        FROM alerta
        JOIN componente ON alerta.fk_componente = componente.id
        JOIN servidor ON componente.fk_servidor = servidor.id
        JOIN empresa on servidor.fk_empresa = empresa.id
        LEFT JOIN metrica ON metrica.fk_componente = componente.id 
        LEFT JOIN gravidade ON metrica.fk_gravidade = gravidade.id
        WHERE YEAR(alerta.inicio) = ${ano};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql).then(function (resultadoSql) {

        if (resultadoSql.length == 0) {
            return { ano: ano, totalAlertsAnual: 0, dadosMensais: [] };
        }

        var totalAlertsAnual = 0;
        var totalMinutosParadoAnual = 0;
        var contagemServidoresAno = {};
        var contagemComponentesAno = {};
        var contagemGravidadesAno = {};

        var mesesComAlertas = {};
        var nomeEmpresa = "nenhuma"

        // cada alerta que vem do banco
        for (var i = 0; i < resultadoSql.length; i++) {
            var alerta = resultadoSql[i];

            if (i == 0) {
                nomeEmpresa = alerta.nome_empresa
            }

            if (alerta.nome_gravidade == null) {
                alerta.nome_gravidade = "indefinida"
            }

            // Pega o número do mês do alerta 0 para Janeiro, 1 para Fevereiro etc.
            var indiceMes = new Date(alerta.inicio).getMonth();cd 

            //Se a caixa não existe a gente cria ela

            if (!mesesComAlertas[indiceMes]) {

                var nomeDoMes = new Date(ano, indiceMes).toLocaleString('pt-BR', { month: 'long' });

                mesesComAlertas[indiceMes] = {
                    nome: nomeDoMes,
                    totalAlerts: 0,
                    totalMinutosParado: 0,
                    servidores: {},
                    componentes: {},
                    gravidades: { 'Crítico': 0, 'Alto': 0, 'Médio': 0 },
                    serverBreakdown: {}
                };
                console.log(`CRIANDO a caixinha para o mês: ${nomeDoMes}`);
            }

            var mesParaAtualizar = mesesComAlertas[indiceMes];

            mesParaAtualizar.totalAlerts = mesParaAtualizar.totalAlerts + 1;

            var duracaoMinutos = 0;
            if (alerta.fim) {
                //subtrai o tempo de início do tempo de fim (o que dá um valor em milissegundos) e divide por 60.000 para transformar em minutos.
                duracaoMinutos = (new Date(alerta.fim) - new Date(alerta.inicio)) / 60000;
            }

            if (contagemServidoresAno[alerta.nome_servidor] === undefined) {
                // Se é a primeira vez que vemos este servidor, atribuimos com 1
                contagemServidoresAno[alerta.nome_servidor] = 1;
            } else {
                contagemServidoresAno[alerta.nome_servidor]++;
            }

            if (contagemComponentesAno[alerta.nome_componente] == undefined) {
                contagemComponentesAno[alerta.nome_componente] = 1;
            } else {
                contagemComponentesAno[alerta.nome_componente]++;
            }

            if (contagemGravidadesAno[alerta.nome_gravidade] == undefined) {
                contagemGravidadesAno[alerta.nome_gravidade] = 1;
            } else {
                contagemGravidadesAno[alerta.nome_gravidade]++;
            }

            // Contar Servidores para o MÊS
            if (mesParaAtualizar.servidores[alerta.nome_servidor] == undefined) {
                mesParaAtualizar.servidores[alerta.nome_servidor] = 1;
            } else {
                mesParaAtualizar.servidores[alerta.nome_servidor]++;
            }

            // Contar Componentes para o MÊS
            if (mesParaAtualizar.componentes[alerta.nome_componente] == undefined) {
                mesParaAtualizar.componentes[alerta.nome_componente] = 1;
            } else {
                mesParaAtualizar.componentes[alerta.nome_componente]++;
            }

            // Contar Gravidades para o MÊS

            if (mesParaAtualizar.gravidades[alerta.nome_gravidade] != undefined) {
                mesParaAtualizar.gravidades[alerta.nome_gravidade]++;
            }


            if (mesParaAtualizar.serverBreakdown[alerta.nome_servidor] === undefined) {
                mesParaAtualizar.serverBreakdown[alerta.nome_servidor] = {};
            }

            if (mesParaAtualizar.serverBreakdown[alerta.nome_servidor][alerta.nome_componente] === undefined) {
                mesParaAtualizar.serverBreakdown[alerta.nome_servidor][alerta.nome_componente] = 1;
            } else {
                mesParaAtualizar.serverBreakdown[alerta.nome_servidor][alerta.nome_componente]++;
            }

            // somar os minutos que calculamos nos totais
            mesParaAtualizar.totalMinutosParado = mesParaAtualizar.totalMinutosParado + duracaoMinutos;

            // somar nos totais do ano inteiro
            totalAlertsAnual = totalAlertsAnual + 1;
            totalMinutosParadoAnual = totalMinutosParadoAnual + duracaoMinutos;

        }

        for (var indiceMes in mesesComAlertas) {
            var mes = mesesComAlertas[indiceMes];

            if (mes.totalAlerts > 0) {
                // MTTR = Tempo Total Parado / Total de Alertas
                mes.mttr = mes.totalMinutosParado / mes.totalAlerts;

                // Disponibilidade = (Tempo Total do Mês - Tempo Parado) / Tempo Total do Mês
                var totalMinutosNoMes = 30 * 24 * 60;
                mes.disponibilidade = ((totalMinutosNoMes - mes.totalMinutosParado) / totalMinutosNoMes) * 100;
            } else {

                //Se nao teve nenhum alerta
                mes.mttr = 0;
                mes.disponibilidade = 100;
            }

            mes.servidorMaisAfetadoMes = acharMaisFrequente(mes.servidores);
            mes.componenteMaisAfetadoMes = acharMaisFrequente(mes.componentes);
            mes.gravidadePredominante = acharMaisFrequente(mes.gravidades);

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

        // Usamos a função pra encontrar os mais frequentes do ano
        var servidorMaisAfetadoAno = acharMaisFrequente(contagemServidoresAno);
        var componenteMaisAfetadoAno = acharMaisFrequente(contagemComponentesAno);
        var gravidadeMaisComumAno = acharMaisFrequente(contagemGravidadesAno);

        // mês mais crítico e mais estável
        var mesMaisCritico = 'N/A';
        var mesMaisEstavel = 'N/A';
        var maxAlertas = -1;
        var minAlertas = 999999;
        var arrayMesesFinal = [];

        for (var indiceMes in mesesComAlertas) {

            var mes = mesesComAlertas[indiceMes];

            if (mes.totalAlerts > maxAlertas) {
                maxAlertas = mes.totalAlerts;
                mesMaisCritico = mes.nome;
            }
            if (mes.totalAlerts < minAlertas) {
                minAlertas = mes.totalAlerts;
                mesMaisEstavel = mes.nome;
            }

            arrayMesesFinal.push(mes);
        }

        // Médias do ano
        var mttrMedioAnual = 0;
        if (totalAlertsAnual > 0) {
            //     Soma de todos os min de alerta / qtd
            mttrMedioAnual = totalMinutosParadoAnual / totalAlertsAnual;
        }

        //Calcula os minutos totais do ano / pelos minutos parados do ano e subtrai de 100%
        var disponibilidadeMediaAnual = 100 - (totalMinutosParadoAnual / (365 * 24 * 60)) * 100;

        //Json exibido 
        var resultadoFinal = {
            empresa: nomeEmpresa,
            ano: ano,
            totalAlertsAnual: totalAlertsAnual,
            mttrMedioAnual: Math.round(mttrMedioAnual),
            disponibilidadeMediaAnual: disponibilidadeMediaAnual,
            gravidadeMaisComumAno: gravidadeMaisComumAno,
            mesMaisCritico: mesMaisCritico,
            mesMaisEstavel: mesMaisEstavel,
            servidorMaisAfetadoAno: servidorMaisAfetadoAno,
            componenteMaisAfetadoAno: componenteMaisAfetadoAno,
            dadosMensais: arrayMesesFinal
        };

        console.log("Objeto final pronto para ser enviado:", resultadoFinal);
        return resultadoFinal;

    })

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
            alerta.inicio, alerta.fim, componente.nome AS nome_componente,
            servidor.nome AS nome_servidor, gravidade.nome AS nome_gravidade,
            empresa.razao_social AS nome_empresa
        FROM alerta
        JOIN componente ON alerta.fk_componente = componente.id
        JOIN servidor ON componente.fk_servidor = servidor.id
        JOIN empresa on servidor.fk_empresa = empresa.id
        LEFT JOIN metrica ON metrica.fk_componente = componente.id 
        LEFT JOIN gravidade ON metrica.fk_gravidade = gravidade.id
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