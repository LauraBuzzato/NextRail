console.log(sessionStorage.ID_SERVIDOR)
const testeServidor = sessionStorage.ID_SERVIDOR;
var passagem = true;
var visaoGeralAtiva = true;

const dadosSimulados = {
    1: {
        semanal: {
            cpu: [60, 62, 65, 68],
            ram: [45, 47, 50, 52],
            disco: [40, 42, 44, 47]
        },
        mensal: {
            cpu: [58, 60, 62, 65, 67, 69, 71],
            ram: [42, 44, 46, 48, 50, 52, 54],
            disco: [38, 40, 42, 44, 46, 48, 50]
        },
    },
    2: {
        semanal: {
            cpu: [68, 70, 72, 74],
            ram: [55, 57, 60, 62],
            disco: [48, 50, 52, 55]
        },
        mensal: {
            cpu: [65, 67, 70, 72, 75, 77, 79],
            ram: [52, 54, 56, 58, 61, 62, 64],
            disco: [45, 47, 50, 51, 53, 55, 57]
        }
    },
    3: {
        semanal: {
            cpu: [75, 78, 80, 82],
            ram: [62, 64, 66, 69],
            disco: [52, 54, 57, 58]
        },
        mensal: {
            cpu: [72, 74, 76, 78, 81, 83, 84],
            ram: [60, 62, 63, 65, 67, 68, 70],
            disco: [50, 51, 53, 54, 56, 58, 59]
        }
    },
    4: {
        semanal: {
            cpu: [65, 68, 70, 72],
            ram: [50, 52, 55, 58],
            disco: [45, 47, 49, 52]
        },
        mensal: {
            cpu: [62, 65, 68, 70, 72, 74, 76],
            ram: [48, 50, 52, 54, 56, 58, 60],
            disco: [42, 44, 46, 48, 50, 52, 54]
        }
    }
};

const latenciaSimulada = {
    1: { cpu: 70, ram: 45, disco: 80 },
    2: { cpu: 60, ram: 42, disco: 75 },
    3: { cpu: 65, ram: 48, disco: 78 },
    4: { cpu: 55, ram: 40, disco: 72 }
};

const alertasSimulados = {
    1: {
        semanal: {
            alto: [2, 1, 3, 2],
            medio: [3, 4, 2, 3],
            baixo: [5, 4, 6, 5]
        },
        mensal: {
            alto: [2, 3, 2, 4, 3, 2, 3],
            medio: [4, 3, 5, 3, 4, 5, 4],
            baixo: [6, 7, 5, 6, 5, 6, 7]
        }
    },
    2: {
        semanal: {
            alto: [3, 2, 4, 3],
            medio: [2, 3, 2, 4],
            baixo: [4, 5, 3, 4]
        },
        mensal: {
            alto: [3, 4, 3, 5, 4, 3, 4],
            medio: [5, 4, 6, 4, 5, 6, 5],
            baixo: [7, 8, 6, 7, 6, 7, 8]
        }
    },
    3: {
        semanal: {
            alto: [1, 2, 1, 2],
            medio: [2, 1, 3, 2],
            baixo: [3, 4, 2, 3]
        },
        mensal: {
            alto: [1, 2, 1, 3, 2, 1, 2],
            medio: [3, 2, 4, 2, 3, 4, 3],
            baixo: [5, 6, 4, 5, 4, 5, 6]
        }
    },
    4: {
        semanal: {
            alto: [2, 3, 2, 3],
            medio: [3, 2, 4, 3],
            baixo: [4, 5, 3, 4]
        },
        mensal: {
            alto: [2, 3, 2, 4, 3, 2, 3],
            medio: [4, 3, 5, 3, 4, 5, 4],
            baixo: [6, 7, 5, 6, 5, 6, 7]
        }
    }
};

const periodoSelect = document.getElementById("periodoSelect");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const filtrosContainer = document.getElementById("filtrosContainer");

let graficoLinha, graficoLatencia;
let componenteAtual = "cpu";
let botoesCriados = false;

Chart.defaults.color = "#fff";
Chart.defaults.font.family = "Poppins";


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

    filtrosContainer.appendChild(btnVisaoGeral);

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

    filtrosContainer.appendChild(botoesContainer);

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

function calcularTaxaCrescimento(dados) {
    const taxas = {};

    for (const componente in dados) {
        const valores = dados[componente];
        if (valores.length >= 2) {

            const crescimentoTotal = ((valores[valores.length - 1] - valores[0]) / valores[0]) * 100;

            let somaCrescimentos = 0;
            let numComparacoes = 0;

            for (let i = 1; i < valores.length; i++) {
                const crescimentoPonto = ((valores[i] - valores[i - 1]) / valores[i - 1]) * 100;
                somaCrescimentos += crescimentoPonto;
                numComparacoes++;
            }

            const crescimentoMedio = somaCrescimentos / numComparacoes;

            taxas[componente] = {
                total: crescimentoTotal.toFixed(2),
                medio: crescimentoMedio.toFixed(2)
            };
        }
    }
    return taxas;
}

function encontrarComponenteMaiorCrescimento(taxas) {
    let maiorComponente = '';
    let maiorTaxa = -Infinity;

    for (const componente in taxas) {
        const taxaAtual = parseFloat(taxas[componente].total || taxas[componente]);

        if (taxaAtual > maiorTaxa) {
            maiorTaxa = taxaAtual;
            maiorComponente = componente;
        }
    }

    return { componente: maiorComponente, taxa: maiorTaxa.toFixed(1) };
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

function atualizarDashboard() {
    const servidor = testeServidor;
    const periodo = periodoSelect.value;

    if (!dadosSimulados[servidor] || !dadosSimulados[servidor][periodo]) {
        console.error(`Dados não encontrados para servidor: ${servidor}, período: ${periodo}`);
        return;
    }

    const dados = dadosSimulados[servidor][periodo];

    limparTodosGraficos();

    if (visaoGeralAtiva) {
        renderGraficoLinhasMultiplas(dados);
        renderGraficoLatenciaGeral();
        atualizarKPIsGerais(dados);
    } else {
        renderGraficoLinhaUnica(dados);
        renderGraficoAlertas();
        atualizarKPIs(dados);
    }
}

function renderGraficoLinhasMultiplas(dados) {
    const canvas = document.getElementById("graficoPrevisaoLinha");
    if (!canvas) {
        console.error("Canvas linhas não encontrado!");
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
        ? ["01/11", "08/11", "09/11", "22/11"]
        : ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

    const datasets = [];

    for (const componente in dados) {
        datasets.push({
            label: `${nomes[componente]} (%)`,
            data: dados[componente],
            borderColor: cores[componente],
            backgroundColor: `${cores[componente]}20`,
            fill: false,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: cores[componente]
        });
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
        console.error("Canvas linhas não encontrado!");
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
        ? ["01/11", "08/11", "15/11", "22/11"]
        : ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

    let range = periodoSelect.value === "semanal" ? 4 : 6;

    console.log(limite[componenteAtual]);

    const ctx = canvas.getContext("2d");
    graficoLinha = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: `${nomes[componenteAtual]} (%)`,
                    data: dados[componenteAtual],
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
                    data: Array(Number(range)).fill(Number(limite[componenteAtual])),
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


function renderGraficoLatenciaGeral() {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) {
        console.error("Canvas graficoLatencia não encontrado!");
        return;
    }

    const servidor = testeServidor;
    const periodo = periodoSelect.value;

    let labels, data;

    if (periodo === "semanal") {
        labels = ["01/11", "08/11", "15/11", "22/11"];
        data = [65, 67, 63, 69];
    } else {
        labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
        data = [62, 65, 63, 68, 70, 67];
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

function renderGraficoAlertas() {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) {
        console.error("Canvas graficoLatencia não encontrado!");
        return;
    }

    const servidor = testeServidor;
    const periodo = periodoSelect.value;

    let labels, alto, medio, baixo;

    if (periodo === "semanal") {
        labels = ["01/11", "08/11", "09/11", "22/11"];
    } else {
        labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    }

    const alertas = alertasSimulados[servidor]?.[periodo];
    alto = alertas?.alto || [2, 3, 2, 3];
    medio = alertas?.medio || [3, 2, 4, 3];
    baixo = alertas?.baixo || [4, 5, 3, 4];

    if (periodo === "semanal" && alto.length > 4) {
        alto = alto.slice(0, 4);
        medio = medio.slice(0, 4);
        baixo = baixo.slice(0, 4);
    } else if (periodo === "mensal" && alto.length > 7) {
        alto = alto.slice(0, 7);
        medio = medio.slice(0, 7);
        baixo = baixo.slice(0, 7);
    }

    document.getElementById("graflat").textContent = `Previsão de alertas para componente ${componenteAtual}`

    const ctx = canvas.getContext("2d");
    graficoLatencia = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Alertas Altos",
                    data: alto,
                    backgroundColor: "rgba(244, 67, 54, 0.8)",
                    borderColor: "rgba(244, 67, 54, 1)",
                    borderWidth: 1
                },
                {
                    label: "Alertas Médios",
                    data: medio,
                    backgroundColor: "rgba(255, 152, 0, 0.8)",
                    borderColor: "rgba(255, 152, 0, 1)",
                    borderWidth: 1
                },
                {
                    label: "Alertas Baixos",
                    data: baixo,
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


const cores = {
    cpu: "#a78bfa",
    ram: "#38bdf8",
    disco: "#ff89b0"
};

function atualizarKPIsGerais(dados) {
    const taxas = calcularTaxaCrescimentoTotal(dados);
    const maiorCrescimento = encontrarComponenteMaiorCrescimento(taxas);

    const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };
    const servidor = testeServidor;
    const disponibilidade = 99.7;
    let periodo = periodoSelect.value === "semanal" ? "semanal" : "mensal";

    const latenciaMedia = Object.values(latenciaSimulada[servidor]).reduce((a, b) => a + b, 0) / 3;

    document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Componente com Maior Crescimento ${periodo}</h2>
            <p class="valor-kpi" style="color:${cores[maiorCrescimento.componente]}">${nomes[maiorCrescimento.componente]}</p>
            <p class="tendencia">+${maiorCrescimento.taxa}%</p>
        </div>
        <div class="KPI">
            <h2>Latência Média Prevista</h2>
            <p class="valor-kpi" style="color:rgba(65, 94, 243, 0.8)">${latenciaMedia.toFixed(1)}ms</p>
        </div>
        <div class="KPI">
            <h2>Disponibilidade do Servidor</h2>
            <p class="valor-kpi" style="color:green">${disponibilidade}%</p>
        </div>
    `;
}

function atualizarKPIs(dados) {
    const mediaUso = (
        dados[componenteAtual].reduce((a, b) => a + b, 0) / dados[componenteAtual].length
    ).toFixed(1);

    const servidor = testeServidor;
    const periodo = periodoSelect.value;

    const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };

    const alertas = {
        baixo: "Baixo",
        medio: "Medio",
        alto: "Alto"
    }

    const disponibilidade = 99.7;


    let medUsoFormatado = mediaUso;

    let iconName, iconColor;


    const primeiroValor = dados[componenteAtual][0];
    const ultimoValor = dados[componenteAtual][dados[componenteAtual].length - 1];
    let variacaoPercentual = 0;
    if (primeiroValor !== 0) {
        variacaoPercentual = ((ultimoValor - primeiroValor) / primeiroValor) * 100;
    }

    const tendencia = ultimoValor - primeiroValor;

    if (tendencia > 0) {
        iconName = "arrow-up-outline";
        iconColor = "white";
    } else if (tendencia < 0) {
        iconName = "arrow-down-outline";
        iconColor = "white";
    } else {
        iconName = "remove-outline";
        iconColor = "gray";
    }

    if (periodo == "mensal") {
        document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de uso médio Mensal (${nomes[componenteAtual]})</h2>
            <p class="valor-kpi" id="kpi1"> ${medUsoFormatado}%</p>
        </div>
        <div class ="KPI">
        <h2> Taxa de aumento Percentual Mensal:</h2>
        <p class="valor-kpi" style="color:white">${variacaoPercentual > 0 ? '+' : ''}${variacaoPercentual.toFixed(1)}%</p>
        </div>
        <div class="KPI">
            <h2>Previsão do alerta mais frequente:</h2>
            <p class="valor-kpi" id="kpi2" style="color:yellow">${alertas.baixo}</p>
        </div>
        <div class="KPI">
            <h2>Disponibilidade do servidor Mensal</h2>
            <p class="valor-kpi" id="kpi3" style="color:green">${disponibilidade}%</p>
        </div>
        `;
    } else if (periodo == "semanal") {
        document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de uso médio Semanal (${nomes[componenteAtual]})</h2>
            <p class="valor-kpi" id="kpi1"> ${medUsoFormatado}%</p>
        </div>
        <div class ="KPI">
        <h2> Taxa de aumento Percentual Semanal:</h2>
        <p class="valor-kpi" style="color:white">${variacaoPercentual > 0 ? '+' : ''}${variacaoPercentual.toFixed(1)}%</p>
        </div>
        <div class="KPI">
            <h2>Previsão do alerta mais frequente:</h2>
            <p class="valor-kpi" id="kpi2" style="color:yellow">${alertas.baixo}</p>
        </div>
        <div class="KPI">
            <h2>Disponibilidade do servidor Semanal</h2>
            <p class="valor-kpi" id="kpi3" style="color:green">${disponibilidade}%</p>
        </div>
        `;
    }


    const kpi1 = document.getElementById("kpi1");
    const kpi2 = document.getElementById("kpi2");
    const kpi3 = document.getElementById("kpi3");

    if (nomes[componenteAtual] == "CPU") {
        kpi1.style.color = `${cores.cpu}`;
    } else if (nomes[componenteAtual] == "RAM") {
        kpi1.style.color = `${cores.ram}`;
    } else if (nomes[componenteAtual] == "Disco") {
        kpi1.style.color = `${cores.disco}`;
    }
}

function configurarNavegacao() {
    if (btnPrev && btnNext) {
        btnNext.addEventListener("click", () => {
            passagem = false;
            visaoGeralAtiva = false;
            const ordem = ["cpu", "disco", "ram"];
            const idx = ordem.indexOf(componenteAtual);
            componenteAtual = ordem[(idx + 1) % ordem.length];

            document.querySelectorAll('.btn-componente').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.componente === componenteAtual) {
                    btn.classList.add('active');
                }
            });


            const btnVisaoGeral = document.getElementById('btnVisaoGeral');
            btnVisaoGeral.textContent = 'Voltar para Visão Geral';
            btnVisaoGeral.style.background = "transparent";
            btnVisaoGeral.style.color = "#ffe066";
            btnVisaoGeral.style.border = "1px solid #ffe066";

            atualizarDashboard();
        });

        btnPrev.addEventListener("click", () => {
            passagem = false;
            visaoGeralAtiva = false;
            const ordem = ["cpu", "disco", "ram"];
            const idx = ordem.indexOf(componenteAtual);
            componenteAtual = ordem[(idx - 1 + ordem.length) % ordem.length];

            document.querySelectorAll('.btn-componente').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.componente === componenteAtual) {
                    btn.classList.add('active');
                }
            });


            const btnVisaoGeral = document.getElementById('btnVisaoGeral');
            btnVisaoGeral.textContent = 'Voltar para Visão Geral';
            btnVisaoGeral.style.background = "transparent";
            btnVisaoGeral.style.color = "#ffe066";
            btnVisaoGeral.style.border = "1px solid #ffe066";

            atualizarDashboard();
        });
    }
}

function inicializar() {
    criarBotoesComponentes();

    periodoSelect.addEventListener("change", () => {
        passagem = true;
        atualizarDashboard();
    });

    configurarNavegacao();
    atualizarDashboard();
}

document.addEventListener('DOMContentLoaded', function () {
    passagem = true;
    visaoGeralAtiva = true;
    inicializar();
});