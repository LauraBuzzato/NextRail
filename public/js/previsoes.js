

console.log(sessionStorage.ID_SERVIDOR)
const testeServidor = sessionStorage.ID_SERVIDOR;
var passagem = true;

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
        anual: {
            cpu: [55, 57, 59, 61, 63],
            ram: [40, 42, 44, 46, 48],
            disco: [35, 37, 39, 41, 43]
        }
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
        },
        anual: {
            cpu: [60, 63, 65, 68, 72],
            ram: [48, 50, 53, 55, 58],
            disco: [40, 43, 45, 47, 49]
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
        },
        anual: {
            cpu: [70, 71, 73, 74, 76],
            ram: [58, 59, 60, 61, 63],
            disco: [48, 49, 50, 51, 53]
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
        },
        anual: {
            cpu: [58, 60, 63, 65, 68],
            ram: [45, 47, 49, 51, 53],
            disco: [38, 40, 42, 44, 46]
        }
    }
};

const latenciaSimulada = {
    1: { cpu: 70, ram: 45, disco: 80 },
    2: { cpu: 60, ram: 42, disco: 75 },
    3: { cpu: 65, ram: 48, disco: 78 },
    4: { cpu: 55, ram: 40, disco: 72 }
};



const periodoSelect = document.getElementById("periodoSelect");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

let graficoLinha, graficoLatencia;
let componenteAtual = "cpu";

Chart.defaults.color = "#fff";
Chart.defaults.font.family = "Poppins";

function atualizarDashboard() {
    const servidor = testeServidor;
    const periodo = periodoSelect.value;

    if (!dadosSimulados[servidor] || !dadosSimulados[servidor][periodo]) {
        console.error(`Dados não encontrados para servidor: ${servidor}, período: ${periodo}`);
        return;
    }

    const dados = dadosSimulados[servidor][periodo];
    renderGraficoLinha(dados);
    if (passagem) {
        renderGraficoLatencia();
    }
    atualizarKPIs(dados);
}


function renderGraficoLinha(dados) {
    const canvas = document.getElementById("graficoPrevisaoLinha");
    if (!canvas) {
        console.error("Canvas linhas não encontrado!");
        return;
    }

    if (graficoLinha) graficoLinha.destroy();

    const cores = { cpu: "#ffe066", ram: "#4fc3f7", disco: "#81c784" };
    const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };

    const labels =
        periodoSelect.value === "semanal"
            ? ["Semana 1", "Semana 2", "Semana 3", "Semana 4"]
            : periodoSelect.value === "mensal"
                ? ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"]
                : ["2024", "2025", "2026", "2027"];

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
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${nomes[componenteAtual]}: ${context.parsed.y}%`;
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

    const valorInicial = dados[componenteAtual][dados[componenteAtual].length - 1];
    document.getElementById("valorAtualLegenda").innerText = `${nomes[componenteAtual]} atual: ${valorInicial}%`;
}

function renderGraficoLatencia() {
    if (passagem) {


        const canvas = document.getElementById("graficoLatencia");
        if (!canvas) {
            console.error("Canvas graficoLatencia não encontrado!");
            return;
        }

        if (graficoLatencia) graficoLatencia.destroy();

        const periodo = periodoSelect.value;
        let labels, cpu, ram, disco;

        if (periodo === "semanal") {
            labels = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
            cpu = [72, 70, 68, 74];
            ram = [45, 47, 46, 48];
            disco = [80, 82, 79, 83];
        } else if (periodo === "mensal") {
            labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
            cpu = [69, 71, 72, 74, 76, 78, 79];
            ram = [44, 45, 46, 47, 48, 49, 50];
            disco = [79, 80, 81, 82, 83, 84, 85];
        }

        const ctx = canvas.getContext("2d");
        graficoLatencia = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "CPU",
                        data: cpu,
                        backgroundColor: "rgba(147, 112, 219, 0.8)",
                        borderColor: "rgba(147, 112, 219, 0.8)",
                        borderWidth: 1
                    },
                    {
                        label: "RAM",
                        data: ram,
                        backgroundColor: "rgba(164, 57, 251, 0.8)",
                        borderColor: "rgba(139, 39, 252, 0.8)",
                        borderWidth: 1
                    },
                    {
                        label: "Disco",
                        data: disco,
                        backgroundColor: "rgba(140, 4, 185, 0.8)",
                        borderColor: "rgba(97, 4, 196, 0.8)",
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
}


function atualizarKPIs(dados) {
    const mediaUso = (
        dados[componenteAtual].reduce((a, b) => a + b, 0) / dados[componenteAtual].length
    ).toFixed(1);

    const servidor = testeServidor;
    const periodo = periodoSelect.value;
    const latencia = latenciaSimulada[servidor][componenteAtual];

    const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };

    const disponibilidade = 99.7;


    if (periodo == "mensal") {
        document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de crescimento Mensal (${nomes[componenteAtual]})</h2>
            <p class="valor-kpi" id="1">${(mediaUso / 100).toFixed(2)}%</p>
        </div>
        <div class="KPI">
            <h2>Crescimento de Latência Mensal</h2>
            <p class="valor-kpi" id="2" style="color:orange">${latencia / 100}%</p>
        </div>
        <div class="KPI">
            <h2>Disponibilidade do servidor Mensal </h2>
            <p class="valor-kpi" id="3">${disponibilidade}</p>
        </div>
    `;
    } else if (periodo == "semanal") {
        document.getElementById("kpisContainer").innerHTML = "";
        document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI">
            <h2>Previsão de crescimento Semanal (${nomes[componenteAtual]})</h2>
            <p class="valor-kpi" id="1">${(mediaUso / 100).toFixed(2)}%</p>
        </div>
        <div class="KPI">
            <h2>Crescimento de Latência Semanal</h2>
            <p class="valor-kpi" id="2" style="color:orange">${latencia / 100}%</p>
        </div>
        <div class="KPI">
            <h2> Disponibilidade do servidor Semanal </h2>
            <p class="valor-kpi" id="3">${disponibilidade}</p>
        </div>
    `;
    }


    if (disponibilidade >= 90) {
        document.getElementById("3").style = "color:green"
    }

    if (latencia >= 100) {
        document.getElementById("2").style = "color:red";
    } else if (latencia >= 80) {
        document.getElementById("2").style = "color:orange";
    } else if (latencia >= 60) {
        document.getElementById("2").style = "cor:yellow";
    } else {
        document.getElementById("2").style = "color:green"
    }

    if (nomes[componenteAtual] == "RAM") {
        document.getElementById("1").style = "color:green"
    } else if (nomes[componenteAtual] == "Disco") {
        document.getElementById("1").style = "color:green"
    } else if (nomes[componenteAtual] == "CPU") {
        document.getElementById("1").style = "color:orange"
    }
}


function configurarNavegacao() {
    if (btnPrev && btnNext) {
        
        btnNext.addEventListener("click", () => {
            passagem = false;
            const ordem = ["cpu", "disco", "ram"];
            const idx = ordem.indexOf(componenteAtual);
            componenteAtual = ordem[(idx + 1) % ordem.length];
            atualizarDashboard();
        });

        btnPrev.addEventListener("click", () => {
            passagem = false;
            const ordem = ["cpu", "disco", "ram"];
            const idx = ordem.indexOf(componenteAtual);
            componenteAtual = ordem[(idx - 1 + ordem.length) % ordem.length];
            atualizarDashboard();
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    passagem = true;
    periodoSelect.addEventListener("change",() => {
        passagem = true;
        atualizarDashboard();
    });
    configurarNavegacao();
    atualizarDashboard();
});


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        configurarNavegacao();
        atualizarDashboard();
    });
} else {
    configurarNavegacao();
    atualizarDashboard();
}