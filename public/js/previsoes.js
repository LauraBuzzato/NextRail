console.log(sessionStorage.ID_SERVIDOR)
const idServidor = sessionStorage.ID_SERVIDOR;
const idEmpresa = sessionStorage.ID_EMPRESA;
var passagem = true;
var botoesCriados = false;
var componenteAtual = "cpu";
var graficoLinha, graficoLatencia;
var visaoGeralAtiva = true;

const componentesMap = {
    'cpu': 1,
    'ram': 2, 
    'disco': 3
};

const coresComponentes = {
    cpu: "#a78bfa",
    ram: "#38bdf8",
    disco: "#ff89b0"
};

let metricasAlerta = {
    cpu: { baixo: 70, medio: 80, alto: 90 },
    ram: { baixo: 70, medio: 80, alto: 90 },
    disco: { baixo: 80, medio: 85, alto: 90 }
};

Chart.defaults.color = "#fff";
Chart.defaults.font.family = "Poppins";

async function buscarMetricasDoBanco(componente) {
    try {
        const fkComponente = componentesMap[componente];
        if (!fkComponente) {
            return null;
        }

        const response = await fetch('/servidores/buscarMetricas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idempresa: idEmpresa,
                idComponente: fkComponente,
                idServidor: idServidor
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar métricas');
        }

        const metricas = await response.json();
        
        return processarMetricas(metricas);
        
    } catch (error) {
        return null;
    }
}

function processarMetricas(dados) {
    const metricas = { baixo: 70, medio: 80, alto: 90 };
    
    if (dados && Array.isArray(dados) && dados.length > 0) {
        dados.forEach(item => {
            const gravidade = item.nome_gravidade ? item.nome_gravidade.toLowerCase() : '';
            const valor = Number(item.valor) || 0;
            
            if (gravidade.includes('baixo')) {
                metricas.baixo = valor;
            } else if (gravidade.includes('médio') || gravidade.includes('medio')) {
                metricas.medio = valor;
            } else if (gravidade.includes('alto')) {
                metricas.alto = valor;
            }
        });
    }
    
    return metricas;
}

async function carregarTodasMetricas() {
    try {
        const [cpuMetricas, ramMetricas, discoMetricas] = await Promise.all([
            buscarMetricasDoBanco('cpu'),
            buscarMetricasDoBanco('ram'),
            buscarMetricasDoBanco('disco')
        ]);

        if (cpuMetricas) metricasAlerta.cpu = cpuMetricas;
        if (ramMetricas) metricasAlerta.ram = ramMetricas;
        if (discoMetricas) metricasAlerta.disco = discoMetricas;

    } catch (error) {
    }
}

async function buscarDadosHistoricosAlertas(componente, periodo) {
    const fkEmpresa = idEmpresa;
    const fkServidor = idServidor;
    const fkComponente = componentesMap[componente];

    if (!fkComponente) {
        return null;
    }

    try {
        const response = await fetch('/servidores/buscarAlertasHistorico', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idempresa: fkEmpresa,
                idComponente: fkComponente,
                idServidor: fkServidor,
                periodo: periodo
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const dadosReais = await response.json();
        
        return processarDadosParaPrevisao(dadosReais, periodo);
    } catch (error) {
        return null;
    }
}

async function buscarDadosPrevisaoAWS() {
    try {
        const periodo = periodoSelect.value;
        const response = await fetch('/servidores/pegarPrevisao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                servidorId: idServidor,
                periodo: periodo
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const dadosAWS = await response.json();

        return dadosAWS;

    } catch (error) {
        return null;
    }
}

function processarDadosParaPrevisao(dadosReais, periodo) {
    
    if (!dadosReais || !Array.isArray(dadosReais) || dadosReais.length === 0) {
        
        return {
            historico: 2,
            previsao: 2,
            alto: [0, 0, 0, 0],
            medio: [0, 0, 0, 0],
            baixo: [0, 0, 0, 0]
        };
    }
    
    const dadosPeriodoAnterior = dadosReais.find(d => d.periodo && d.periodo.includes('anterior'));
    const dadosPeriodoAtual = dadosReais.find(d => d.periodo && d.periodo.includes('atual'));
    
    const alertasAltos = [
        dadosPeriodoAnterior ? Number(dadosPeriodoAnterior.alertas_altos) || 0 : 0,
        dadosPeriodoAtual ? Number(dadosPeriodoAtual.alertas_altos) || 0 : 0
    ];
    
    const alertasMedios = [
        dadosPeriodoAnterior ? Number(dadosPeriodoAnterior.alertas_medios) || 0 : 0,
        dadosPeriodoAtual ? Number(dadosPeriodoAtual.alertas_medios) || 0 : 0
    ];
    
    const alertasBaixos = [
        dadosPeriodoAnterior ? Number(dadosPeriodoAnterior.alertas_baixos) || 0 : 0,
        dadosPeriodoAtual ? Number(dadosPeriodoAtual.alertas_baixos) || 0 : 0
    ];
    
    const numPrevisoes = 2;
    const previsoesAltos = calcularPrevisaoTendencia(alertasAltos, numPrevisoes);
    const previsoesMedios = calcularPrevisaoTendencia(alertasMedios, numPrevisoes);
    const previsoesBaixos = calcularPrevisaoTendencia(alertasBaixos, numPrevisoes);
    
    const resultadoAlto = [...alertasAltos, ...previsoesAltos];
    const resultadoMedio = [...alertasMedios, ...previsoesMedios];
    const resultadoBaixo = [...alertasBaixos, ...previsoesBaixos];
    
    return {
        alto: resultadoAlto,
        medio: resultadoMedio,
        baixo: resultadoBaixo,
        historico: 2,
        previsao: numPrevisoes
    };
}

function calcularPrevisaoTendencia(dadosHistoricos, numPrevisoes) {
    if (dadosHistoricos.length < 2) {
        return Array(numPrevisoes).fill(dadosHistoricos[0] || 0);
    }
    
    const previsoes = [];
    const n = dadosHistoricos.length;
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += dadosHistoricos[i];
        sumXY += i * dadosHistoricos[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    for (let i = 0; i < numPrevisoes; i++) {
        let previsao = slope * (n + i) + intercept;
        previsao = Math.max(0, Math.round(previsao));
        previsoes.push(previsao);
    }

    return previsoes;
}

function determinarCorPorMetrica(valor, componente) {
    const metricas = metricasAlerta[componente] || metricasAlerta.cpu;
    
    if (valor < metricas.baixo) {
        return '#51cf66';
    } else if (valor < metricas.medio) {
        return '#ffd43b';
    } else if (valor < metricas.alto) {
        return '#ff922b';
    } else {
        return '#ff6b6b';
    }
}

function mostrarMensagemSemDados(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Dados não encontrados para o período selecionado", canvas.width / 2, canvas.height / 2);
}

function destruirGrafico(grafico) {
    if (grafico && typeof grafico.destroy === 'function') {
        grafico.destroy();
    }
    return null;
}

function limparTodosGraficos() {
    graficoLinha = destruirGrafico(graficoLinha);
    graficoLatencia = destruirGrafico(graficoLatencia);
}

function criarBotoesComponentes() {
    if (botoesCriados) {
        return;
    }

    const btnVisaoGeral = document.createElement('button');
    btnVisaoGeral.className = 'btn-visao-geral';
    btnVisaoGeral.id = 'btnVisaoGeral';
    btnVisaoGeral.textContent = 'Visão Geral';

    btnVisaoGeral.style.background = "#ffe066";
    btnVisaoGeral.style.color = "#000";
    btnVisaoGeral.style.border = "1px solid #ffe066";

    btnVisaoGeral.addEventListener('click', toggleVisaoGeral);

    const filtrosContainer = document.getElementById('filtrosContainer');
    if (filtrosContainer) {
        filtrosContainer.appendChild(btnVisaoGeral);
    }

    const botoesContainer = document.createElement('div');
    botoesContainer.className = 'botoes-componentes hidden';
    botoesContainer.id = 'botoesComponentes';
    botoesContainer.innerHTML = `
            <label>Componente:</label>
            <div class="grupo-botoes">
                <button class="btn-componente" data-componente="cpu">
                    <ion-icon name="hardware-chip-outline"></ion-icon>
                    CPU
                </button>
                <button class="btn-componente" data-componente="ram">
                    <ion-icon name="speedometer-outline"></ion-icon>
                    RAM
                </button>
                <button class="btn-componente" data-componente="disco">
                    <ion-icon name="save-outline"></ion-icon>
                    Disco
                </button>
            </div>
        `;

    if (filtrosContainer) {
        filtrosContainer.appendChild(botoesContainer);
    }

    botoesCriados = true;

    document.querySelectorAll('.btn-componente').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-componente').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            componenteAtual = this.dataset.componente;
            visaoGeralAtiva = false;

            const btnVisaoGeral = document.getElementById('btnVisaoGeral');
            btnVisaoGeral.textContent = 'Voltar para Visão Geral';
            btnVisaoGeral.style.background = "transparent";
            btnVisaoGeral.style.color = "#ffe066";
            btnVisaoGeral.style.border = "1px solid #ffe066";

            atualizarDashboard();
        });
    });
}

function toggleVisaoGeral() {
    visaoGeralAtiva = !visaoGeralAtiva;
    const btnVisaoGeral = document.getElementById('btnVisaoGeral');
    const botoesComponentes = document.getElementById('botoesComponentes');

    if (visaoGeralAtiva) {
        btnVisaoGeral.textContent = 'Visão Geral';
        botoesComponentes.classList.add('hidden');
        document.querySelectorAll('.btn-componente').forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        btnVisaoGeral.textContent = 'Voltar para Visão Geral';
        botoesComponentes.classList.remove('hidden');

        document.querySelectorAll('.btn-componente').forEach(btn => {
            if (btn.dataset.componente === componenteAtual) {
                btn.classList.add('active');
            }
        });
    }
    if (btnVisaoGeral.textContent == "Voltar para Visão Geral") {
        btnVisaoGeral.style.background = "transparent";
        btnVisaoGeral.style.color = "#ffe066";
        btnVisaoGeral.style.border = "1px solid #ffe066";
    } else {
        btnVisaoGeral.style.background = "#ffe066";
        btnVisaoGeral.style.color = "#000";
        btnVisaoGeral.style.border = "1px solid #ffe066";
    }

    atualizarDashboard();
}

async function atualizarDashboard() {
    const periodo = periodoSelect.value;

    limparTodosGraficos();

    await carregarTodasMetricas();

    if (!visaoGeralAtiva) {
        await renderGraficoAlertas();
    }

    try {
        const dadosAWS = await buscarDadosPrevisaoAWS();

        if (dadosAWS) {
            if (visaoGeralAtiva) {
                renderGraficoLinhasMultiplas(dadosAWS);
                renderGraficoLatenciaGeral(dadosAWS);
                atualizarKPIsGerais(dadosAWS);
            } else {
                renderGraficoLinhaUnica(dadosAWS);
                atualizarKPIs(dadosAWS);
            }
        } else {
            document.getElementById("kpisContainer").innerHTML = '<div class="KPI"><p>Dados de previsão temporariamente indisponíveis</p></div>';
        }
    } catch (error) {
        if (!visaoGeralAtiva) {
            document.getElementById("kpisContainer").innerHTML = '<div class="KPI"><p>Dados de previsão temporariamente indisponíveis</p></div>';
        }
    }
}

function renderGraficoLinhasMultiplas(dados) {
    const canvas = document.getElementById("graficoPrevisaoLinha");
    if (!canvas) {
        return;
    }

    const labels = periodoSelect.value === "semanal"
        ? ["Semana Anterior", "Semana Atual", "Próxima Semana", "Semana +2"]
        : ["Mês Anterior", "Mês Atual", "Próximo Mês", "Mês +2"];

    const datasets = [];

    for (const componente in dados) {
        if (['cpu', 'ram', 'disco'].includes(componente)) {
            const dadosCompletos = dados[componente];
            
            if (!dadosCompletos || dadosCompletos.length !== 4) {
                continue;
            }

            const dadosHistorico = dadosCompletos.slice(0, 2);
            const dadosPrevisao = dadosCompletos.slice(2, 4);
            
            datasets.push({
                label: componente.toUpperCase(),
                data: dadosHistorico.concat(Array(2).fill(null)),
                borderColor: coresComponentes[componente],
                backgroundColor: `${coresComponentes[componente]}20`,
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: coresComponentes[componente],
                spanGaps: true
            });

            const dadosPrevisaoComPontoInicial = [dadosHistorico[1]].concat(dadosPrevisao);
            const dadosTracejados = Array(1).fill(null).concat(dadosPrevisaoComPontoInicial);

            datasets.push({
                label: componente.toUpperCase() + " (previsão)",
                data: dadosTracejados,
                borderColor: coresComponentes[componente],
                backgroundColor: `${coresComponentes[componente]}20`,
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 3,
                pointBackgroundColor: coresComponentes[componente],
                borderDash: [5, 5],
                spanGaps: true,
                isDashed: true
            });
        }
    }

    const ctx = canvas.getContext("2d");

    if (graficoLinha) {
        graficoLinha.destroy();
    }

    graficoLinha = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        filter: function (legendItem, chartData) {
                            const dataset = chartData.datasets[legendItem.datasetIndex];
                            return !dataset.isDashed;
                        },
                        color: '#fff',
                        font: {
                            size: 15
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                },
                x: {
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                }
            }
        }
    });
}

function renderGraficoLinhaUnica(dados) {
    const canvas = document.getElementById("graficoPrevisaoLinha");
    if (!canvas) {
        return;
    }

    const labels = periodoSelect.value === "semanal"
        ? ["Semana Anterior", "Semana Atual", "Próxima Semana", "Semana +2"]
        : ["Mês Anterior", "Mês Atual", "Próximo Mês", "Mês +2"];

    const dadosCompletos = dados[componenteAtual];
    
    if (!dadosCompletos || dadosCompletos.length !== 4) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    const coresPontos = dadosCompletos.map(valor => 
        determinarCorPorMetrica(valor, componenteAtual)
    );

    const datasets = [
        {
            label: componenteAtual.toUpperCase(),
            data: dadosCompletos,
            borderColor: coresComponentes[componenteAtual],
            backgroundColor: coresPontos,
            pointBackgroundColor: coresPontos,
            pointBorderColor: '#fff',
            pointRadius: 8,
            pointHoverRadius: 10,
            fill: false,
            tension: 0.4,
            borderWidth: 3
        }
    ];

    const metricas = metricasAlerta[componenteAtual];
    if (metricas) {
        if (metricas.baixo > 0) {
            datasets.push({
                label: "Limite Baixo",
                data: Array(4).fill(metricas.baixo),
                borderColor: "#ffd43b",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            });
        }
        
        if (metricas.medio > 0) {
            datasets.push({
                label: "Limite Médio",
                data: Array(4).fill(metricas.medio),
                borderColor: "#ff922b",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            });
        }
        
        if (metricas.alto > 0) {
            datasets.push({
                label: "Limite Alto",
                data: Array(4).fill(metricas.alto),
                borderColor: "#ff6b6b",
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            });
        }
    }

    const ctx = canvas.getContext("2d");

    if (graficoLinha) {
        graficoLinha.destroy();
    }

    const temDadosValidos = dadosCompletos.some(valor => valor > 0);
    if (!temDadosValidos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    graficoLinha = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#fff",
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                },
                x: {
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                }
            }
        }
    });
}

function renderGraficoLatenciaGeral(dados) {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) {
        return;
    }
    
    const periodo = periodoSelect.value;
    let labels;

    if (periodo === "semanal") {
        labels = ["Semana Anterior", "Semana Atual", "Próxima Semana", "Semana +2"];
    } else {
        labels = ["Mês Anterior", "Mês Atual", "Próximo Mês", "Mês +2"];
    }

    const data = dados.latencia || [0, 0, 0, 0];

    const ctx = canvas.getContext("2d");

    if (graficoLatencia) {
        graficoLatencia.destroy();
    }

    const temDadosValidos = data.some(valor => valor > 0);
    if (!temDadosValidos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    graficoLatencia = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Latência Média (ms)",
                    data: data,
                    backgroundColor: "rgba(65, 94, 243, 0.8)",
                    borderColor: "rgba(20, 35, 168, 1)",
                    borderWidth: 2
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                },
                x: {
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: {
                            size: 15
                        }
                    }
                }
            }
        }
    });
}

async function renderGraficoAlertas() {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) {
        return;
    }

    const periodo = periodoSelect.value;
    const alertasReais = await buscarDadosHistoricosAlertas(componenteAtual, periodo);

    if (!alertasReais) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    const dadosProcessados = processarDadosParaPrevisao(alertasReais, periodo);

    if (!dadosProcessados) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    if (dadosProcessados.alto.length === 0 || dadosProcessados.medio.length === 0 || dadosProcessados.baixo.length === 0) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    let labels = [];
    const totalPontos = dadosProcessados.historico + dadosProcessados.previsao;

    if (periodo === "semanal") {
        for (let i = 0; i < totalPontos; i++) {
            if (i < dadosProcessados.historico) {
                labels.push(`Semana ${i + 1}`);
            } else {
                labels.push(`Próxima ${i - dadosProcessados.historico + 1}`);
            }
        }
    } else {
        for (let i = 0; i < totalPontos; i++) {
            if (i < dadosProcessados.historico) {
                labels.push(`Mês ${i + 1}`);
            } else {
                labels.push(`Próximo ${i - dadosProcessados.historico + 1}`);
            }
        }
    }

    if (dadosProcessados.alto.length !== totalPontos ||
        dadosProcessados.medio.length !== totalPontos ||
        dadosProcessados.baixo.length !== totalPontos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    if (graficoLatencia) {
        graficoLatencia.destroy();
    }

    const temDadosValidos = dadosProcessados.alto.some(valor => valor > 0) || 
                          dadosProcessados.medio.some(valor => valor > 0) || 
                          dadosProcessados.baixo.some(valor => valor > 0);

    if (!temDadosValidos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    const ctx = canvas.getContext("2d");
    graficoLatencia = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Alertas Baixos",
                    data: dadosProcessados.baixo,
                    backgroundColor: "rgba(255, 235, 59, 0.8)",
                    borderColor: "rgba(255, 235, 59, 1)",
                    borderWidth: 1
                },
                {
                    label: "Alertas Médios",
                    data: dadosProcessados.medio,
                    backgroundColor: "rgba(255, 152, 0, 0.8)",
                    borderColor: "rgba(255, 152, 0, 1)",
                    borderWidth: 1
                },
                {
                    label: "Alertas Altos",
                    data: dadosProcessados.alto,
                    backgroundColor: "rgba(244, 67, 54, 0.8)",
                    borderColor: "rgba(244, 67, 54, 1)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "#fff",
                        font: { size: 15 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255,255,255,0.1)" },
                    ticks: { color: "#fff", font: { size: 15 } }
                },
                x: {
                    grid: { color: "rgba(255,255,255,0.1)" },
                    ticks: {
                        color: "#fff",
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

async function atualizarKPIs(dados) {
    const valores = dados[componenteAtual] || [0, 0, 0, 0];
    const mediaUso = Array.isArray(valores) ?
        (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1) : "0.0";

    const periodo = periodoSelect.value;
    
    let crescimentoPercentual = 0;
    let tendencia = "estavel";
    
    if (valores.length >= 2) {
        const primeiroValor = valores[0] || 0;
        const ultimoValor = valores[1] || 0;
        
        if (primeiroValor > 0) {
            crescimentoPercentual = ((ultimoValor - primeiroValor) / primeiroValor) * 100;
        }
        
        if (crescimentoPercentual > 5) {
            tendencia = "crescendo";
        } else if (crescimentoPercentual < -5) {
            tendencia = "decrescendo";
        } else {
            tendencia = "estavel";
        }
    }

    const alertasReais = await buscarDadosHistoricosAlertas(componenteAtual, periodo);
    let alertaMaisFrequente = "Baixo";
    
    if (alertasReais) {
        let totalAlto = 0;
        let totalMedio = 0;
        let totalBaixo = 0;

        if (alertasReais.alto && alertasReais.alto.length > 0) {
            totalAlto = alertasReais.alto.reduce((a, b) => a + b, 0);
        }
        if (alertasReais.medio && alertasReais.medio.length > 0) {
            totalMedio = alertasReais.medio.reduce((a, b) => a + b, 0);
        }
        if (alertasReais.baixo && alertasReais.baixo.length > 0) {
            totalBaixo = alertasReais.baixo.reduce((a, b) => a + b, 0);
        }

        if (totalAlto > totalMedio && totalAlto > totalBaixo) alertaMaisFrequente = "Alto";
        else if (totalMedio > totalBaixo) alertaMaisFrequente = "Médio";
    }
    
    const corTendencia = getCorTendencia(tendencia);
    const iconeTendencia = getIconeTendencia(tendencia);

    const periodoTexto = periodo === "mensal" ? "Mensal" : "Semanal";
    const corMedia = determinarCorPorMetrica(Number(mediaUso), componenteAtual);

    document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de Uso Médio ${periodoTexto}</h2>
            <p class="valor-kpi" style="color:${corMedia}">${mediaUso}%</p>
        </div>
        <div class="KPI">
            <h2>Taxa de Crescimento ${periodoTexto}</h2>
            <p class="valor-kpi" style="color:${corTendencia}">
                ${crescimentoPercentual > 0 ? '+' : ''}${crescimentoPercentual.toFixed(1)}%
            </p>
            <p class="tendencia" style="color:${corTendencia}">
                ${iconeTendencia || ''} ${tendencia === "crescendo" ? "Crescendo" : 
                  tendencia === "decrescendo" ? "Decrescendo" : "Estável"}
            </p>
        </div>
        <div class="KPI">
            <h2>Previsão do Alerta Mais Frequente</h2>
            <p class="valor-kpi" style="color:${
                alertaMaisFrequente === 'Alto' ? '#ff6b6b' : 
                alertaMaisFrequente === 'Médio' ? '#ff922b' : '#ffd43b'
            }">${alertaMaisFrequente}</p>
        </div>
        <div class="KPI">
            <h2>Status do Componente</h2>
            <p class="valor-kpi" style="color:${corMedia}">
                ${Number(mediaUso) < metricasAlerta[componenteAtual].baixo ? 'Normal' : 
                  Number(mediaUso) < metricasAlerta[componenteAtual].medio ? 'Atenção' : 
                  Number(mediaUso) < metricasAlerta[componenteAtual].alto ? 'Crítico' : 'Crítico'}
            </p>
        </div>
    `;
}

function atualizarKPIsGerais(dados) {
    const periodo = periodoSelect.value;
    const periodoTexto = periodo === "mensal" ? "Mensal" : "Semanal";
    
    const ultimoValores = {
        cpu: dados.cpu ? dados.cpu[dados.cpu.length - 1] : 0,
        ram: dados.ram ? dados.ram[dados.ram.length - 1] : 0,
        disco: dados.disco ? dados.disco[dados.disco.length - 1] : 0
    };
    
    const mediaGeral = (ultimoValores.cpu + ultimoValores.ram + ultimoValores.disco) / 3;
    
    const nomes = {
        cpu: "CPU",
        ram: "RAM",
        disco: "Disco"
    };
    
    const maiorComponente = Object.keys(ultimoValores).reduce((a, b) => 
        ultimoValores[a] > ultimoValores[b] ? a : b
    );
    
    const corMedia = determinarCorPorMetrica(mediaGeral, 'cpu');
    const corMaiorComponente = determinarCorPorMetrica(ultimoValores[maiorComponente], maiorComponente);

    document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Uso Médio Geral ${periodoTexto}</h2>
            <p class="valor-kpi" style="color:${corMedia}">
                ${mediaGeral.toFixed(1)}%
            </p>
        </div>
        <div class="KPI">
            <h2>Componente com Maior Uso</h2>
            <p class="valor-kpi" style="color:${corMaiorComponente}">
                ${nomes[maiorComponente] || 'N/A'}
            </p>
            <p class="tendencia" style="color:${corMaiorComponente}">
                ${ultimoValores[maiorComponente].toFixed(1)}%
            </p>
        </div>
        <div class="KPI">
            <h2>Tendência da Latência</h2>
            <p class="valor-kpi" style="color:#415ef3">
                ${dados.latencia ? dados.latencia[dados.latencia.length - 1].toFixed(1) : '0.0'}ms
            </p>
        </div>
        <div class="KPI">
            <h2>Status Geral do Servidor</h2>
            <p class="valor-kpi" style="color:${corMedia}">
                ${mediaGeral < metricasAlerta.cpu.baixo ? 'Normal' : 
                  mediaGeral < metricasAlerta.cpu.medio ? 'Atenção' : 
                  mediaGeral < metricasAlerta.cpu.alto ? 'Crítico' : 'Crítico'}
            </p>
        </div>
    `;
}

function getIconeTendencia(tendencia) {
    switch(tendencia) {
        case 'crescendo': return '📈';
        case 'decrescendo': return '📉';
        default: return null;
    }
}

function getCorTendencia(tendencia) {
    switch(tendencia) {
        case 'crescendo': return '#ff6b6b';
        case 'decrescendo': return '#51cf66';
        default: return 'rgba(255, 255, 255, 1)';
    }
}

function inicializar() {
    criarBotoesComponentes();

    const periodoSelect = document.getElementById("periodoSelect");
    if (periodoSelect) {
        periodoSelect.addEventListener("change", () => {
            passagem = true;
            atualizarDashboard();
        });
    }

    atualizarDashboard();
}

document.addEventListener('DOMContentLoaded', function () {
    passagem = true;
    visaoGeralAtiva = true;
    inicializar();
});