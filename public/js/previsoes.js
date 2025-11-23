console.log(sessionStorage.ID_SERVIDOR)
const testeServidor = sessionStorage.ID_SERVIDOR;
const testeEmpresa = sessionStorage.ID_EMPRESA;
var passagem = true;
var botoesCriados = false;
var componenteAtual = "cpu";
var graficoLinha, graficoLatencia;
var visaoGeralAtiva = true;

const AWS_CONFIG = {
    bucketName: 'bucket-client-teste-etl',
    region: 'us-east-1'
};

Chart.defaults.color = "#fff";
Chart.defaults.font.family = "Poppins";

async function buscarDadosHistoricosAlertas(componente, periodo) {
    const fkEmpresa = testeEmpresa;
    const fkServidor = testeServidor;

    const componentesMap = {
        'cpu': 1,
        'ram': 2,
        'disco': 3
    };

    const fkComponente = componentesMap[componente];

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
        console.error('Erro ao buscar dados históricos:', error);
        return null;
    }
}

async function buscarDadosPrevisaoAWS() {
    const empresa = sessionStorage.NOME_EMPRESA;
    const servidor = sessionStorage.NOME_SERVIDOR;
    const dataAtc = new Date();
    const dia = ('0' + dataAtc.getDate()).slice(-2);
    const mes = ('0' + (dataAtc.getMonth() + 1)).slice(-2); 
    const ano = dataAtc.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;

    try {
        const url = `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${empresa}/${servidor}/previsoes/dadosPrev_${dataFormatada}.json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status}`);
        }

        const dados = await response.json();
        return dados;

    } catch (error) {
        console.error('Erro ao buscar dados da AWS:', error);
        return null;
    }
}

function calcularPrevisaoTendencia(dadosHistoricos, numPrevisoes) {
    const dadosNumericos = [];
    for (let i = 0; i < dadosHistoricos.length; i++) {
        dadosNumericos.push(Number(dadosHistoricos[i]) || 0);
    }
    
    console.log('Dados numéricos para previsão:', dadosNumericos);

    if (dadosNumericos.length < 2) {
        const valorBase = dadosNumericos[0] || 1;
        const previsoes = [];
        for (let i = 0; i < numPrevisoes; i++) {
            previsoes.push(valorBase);
        }
        return previsoes;
    }

    const n = dadosNumericos.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += dadosNumericos[i];
        sumXY += i * dadosNumericos[i];
        sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    console.log('Regressão - Slope:', slope, 'Intercept:', intercept, 'n:', n);

    const previsoes = [];
    for (let i = 0; i < numPrevisoes; i++) {
        let previsao = slope * (n + i) + intercept;
        previsao = Math.max(0, Math.round(previsao));
        previsoes.push(previsao);
    }
    
    console.log('Previsões finais:', previsoes);
    return previsoes;
}
function processarDadosParaPrevisao(dadosReais, periodo) {
    if (dadosReais && dadosReais.alto && dadosReais.medio && dadosReais.baixo) {
        console.log('Dados já processados, retornando diretamente');
        return dadosReais;
    }

    if (!dadosReais || !Array.isArray(dadosReais) || dadosReais.length === 0) {
        console.log('Dados inválidos para processamento:', dadosReais);
        return null;
    }

    const dadosOrdenados = [...dadosReais].sort((a, b) => {
        if (periodo === "semanal") return a.semana - b.semana;
        return (a.ano * 100 + a.mes) - (b.ano * 100 + b.mes);
    });

    const alertasAltos = [];
    const alertasMedios = [];
    const alertasBaixos = [];

    for (let i = 0; i < dadosOrdenados.length; i++) {
        alertasAltos.push(Number(dadosOrdenados[i].alertas_altos) || 0);
        alertasMedios.push(Number(dadosOrdenados[i].alertas_medios) || 0);
        alertasBaixos.push(Number(dadosOrdenados[i].alertas_baixos) || 0);
    }

    console.log('Alertas altos (numérico):', alertasAltos);
    console.log('Alertas medios (numérico):', alertasMedios);
    console.log('Alertas baixos (numérico):', alertasBaixos);

    const numPrevisoes = 4;

    const previsoesAltos = calcularPrevisaoTendencia(alertasAltos, numPrevisoes);
    const previsoesMedios = calcularPrevisaoTendencia(alertasMedios, numPrevisoes);
    const previsoesBaixos = calcularPrevisaoTendencia(alertasBaixos, numPrevisoes);

    console.log('Previsões altos:', previsoesAltos);
    console.log('Previsões medios:', previsoesMedios);
    console.log('Previsões baixos:', previsoesBaixos);

    const resultadoAlto = [];
    const resultadoMedio = [];
    const resultadoBaixo = [];

    for (let i = 0; i < alertasAltos.length; i++) {
        resultadoAlto.push(alertasAltos[i]);
    }
    for (let i = 0; i < previsoesAltos.length; i++) {
        resultadoAlto.push(previsoesAltos[i]);
    }

    for (let i = 0; i < alertasMedios.length; i++) {
        resultadoMedio.push(alertasMedios[i]);
    }
    for (let i = 0; i < previsoesMedios.length; i++) {
        resultadoMedio.push(previsoesMedios[i]);
    }

    for (let i = 0; i < alertasBaixos.length; i++) {
        resultadoBaixo.push(alertasBaixos[i]);
    }
    for (let i = 0; i < previsoesBaixos.length; i++) {
        resultadoBaixo.push(previsoesBaixos[i]);
    }

    return {
        alto: resultadoAlto,
        medio: resultadoMedio,
        baixo: resultadoBaixo,
        historico: dadosOrdenados.length,
        previsao: numPrevisoes
    };
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

function calcularTaxaCrescimentoTotal(dados) {
    const taxas = {};
    for (const componente in dados) {
        const valores = dados[componente];
        if (valores.length >= 2) {
            const crescimento = ((valores[valores.length - 1] - valores[0]) / valores[0]) * 100;
            taxas[componente] = parseFloat(crescimento.toFixed(2));
        }
    }
    return taxas;
}

function encontrarComponenteMaiorCrescimento(taxas) {
    let maiorComponente = '';
    let maiorTaxa = -Infinity;

    for (const componente in taxas) {
        const taxaAtual = parseFloat(taxas[componente]);

        if (taxaAtual > maiorTaxa) {
            maiorTaxa = taxaAtual;
            maiorComponente = componente;
        }
    }

    return { componente: maiorComponente, taxa: maiorTaxa.toFixed(1) };
}

async function atualizarDashboard() {
    const periodo = periodoSelect.value;

    limparTodosGraficos();

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

    const cores = {
        cpu: "#a78bfa",
        ram: "#38bdf8",
        disco: "#ff89b0"
    };

    const nomes = {
        cpu: "CPU",
        ram: "RAM",
        disco: "Disco"
    };

    const labels = periodoSelect.value === "semanal"
        ? ["Semana Passada", "Semana Atual", "Próxima Semana", "Semana +2"]
        : ["Mês Passado", "Mês Atual", "Próximo Mês", "Mês +2"];

    const datasets = [];

    for (const componente in dados) {
        if (componente !== 'latencia') {
            datasets.push({
                label: `${nomes[componente]} (%)`,
                data: dados[componente].slice(0, 4),
                borderColor: cores[componente],
                backgroundColor: `${cores[componente]}20`,
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: cores[componente]
            });
        }
    }

    const ctx = canvas.getContext("2d");
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

    const cores = {
        cpu: "#a78bfa",
        ram: "#38bdf8",
        disco: "#ff89b0"
    };

    const limite = {
        cpu: 70,
        ram: 70,
        disco: 80
    }

    const nomes = {
        cpu: "CPU",
        ram: "RAM",
        disco: "Disco"
    };

    const labels = periodoSelect.value === "semanal"
        ? ["Semana Passada", "Semana Atual", "Próxima Semana", "Semana +2"]
        : ["Mês Passado", "Mês Atual", "Próximo Mês", "Mês +2"];

    const ctx = canvas.getContext("2d");
    graficoLinha = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: `${nomes[componenteAtual]} (%)`,
                    data: dados[componenteAtual].slice(0, 4),
                    borderColor: cores[componenteAtual],
                    backgroundColor: `${cores[componenteAtual]}20`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: cores[componenteAtual]
                },
                {
                    label: 'Limite alerta',
                    data: Array(4).fill(Number(limite[componenteAtual])),
                    borderColor: 'yellow',
                    backgroundColor: 'rgba(166, 161, 84, 0.2)',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 0,
                    datalabels: { display: false }
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
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

function renderGraficoLatenciaGeral(dados) {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) {
        return;
    }

    const periodo = periodoSelect.value;

    let labels, data;

    if (periodo === "semanal") {
        labels = ["Semana Passada", "Semana Atual", "Próxima Semana", "Semana +2"];
        data = [65, 67, 63, 69];
    } else {
        labels = ["Mês Passado", "Mês Atual", "Próximo Mês", "Mês +2"];
        data = [62, 65, 63, 68];
    }

    const ctx = canvas.getContext("2d");
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
        console.log('Canvas não encontrado');
        return;
    }

    const periodo = periodoSelect.value;
    const alertasReais = await buscarDadosHistoricosAlertas(componenteAtual, periodo);

    console.log('Dados recebidos do banco:', alertasReais);

    if (!alertasReais) {
        document.getElementById("graflat").textContent = "Erro ao carregar dados de alertas";
        return;
    }

    const dadosProcessados = processarDadosParaPrevisao(alertasReais, periodo);

    console.log('Dados processados:', dadosProcessados);

    if (!dadosProcessados) {
        document.getElementById("graflat").textContent = "Dados insuficientes para previsão";
        return;
    }


    if (dadosProcessados.alto.length === 0 || dadosProcessados.medio.length === 0 || dadosProcessados.baixo.length === 0) {
        console.log('Arrays vazios - sem dados para plotar');
        document.getElementById("graflat").textContent = "Sem dados suficientes para gerar gráfico";
        return;
    }

    let labels = [];
    const totalPontos = dadosProcessados.historico + dadosProcessados.previsao;

    console.log('Total de pontos:', totalPontos, 'Histórico:', dadosProcessados.historico, 'Previsão:', dadosProcessados.previsao);

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

    console.log('Labels gerados:', labels);
    console.log('Dados altos:', dadosProcessados.alto);
    console.log('Dados medios:', dadosProcessados.medio);
    console.log('Dados baixos:', dadosProcessados.baixo);

    if (dadosProcessados.alto.length !== totalPontos || 
        dadosProcessados.medio.length !== totalPontos || 
        dadosProcessados.baixo.length !== totalPontos) {
        console.log('Erro: Arrays de dados com tamanhos diferentes');
        return;
    }

    if (graficoLatencia) {
        graficoLatencia.destroy();
    }

    document.getElementById("graflat").textContent = `Previsão de alertas para ${componenteAtual.toUpperCase()} - ${periodo}`;

    const ctx = canvas.getContext("2d");
    graficoLatencia = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Alertas Altos",
                    data: dadosProcessados.alto,
                    backgroundColor: "rgba(244, 67, 54, 0.8)",
                    borderColor: "rgba(244, 67, 54, 1)",
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
                    label: "Alertas Baixos",
                    data: dadosProcessados.baixo,
                    backgroundColor: "rgba(255, 235, 59, 0.8)",
                    borderColor: "rgba(255, 235, 59, 1)",
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

    console.log('Gráfico criado com sucesso');
}

const cores = {
    cpu: "#a78bfa",
    ram: "#38bdf8",
    disco: "#ff89b0"
};

function atualizarKPIsGerais(dados) {
    const taxas = calcularTaxaCrescimentoTotal(dados);
    const maiorCrescimento = encontrarComponenteMaiorCrescimento(taxas);

    const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };
    const disponibilidade = 99.7;
    let periodo = periodoSelect.value === "semanal" ? "semanal" : "mensal";

    const latenciaMedia = Object.values(dados.latencia).reduce((a, b) => a + b, 0) / 3;

    document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Componente com Maior Crescimento ${periodo}</h2>
            <p class="valor-kpi" style="color:${cores[maiorCrescimento.componente]}">${nomes[maiorCrescimento.componente]}</p>
            <p class="tendencia">+${maiorCrescimento.taxa}%</p>
        </div>
        <div class="KPI">
            <h2>Previsão de latência média ${periodo}</h2>
            <p class="valor-kpi" style="color:rgba(65, 94, 243, 0.8)">${latenciaMedia.toFixed(1)}ms</p>
        </div>
        <div class="KPI">
            <h2>Disponibilidade do Servidor</h2>
            <p class="valor-kpi" style="color:green">${disponibilidade}%</p>
        </div>
    `;
}

async function atualizarKPIs(dados) {
    const valores = dados[componenteAtual];
    let soma = 0;
    for (let i = 0; i < valores.length; i++) {
        soma += valores[i];
    }
    const mediaUso = (soma / valores.length).toFixed(1);

    const periodo = periodoSelect.value;

    const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };

    const primeiroValor = valores[0];
    const ultimoValor = valores[valores.length - 1];
    let variacaoPercentual = 0;
    if (primeiroValor !== 0) {
        variacaoPercentual = ((ultimoValor - primeiroValor) / primeiroValor) * 100;
    }

    const alertasReais = await buscarDadosHistoricosAlertas(componenteAtual, periodo);
    let alertaMaisFrequente = "Baixo";
    if (alertasReais) {
        let totalAlto = 0;
        let totalMedio = 0;
        let totalBaixo = 0;
        
        for (let i = 0; i < alertasReais.alto.length; i++) {
            totalAlto += alertasReais.alto[i];
        }
        for (let i = 0; i < alertasReais.medio.length; i++) {
            totalMedio += alertasReais.medio[i];
        }
        for (let i = 0; i < alertasReais.baixo.length; i++) {
            totalBaixo += alertasReais.baixo[i];
        }

        if (totalAlto > totalMedio && totalAlto > totalBaixo) alertaMaisFrequente = "Alto";
        else if (totalMedio > totalBaixo) alertaMaisFrequente = "Médio";
    }

    if (periodo == "mensal") {
        document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de uso médio Mensal (${nomes[componenteAtual]})</h2>
            <p class="valor-kpi" id="kpi1"> ${mediaUso}%</p>
        </div>
        <div class ="KPI">
        <h2> Taxa de aumento Percentual Mensal:</h2>
        <p class="valor-kpi" style="color:white">${variacaoPercentual > 0 ? '+' : ''}${variacaoPercentual.toFixed(1)}%</p>
        </div>
        <div class="KPI">
            <h2>Previsão do alerta mais frequente:</h2>
            <p class="valor-kpi" id="kpi2" style="color:${alertaMaisFrequente === 'Alto' ? 'red' : alertaMaisFrequente === 'Médio' ? 'orange' : 'yellow'}">${alertaMaisFrequente}</p>
        </div>
        `;
    } else if (periodo == "semanal") {
        document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de uso médio Semanal (${nomes[componenteAtual]})</h2>
            <p class="valor-kpi" id="kpi1"> ${mediaUso}%</p>
        </div>
        <div class ="KPI">
        <h2> Taxa de aumento Percentual Semanal:</h2>
        <p class="valor-kpi" style="color:white">${variacaoPercentual > 0 ? '+' : ''}${variacaoPercentual.toFixed(1)}%</p>
        </div>
        <div class="KPI">
            <h2>Previsão do alerta mais frequente:</h2>
            <p class="valor-kpi" id="kpi2" style="color:${alertaMaisFrequente === 'Alto' ? 'red' : alertaMaisFrequente === 'Médio' ? 'orange' : 'yellow'}">${alertaMaisFrequente}</p>
        </div>
        `;
    }

    const kpi1 = document.getElementById("kpi1");
    if (nomes[componenteAtual] == "CPU") {
        kpi1.style.color = `${cores.cpu}`;
    } else if (nomes[componenteAtual] == "RAM") {
        kpi1.style.color = `${cores.ram}`;
    } else if (nomes[componenteAtual] == "Disco") {
        kpi1.style.color = `${cores.disco}`;
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