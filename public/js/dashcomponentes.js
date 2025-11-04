function mudarVisualizacao() {
    var componente = selectComponentes.value

    if (componente == 1) {
        containerGeral.innerHTML = `<div class="container-KPIS">
                    <div class="KPI">
                        <h2>Frequência em estado de alerta:</h2>
                        <h1>80%</h1>
                    </div>
                    <div class="KPI">
                        <h2>Gravidade dos alertas:</h2>
                        <canvas id="alertasComponenteChart"></canvas>
                    </div>
                    <div class="KPI">
                        <h2>Relação com os outros servidores:</h2>
                        <h1 class="texto-grande">5º</h1>
                        <h4> Servidor com mais alertas de CPU</h4>
                    </div>
                </div>
                <div class="container-KPIS-segunda-linha">
                    <div class="GRAFICO-2">
                        <h2>Variação do uso:</h2>
                        <canvas id="varicaoUso"></canvas>
                    </div>
                    <div class="Container-KPI-2">
                        <div class="KPI-2">
                        <h2>Uso médio da CPU:</h2>
                        <h1>80%</h1>
                        </div>
                        <div class="KPI-2">
                        <h2>Taxa de variação do uso da CPU:</h2>
                        <h1>80%</h1>
                        </div>
                        
                    </div>
                </div>`

        const ctx = document.getElementById('alertasComponenteChart');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Baixa', 'Média', 'Alta'],
                datasets: [{
                    label: 'Alertas Registrados',
                    data: [5, 9, 4],
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

        const ctx2 = document.getElementById('varicaoUso');

        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [
                    '01/11', '02/11', '03/11', '04/11',
                    '05/11', '06/11', '07/11', '08/11',
                    '09/11', '10/11', '11/11', '12/11',
                    '13/11', '14/11', '15/11', '16/11',
                    '17/11', '18/11', '19/11', '20/11',
                    '21/11', '22/11', '23/11', '24/11',
                    '25/11', '26/11', '27/11', '28/11', '29/11', '30/11'],
                datasets: [
                    {
                        label: 'CPU',
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
    } else if (componente == 2) {
        containerGeral.innerHTML = `<div class="container-KPIS">
                    <div class="KPI">
                        <h2>Frequência em estado de alerta:</h2>
                        <h1>80%</h1>
                    </div>
                    <div class="KPI">
                        <h2>Gravidade dos alertas:</h2>
                        <canvas id="alertasComponenteChart"></canvas>
                    </div>
                    <div class="KPI">
                        <h2>Relação com os outros servidores:</h2>
                        <h1 class="texto-grande">5º</h1>
                        <h4> Servidor com mais alertas de RAM</h4>
                    </div>
                </div>
                <div class="container-KPIS-segunda-linha">
                    <div class="GRAFICO-2">
                        <h2>Variação do uso:</h2>
                        <canvas id="varicaoUso"></canvas>
                    </div>
                    <div class="Container-KPI-2">
                        <div class="KPI-2">
                        <h2>Uso médio da RAM:</h2>
                        <h1>80%</h1>
                        </div>
                        <div class="KPI-2">
                        <h2>Taxa de variação do uso da RAM:</h2>
                        <h1>80%</h1>
                        </div>
                        
                    </div>
                </div>`

        const ctx = document.getElementById('alertasComponenteChart');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Baixa', 'Média', 'Alta'],
                datasets: [{
                    label: 'Alertas Registrados',
                    data: [5, 9, 4],
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

        const ctx2 = document.getElementById('varicaoUso');

        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [
                    '01/11', '02/11', '03/11', '04/11',
                    '05/11', '06/11', '07/11', '08/11',
                    '09/11', '10/11', '11/11', '12/11',
                    '13/11', '14/11', '15/11', '16/11',
                    '17/11', '18/11', '19/11', '20/11',
                    '21/11', '22/11', '23/11', '24/11',
                    '25/11', '26/11', '27/11', '28/11', '29/11', '30/11'],
                datasets: [
                    {
                        label: 'RAM',
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
    } else if (componente == 3) {
        containerGeral.innerHTML = `<div class="container-KPIS">
                    <div class="KPI">
                        <h2>Frequência em estado de alerta:</h2>
                        <h1>80%</h1>
                    </div>
                    <div class="KPI">
                        <h2>Gravidade dos alertas:</h2>
                        <canvas id="alertasComponenteChart"></canvas>
                    </div>
                    <div class="KPI">
                        <h2>Relação com os outros servidores:</h2>
                        <h1 class="texto-grande">5º</h1>
                        <h4> Servidor com mais alertas de disco</h4>
                    </div>
                </div>
                <div class="container-KPIS-segunda-linha">
                    <div class="GRAFICO-2">
                        <h2>Variação do uso:</h2>
                        <canvas id="varicaoUso"></canvas>
                    </div>
                    <div class="Container-KPI-2">
                        <div class="KPI-2">
                        <h2>Uso médio do disco:</h2>
                        <h1>80%</h1>
                        </div>
                        <div class="KPI-2">
                        <h2>Taxa de variação do uso do disco:</h2>
                        <h1>80%</h1>
                        </div>
                        
                    </div>
                </div>`


        const ctx = document.getElementById('alertasComponenteChart');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Baixa', 'Média', 'Alta'],
                datasets: [{
                    label: 'Alertas Registrados',
                    data: [5, 9, 4],
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

        const ctx2 = document.getElementById('varicaoUso');

        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [
                    '01/11', '02/11', '03/11', '04/11',
                    '05/11', '06/11', '07/11', '08/11',
                    '09/11', '10/11', '11/11', '12/11',
                    '13/11', '14/11', '15/11', '16/11',
                    '17/11', '18/11', '19/11', '20/11',
                    '21/11', '22/11', '23/11', '24/11',
                    '25/11', '26/11', '27/11', '28/11', '29/11', '30/11'],
                datasets: [
                    {
                        label: 'Disco',
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
    }


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
        })
        .catch(erro => console.log("#ERRO componentes:", erro));
}