
    window.onload = function () {
        mudarVisualizacao("anual")
    };

    function carregarAnosDisponiveis() {
        var containerAnos = document.getElementById('containerAnos');
        containerAnos.innerHTML = '<h4>Carregando anos com relatórios...</h4>';

        fetch(`http://localhost:3333/relatorio/anos`)
            .then(function (resposta) {
                if (resposta.ok) {
                    return resposta.json();
                } else {
                    containerAnos.innerHTML = '<h4>Falha ao carregar os anos.</h4>';
                }
            })
            .then(function (listaDeAnos) {
                if (listaDeAnos.length == 0) {
                    containerAnos.innerHTML = '<h4>Nenhum relatório encontrado.</h4>';
                    return;
                }

                var htmlCompleto = "";

                for (var i = 0; i < listaDeAnos.length; i++) {
                    var ano = listaDeAnos[i];

                    htmlCompleto += `<div class="box-ano" onclick="abrirRelatorio(${ano})">${ano}</div>`;
                }

                containerAnos.innerHTML = htmlCompleto;
            })
            .catch(function (erro) {
                console.error('Ocorreu um erro na requisição:', erro);
                containerAnos.innerHTML = '<h4>Erro de conexão com o servidor.</h4>';
            });
    }


    function carregarMesesDisponiveis() {
        var containerMeses = document.getElementById('containerMeses');
        containerMeses.innerHTML = '<h4>Carregando meses com relatórios...</h4>';

        fetch(`http://localhost:3333/relatorio/meses`)
            .then(function (resposta) {
                if (resposta.ok) {
                    return resposta.json();
                } else {
                    containerMeses.innerHTML = '<h4>Falha ao carregar os meses.</h4>';
                }
            })
            .then(function (listaDeMeses) {

                if (listaDeMeses == undefined || listaDeMeses.length == 0) {
                    containerMeses.innerHTML = '<h4>Nenhum relatório mensal encontrado.</h4>';
                    return;
                }

                // 3. Array para traduzir o número do mês (ex: 3) para o nome ("Março")
                var nomesDosMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

                var htmlCompleto = "";
                for (var i = 0; i < listaDeMeses.length; i++) {
                    var item = listaDeMeses[i];
                    var ano = item.ano;
                    var mes = item.mes;
                    var nomeDoMes = nomesDosMeses[mes - 1];

                    htmlCompleto += `<div class="box-ano" onclick="abrirRelatorioMensal(${ano}, ${mes})">${nomeDoMes} de ${ano}</div>`;
                }
                containerMeses.innerHTML = htmlCompleto;
            })
            .catch(function (erro) {
                console.error('Ocorreu um erro na requisição:', erro);
                containerMeses.innerHTML = '<h4>Erro de conexão com o servidor.</h4>';
            });

    }


    function mudarVisualizacao(tipo) {
        var selecaoAno = document.getElementById('selecaoAno');
        var selecaoMes = document.getElementById('selecaoMes');
        var btnAnual = document.getElementById('btn-anual');
        var btnMensal = document.getElementById('btn-mensal');

        // Limpa qualquer relatório que esteja aberto
        var containerDoRelatorio = document.getElementById('relatorio-container');
        containerDoRelatorio.innerHTML = "<h3>Selecione um período para ver o relatório</h3>";

        if (tipo === 'anual') {
            selecaoAno.style.display = 'block';
            selecaoMes.style.display = 'none';
            btnAnual.classList.add('active');
            btnMensal.classList.remove('active');

            carregarAnosDisponiveis();

        } else if (tipo === 'mensal') {
            selecaoAno.style.display = 'none';
            selecaoMes.style.display = 'block';
            btnAnual.classList.remove('active');
            btnMensal.classList.add('active');


            carregarMesesDisponiveis();
        }
    }

    function abrirRelatorio(ano) {
        var selecaoAnoDiv = document.querySelector('.selecao-ano');
        var containerDoRelatorio = document.getElementById('relatorio-container');


        selecaoAnoDiv.style.display = 'none';
        containerDoRelatorio.innerHTML = `<h3>Buscando dados do relatório de ${ano}...</h3>`;


        fetch(`http://localhost:3333/relatorio/anual/${ano}`)
            .then(function (resposta) {
                if (resposta.ok) {
                    return resposta.json();
                } else {
                    containerDoRelatorio.innerHTML = `<h3>Erro ao buscar dados.</h3><button onclick="voltar('ano')" class="btn-voltar">Voltar</button>`;
                }
            })
            .then(function (dados) {

                
                // Cabeçalho 
                var cabecalhoHtml = `
                <div class="relatorio-gerado">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 1.8rem; font-weight: bold; color: #ffe066;">${dados.empresa}</h2>
                        <p style="font-size: 2.5rem; font-weight: 800; margin: 10px 0;margin-left:17%;">Relatório Anual — ${dados.ano}</p>
                    </div>
                    <div class="kpi-grid">
                        <div class="kpi-card-gerado"><ion-icon name="alert-circle-outline" style="color: #eab308;"></ion-icon><div><div class="kpi-value">${dados.totalAlertsAnual}</div><div class="kpi-label">Total Alertas</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="time-outline" style="color: #3b82f6;"></ion-icon><div><div class="kpi-value">${dados.mttrMedioAnual} min</div><div class="kpi-label">MTTR Médio</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="shield-checkmark-outline" style="color: #22c55e;"></ion-icon><div><div class="kpi-value">${dados.disponibilidadeMediaAnual.toFixed(2)}%</div><div class="kpi-label">Disponibilidade</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="pulse-outline" style="color: #f97316;"></ion-icon><div><div class="kpi-value">${dados.gravidadeMaisComumAno}</div><div class="kpi-label">Gravidade Comum</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="flame-outline" style="color: #ef4444;"></ion-icon><div><div class="kpi-value">${dados.mesMaisCritico}</div><div class="kpi-label">Mês Crítico</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="leaf-outline" style="color: #a3e635;"></ion-icon><div><div class="kpi-value">${dados.mesMaisEstavel}</div><div class="kpi-label">Mês Estável</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="server-outline" style="color: #2dd4bf;"></ion-icon><div><div class="kpi-value">${dados.servidorMaisAfetadoAno}</div><div class="kpi-label">Servidor Afetado</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="construct-outline" style="color: #06b6d4;"></ion-icon><div><div class="kpi-value">${dados.componenteMaisAfetadoAno}</div><div class="kpi-label">Comp. Afetado</div></div></div>
                    </div>
                    <h3 style="text-align: center; font-size: 1.8rem; font-weight: bold; margin-bottom: 20px;">Evolução Mensal</h3>
            `;

                // Cria os cards de cada mês usando for
                var mesesHtml = '<div class="meses-grid">';
                for (var i = 0; i < dados.dadosMensais.length; i++) {
                    var mes = dados.dadosMensais[i];

                    // Só pra exibir na de kpi
                    var classeDaGravidade = '';

                    if (mes.gravidadePredominante == 'Crítico') {
                        classeDaGravidade = 'critico';
                    } else if (mes.gravidadePredominante == 'Alto') {
                        classeDaGravidade = 'alto';
                    } else if (mes.gravidadePredominante == 'Médio') {
                        classeDaGravidade = 'medio';
                    }

                    var serverBreakdownHtml = '';

                    // for por cada servidor dentro do mês
                    for (var nomeServidor in mes.serverBreakdown) {

                        serverBreakdownHtml += `<h6 style="font-size: 0.8rem; font-weight: bold; color: #2dd4bf; margin-top: 10px;">${nomeServidor}</h6>`;
                        var componentesHtml = '<ul style="list-style: none; padding-left: 10px;">';

                        // for para passar pelos componentes que estão dentro do servidor kkkk
                        for (var nomeComponente in mes.serverBreakdown[nomeServidor]) {
                            var quantidade = mes.serverBreakdown[nomeServidor][nomeComponente];
                            componentesHtml += `
                <li style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 2px 0;">
                    <span>- ${nomeComponente}</span> 
                    <strong>${quantidade}</strong>
                </li>`;
                        }
                        componentesHtml += '</ul>';
                        serverBreakdownHtml += componentesHtml;
                    }


                    mesesHtml += `
    <div class="mes-card-gerado">
        <div class="mes-header" style="display:flex; justify-content: space-between; align-items: center;">
            <h4>${mes.nome}</h4>
            <span class="severity-badge ${classeDaGravidade}">${mes.gravidadePredominante}</span>
        </div>
        
        <div class="mes-stats">
            <div class="stat-item"><span>Total de Alertas:</span> <strong>${mes.totalAlerts}</strong></div>
            <div class="stat-item"><span>MTTR Médio:</span> <strong>${Math.round(mes.mttr)} min</strong></div>
            <div class="stat-item"><span>Disponibilidade:</span> <strong>${mes.disponibilidade.toFixed(2)}%</strong></div>
            <hr style="border-color: #444; margin: 5px 0;">
            <div class="stat-item"><span>Servidor Destaque:</span> <strong>${mes.servidorMaisAfetadoMes}</strong></div>
            <div class="stat-item"><span>Comp. Destaque:</span> <strong>${mes.componenteMaisAfetadoMes}</strong></div>
        </div>

       
        <div>
            <h5 class="mes-section-title">Distribuição de Gravidade</h5>
                <div class="gravidade-distribuicao">
                    <span><span class="critico">Crítico:</span> <strong>${mes.gravidades['Crítico']}</strong></span>
                    <span><span class="alto">Alto:</span> <strong>${mes.gravidades['Alto']}</strong></span>
                    <span><span class="medio">Médio:</span> <strong>${mes.gravidades['Médio']}</strong></span>
                </div>
        </div>
        
        <div>
            <h5 class="mes-section-title">Alertas por Servidor</h5>
            <div class="server-list">${serverBreakdownHtml}</div>
        </div>
    </div>
`;
                }
                mesesHtml += '</div>';

                var conclusaoHtml = `
        <div class="conclusion">
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 15px;">Conclusão</h3>
            <p>Durante o ano de ${dados.ano}, o sistema registrou <strong>${dados.totalAlertsAnual} alertas</strong> com um MTTR médio de <strong>${dados.mttrMedioAnual} minutos</strong> e uma disponibilidade média de <strong>${dados.disponibilidadeMediaAnual.toFixed(2)}%</strong>. O mês mais crítico foi <strong>${dados.mesMaisCritico}</strong>, enquanto <strong>${dados.mesMaisEstavel}</strong> se destacou como o mais estável. O componente mais afetado foi <strong>${dados.componenteMaisAfetadoAno}</strong> e o servidor mais impactado foi <strong>${dados.servidorMaisAfetadoAno}</strong>, indicando focos para inspeção preventiva.</p>
        </div>
            <div style="text-align: center;">
                <button onclick="voltar('ano')" class="btn-voltar">Voltar</button>
            </div>
        </div>`;
                // Junta tudo e exibe de uma vez
                containerDoRelatorio.innerHTML = cabecalhoHtml + mesesHtml + conclusaoHtml;

            })
            .catch(function (erro) {
                console.error('Ocorreu um erro:', erro);
                containerDoRelatorio.innerHTML = `<h3>Falha na comunicação com o servidor.</h3><button onclick="voltar('ano')" class="btn-voltar">Voltar</button>`;
            });
    }

    function abrirRelatorioMensal(ano, mes) {
        var selecaoMesDiv = document.getElementById('selecaoMes');
        var containerDoRelatorio = document.getElementById('relatorio-container');

        var nomesDosMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        var nomeDoMes = nomesDosMeses[mes - 1];

        selecaoMesDiv.style.display = 'none';
        containerDoRelatorio.innerHTML = `<h3>Buscando dados detalhados de ${nomeDoMes} de ${ano}...</h3>`;

        fetch(`/relatorio/mensal-detalhado/${ano}/${mes}`)
            .then(function (resposta) {
                if (resposta.ok) {
                    return resposta.json();
                } else {
                    containerDoRelatorio.innerHTML = `<h3>Erro ao buscar dados.</h3><button onclick="voltar('mes')" class="btn-voltar">Voltar</button>`;
                }
            })
            .then(function (dados) {
               
                var kpis = dados.kpisGerais;
                var semanas = dados.dadosSemanais;
                  console.log(kpis)
                var htmlFinal = `
                <div class="relatorio-gerado">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 1.8rem; font-weight: bold; color: #ffe066;">${kpis.empresa}</h2>
                        <p style="font-size: 2.5rem; font-weight: 800; margin: 10px 0;margin-left:17%;">Relatório Mensal — ${nomeDoMes} de ${ano}</p>
                    </div>
                    <div class="kpi-grid">
                        <div class="kpi-card-gerado"><ion-icon name="alert-circle-outline" style="color: #eab308;"></ion-icon><div><div class="kpi-value">${kpis.totalAlerts}</div><div class="kpi-label">Total Alertas</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="time-outline" style="color: #3b82f6;"></ion-icon><div><div class="kpi-value">${Math.round(kpis.mttrMedio)} min</div><div class="kpi-label">MTTR Médio</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="shield-checkmark-outline" style="color: #22c55e;"></ion-icon><div><div class="kpi-value">${kpis.disponibilidade.toFixed(2)}%</div><div class="kpi-label">Disponibilidade</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="flame-outline" style="color: #ef4444;"></ion-icon><div><div class="kpi-value">${kpis.semanaMaisCritica}</div><div class="kpi-label">Semana Crítica</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="leaf-outline" style="color: #a3e635;"></ion-icon><div><div class="kpi-value">${kpis.semanaMaisEstavel}</div><div class="kpi-label">Semana Estável</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="server-outline" style="color: #2dd4bf;"></ion-icon><div><div class="kpi-value">${kpis.servidorMaisAfetado}</div><div class="kpi-label">Servidor Destaque</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="construct-outline" style="color: #06b6d4;"></ion-icon><div><div class="kpi-value">${kpis.componenteMaisAfetado}</div><div class="kpi-label">Comp. Destaque</div></div></div>
                        <div class="kpi-card-gerado"><ion-icon name="pulse-outline" style="color: #f97316;"></ion-icon><div><div class="kpi-value">${kpis.gravidadePredominante}</div><div class="kpi-label">Gravidade Comum</div></div></div>
                    </div>
                    <h3 style="text-align: center; font-size: 1.8rem; font-weight: bold; margin: 40px 0 20px 0;">Análise Semanal</h3>
                `;

                // for pras boxs das semanas
                for (var i = 0; i < semanas.length; i++) {
                    var semana = semanas[i];
                    htmlFinal += `
                    <div class="semana-card">
                        <h4>Semana ${semana.numero}</h4>
                        <div class="semana-kpis">
                            <span>Alertas: <strong>${semana.totalAlerts}</strong></span>
                            <span>MTTR: <strong>${semana.mttr.toFixed(0)} min</strong></span>
                            <span>Dispon.: <strong>${semana.disponibilidade.toFixed(2)}%</strong></span>
                            <span>Servidor Destaque: <strong>${semana.servidorDestaque}</strong></span>
                            <span>Comp. Destaque: <strong>${semana.componenteDestaque}</strong></span>
                        </div>
                        <table class="tabela-alertas">
                            <thead>
                                <tr>
                                    <th>Início</th>
                                    <th>Fim</th>
                                    <th>Duração (min)</th>
                                    <th>Servidor</th>
                                    <th>Componente</th>
                                    <th>Gravidade</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                    // For da tabela de alertas
                    for (var j = 0; j < semana.alertas.length; j++) {
                        var alerta = semana.alertas[j];
                        var inicioFormatado = new Date(alerta.inicio).toLocaleString('pt-BR');

                        var fimFormatado;
                        if (alerta.fim != null) {
                            fimFormatado = new Date(alerta.fim).toLocaleString('pt-BR');
                        } else {
                            fimFormatado = 'N/A';
                        }

                        htmlFinal += `
                        <tr>
                            <td>${inicioFormatado}</td>
                            <td>${fimFormatado}</td>
                            <td>${alerta.duracao}</td>
                            <td>${alerta.servidor}</td>
                            <td>${alerta.componente}</td>
                            <td>${alerta.gravidade}</td>
                        </tr>
                    `;
                    }
                    htmlFinal += `
                            </tbody>
                        </table>
                    </div>
                `;
                }

                htmlFinal += `
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="voltar('mes')" class="btn-voltar">Voltar</button>
                </div>
            </div>`;

                containerDoRelatorio.innerHTML = htmlFinal;
            })
            .catch(function (erro) {
                console.error('Ocorreu um erro:', erro);
                containerDoRelatorio.innerHTML = `<h3>Falha na comunicação com o servidor.</h3><button onclick="voltar('mes')" class="btn-voltar">Voltar</button>`;
            });
    }
    function voltar(paginaVoltar) {
        //Tira todo o html e css montado da pagina
        var selecaoAnoDiv = document.querySelector(`.selecao-${paginaVoltar}`);
        var containerDoRelatorio = document.getElementById('relatorio-container');
        selecaoAnoDiv.style.display = 'block';
        containerDoRelatorio.innerHTML = "<h3>Selecione um ano para ver o relatório</h3>";
    }
