let meuChart = null;
let meuChart2 = null;
function adicionarNomeServidor() {
    nomeServidor.innerHTML = localStorage.NOME_SERVIDOR
}

function mudarVisualizacao() {
    if (meuChart) {
        meuChart.destroy();
        meuChart = null;
    }

    if (meuChart2) {
        meuChart2.destroy();
        meuChart2 = null;
    }



    // pegando componente selecionado
    var selectElement = document.getElementById("selectComponentes");

    var selectedIndex = selectElement.selectedIndex;

    var selectedOption = selectElement.options[selectedIndex];

    var nomeComponente = selectedOption.text;

    var componente = selectedOption.value;

    // pegando periodo selecionado
    var periodo = selectPeriodo.value
    nomePeriodo.innerHTML = periodo


    if (nomeComponente == "Disco") {
        palavraAntesComponente = "do"
    } else {
        palavraAntesComponente = "da"
    }

    if (periodo == "Anual") {
        labelPeriodo = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        periodoParaTexto = "anuais"
        textoFreqAnterior = 'ano'
    } else {
        labelPeriodo = [
            '01/11', '02/11', '03/11', '04/11',
            '05/11', '06/11', '07/11', '08/11',
            '09/11', '10/11', '11/11', '12/11',
            '13/11', '14/11', '15/11', '16/11',
            '17/11', '18/11', '19/11', '20/11',
            '21/11', '22/11', '23/11', '24/11',
            '25/11', '26/11', '27/11', '28/11', '29/11', '30/11']
        periodoParaTexto = "mensais"
        textoFreqAnterior = 'mês'
    }

    fetch('/servidores/buscarPosicaoRank', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idempresa: sessionStorage.ID_EMPRESA,
            idComponente: componente,
            periodoAnalisado: periodo,
            idServidor: sessionStorage.ID_SERVIDOR
        })
    })
        .then(res => res.json())
        .then(posicao => {

            fetch('/servidores/buscarMetricas', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA,
                    idComponente: componente,
                    idServidor: sessionStorage.ID_SERVIDOR
                })
            })
                .then(res => res.json())
                .then(gravidades => {

                    console.log(gravidades);


                    fetch('/servidores/pegarFrequencia', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            idempresa: sessionStorage.ID_EMPRESA,
                            idComponente: componente,
                            periodoAnalisado: periodo,
                            idServidor: sessionStorage.ID_SERVIDOR
                        })
                    })
                        .then(res => res.json())
                        .then(frequencia => {

                            console.log(frequencia);


                            if (posicao[0].posicao_ranking <= 3) {
                                corPintar = 'red'
                            } else {
                                corPintar = 'green'
                            }

                            corFrequencia = 'green'

                            if (frequencia.length === 0) {
                                freq = 0
                                diferenca_freq = 0
                            } else {
                                freq = frequencia[0].frequencia_alerta_percentual
                                for (i = gravidades.length; i < gravidades.length; i--) {
                                    if (gravidades[i].valor <= frequencia[0].frequencia_alerta_percentual) {
                                        if (gravidades[i].nome_gravidade == 'Baixo') {
                                            corFrequencia = 'yellow'
                                            break
                                        } else if (gravidades[i].nome_gravidade == 'Alto') {
                                            corFrequencia = 'red'
                                            break
                                        } else {
                                            corFrequencia = 'orange'
                                            break
                                        }
                                    }
                                }

                                diferenca_freq = frequencia[0].diferenca_percentual

                                
                            }


                            if (diferenca_freq < 0) {
                                textoDiferenca = `↓ ${Math.abs(diferenca_freq)}% que o ${textoFreqAnterior} anterior`
                                corParaPintar = 'green'
                            } else if (diferenca_freq > 0) {
                                textoDiferenca = `↑ ${diferenca_freq}% que o ${textoFreqAnterior} anterior`
                                corParaPintar = 'red'
                            } else {
                                textoDiferenca = `${diferenca_freq}% de diferença do ${textoFreqAnterior} anterior`
                                corParaPintar = 'green'
                            }



                            containerGeral.innerHTML = `<div class="container-KPIS">
                    <div class="KPI">
                        <h2>Tempo em Alerta (%):</h2>
                        <h1 style="color: ${corFrequencia};">${freq}%</h1>
                        <h4 style="color: ${corParaPintar};">${textoDiferenca}</h4>
                    </div>
                    <div class="KPI">
                        <h2>Gravidade dos alertas:</h2>
                        <canvas id="alertasComponenteChart"></canvas>
                    </div>
                    <div class="KPI">
                        <h2 class="titulo-kpi">Ranking:<span class="info-icon" data-tooltip="Os três servidores com maior número de alertas de ${nomeComponente} são destacados em vermelho, indicando atenção prioritária.
Os demais aparecem em verde por representarem menor nível de criticidade.">
    <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" id="information-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary-upstroke" x1="12.05" y1="8" x2="11.95" y2="8" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary" x1="12" y1="13" x2="12" y2="16" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><path id="primary" d="M3,12a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9h0a9,9,0,0,1-9,9h0a9,9,0,0,1-9-9Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
  </span></h2>
                        <h1 class="texto-grande" style="color: ${corPintar};">${posicao[0].posicao_ranking}º</h1>
                        <h4> Servidor com mais alertas de ${nomeComponente}</h4>
                    </div>
                </div>
                <div class="container-KPIS-segunda-linha">
                    <div class="GRAFICO-2">
                        <h2>Variação do uso:</h2>
                        <canvas id="varicaoUso"></canvas>
                    </div>
                    <div class="Container-KPI-2">
                        <div class="KPI-2">
                        <h2>Uso médio ${palavraAntesComponente} ${nomeComponente}:</h2>
                        <h1>80%</h1>
                        </div>
                        <div class="KPI-2">
                        <h2>Taxa de variação do uso ${palavraAntesComponente} ${nomeComponente}:</h2>
                        <h1>80%</h1>
                        </div>
                        
                    </div>
                </div>`

                            fetch('/servidores/buscarAlertasComponenteEspecifico', {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    idempresa: sessionStorage.ID_EMPRESA,
                                    idComponente: componente,
                                    periodoAnalisado: periodo,
                                    idServidor: sessionStorage.ID_SERVIDOR
                                })
                            })
                                .then(res => res.json())
                                .then(alertas => {
                                    const ctx = document.getElementById('alertasComponenteChart');
                                    const container = ctx.parentElement;
                                    const msgExistente = container.querySelector('.msg-sem-servidores');
                                    if (msgExistente) msgExistente.remove();


                                    if (alertas.length === 0) {
                                        const msg = document.createElement('h1');
                                        msg.textContent = `Sem alertas ${periodoParaTexto} de ${nomeComponente}`;
                                        msg.classList.add('msg-sem-servidores');
                                        msg.style.textAlign = 'center';
                                        msg.style.fontSize = '2.0rem';
                                        msg.style.color = 'green';
                                        msg.style.marginTop = '-95px';
                                        container.appendChild(msg);

                                    } else {
                                        var dataAlertas = [];
                                        for (i = 0; i < alertas.length; i++) {
                                            dataAlertas.push(alertas[i].total_alertas);

                                        }

                                        meuChart = new Chart(ctx, {
                                            type: 'bar',
                                            data: {
                                                labels: ['Baixa', 'Média', 'Alta'],
                                                datasets: [{
                                                    label: 'Alertas Registrados',
                                                    data: dataAlertas,
                                                    backgroundColor: [
                                                        'rgba(255, 255, 0, 1)',
                                                        'rgba(255, 165, 0, 1)',
                                                        'rgba(255, 0, 0, 2.0)'
                                                    ],
                                                    borderColor: [
                                                        'rgba(255, 255, 0, 1)',
                                                        'rgba(3, 2, 0, 1)',
                                                        'rgba(255, 0, 0, 2.0)'
                                                    ],
                                                    borderWidth: 1,
                                                    borderRadius: 8
                                                }]
                                            },
                                            options: {

                                                responsive: true,
                                                plugins: {
                                                    legend: { display: false },
                                                    title: { display: true },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: ctx => `${ctx.parsed.y} alertas`
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: 'Quantidade de alertas',
                                                            color: '#fff',
                                                            font: {
                                                                size: 22
                                                            }
                                                        },
                                                        ticks: {
                                                            color: '#fff',
                                                            font: {
                                                                size: 18
                                                            }
                                                        },
                                                        grid: { color: '#333' }
                                                    },
                                                    x: {

                                                        ticks: {
                                                            color: '#fff',
                                                            font: {
                                                                size: 18
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }

                                })
                                .catch(erro => {
                                    console.error("Erro ao buscar alertas:", erro);
                                });

                            const ctx2 = document.getElementById('varicaoUso');

                            meuChart2 = new Chart(ctx2, {
                                type: 'line',
                                data: {
                                    labels: labelPeriodo,
                                    datasets: [
                                        {
                                            label: nomeComponente,
                                            data: [0, 0, 1, 0, 0, 0, 0,
                                                0, 0, 0, 3, 0, 0, 0,
                                                1, 0, 1, 0, 2, 0, 0,
                                                2, 0, 0, 0, 0, 1, 0,
                                                0, 0, 0],
                                            borderColor: '#a78bfa',
                                            backgroundColor: 'rgba(167,139,250,0.2)',
                                            tension: 0.3,
                                            fill: true,
                                            pointRadius: 4,
                                            borderWidth: 2
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                color: '#fff',
                                                font: {
                                                    size: 15
                                                }
                                            }
                                        },
                                        title: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        x: {

                                            ticks: {
                                                color: '#fff',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                            grid: { color: 'rgba(255,255,255,0.1)' }
                                        },
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                color: '#fff',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                            grid: { color: 'rgba(255,255,255,0.1)' }
                                        }
                                    }
                                }
                            });

                        })
                        .catch(erro => {
                            console.error("Erro ao buscar posicao:", erro);
                        });

                })
                .catch(erro => {
                    console.error("Erro ao buscar posicao:", erro);
                });




        })
        .catch(erro => {
            console.error("Erro ao buscar posicao:", erro);
        });





}

function carregarComponentes() {
    const selectCargo = document.getElementById("selectComponentes");

    fetch("/servidores/carregarComponentes", { method: "POST", headers: { "Content-Type": "application/json" } })
        .then(res => {
            if (!res.ok) throw "Erro na requisição de componentes!";
            return res.json();
        })
        .then(dados => {
            console.log("Componentes:", dados);
            dados.forEach(componente => {

                selectCargo.add(new Option(componente.nome, componente.id));


            });

            mudarVisualizacao()
        })
        .catch(erro => console.log("#ERRO componentes:", erro));
}