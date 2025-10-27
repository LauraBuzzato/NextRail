function dash_analista() {
    console.log('Executando dash_analista...');

    // Verificar se Chart está disponível
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não disponível em dash_analista');
        setTimeout(dash_analista, 500);
        return;
    }

    // Verificar se os elementos existem antes de criar gráficos
    const frequenciaCanvas = document.getElementById('frequenciaSemanalChart');
    const alertasComponenteCanvas = document.getElementById('alertasComponenteChart');
    const tempoComponenteCanvas = document.getElementById('tempoResolucaoComponenteChart');
    const alertasServidorCanvas = document.getElementById('alertasServidorChart');
    const tempoServidorCanvas = document.getElementById('tempoResolucaoServidorChart');

    if (!frequenciaCanvas) {
        console.error('Elemento frequenciaSemanalChart não encontrado');
        setTimeout(dash_analista, 200);
        return;
    }

    console.log('Criando gráficos do analista...');

    var labels = ['21/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'];

    //Dados de 30 dias dentro de um objeto  
    var dadosDiarios = {
        cpu: [],
        ram: [],
        disco: []
    }

    for (var i = 0; i < 30; i++) {
        dadosDiarios.cpu.push(Math.floor(Math.random() * 30) + 40)
        dadosDiarios.ram.push(Math.floor(Math.random() * 10) + 70)
        dadosDiarios.disco.push(Math.floor(Math.random() * 0) + 40)
    }

    //Cpu
    var somaCpu = 0
    var picoCpu = dadosDiarios.cpu[0]

    for (var i = 0; i < dadosDiarios.cpu.length; i++) {
        var cpuAtual = dadosDiarios.cpu[i]
        somaCpu += cpuAtual

        if (cpuAtual > picoCpu) {
            picoCpu = cpuAtual
        }
    }

    var mediaCpu = (somaCpu / dadosDiarios.cpu.length).toFixed(1)
    var ultCpu = dadosDiarios.cpu[dadosDiarios.cpu.length - 1]

    //Ram
    var somaRam = 0
    var picoRam = dadosDiarios.ram[0]

    for (var i = 0; i < dadosDiarios.ram.length; i++) {
        var ramAtual = dadosDiarios.ram[i]
        somaRam += ramAtual

        if (ramAtual > picoRam) {
            picoRam = ramAtual
        }
    }

    var mediaRam = (somaRam / dadosDiarios.ram.length).toFixed(1)
    var ultRam = dadosDiarios.ram[dadosDiarios.ram.length - 1]

    //Disco
    var somaDisco = 0
    var picoDisco = dadosDiarios.disco[0]

    for (var i = 0; i < dadosDiarios.disco.length; i++) {
        var discoAtual = dadosDiarios.disco[i]
        somaDisco += discoAtual

        if (discoAtual > picoDisco) {
            picoDisco = discoAtual
        }
    }

    var mediaDisco = (somaDisco / dadosDiarios.disco.length).toFixed(1)
    var ultDisco = dadosDiarios.disco[dadosDiarios.disco.length - 1]

    //Icones
    //Cpu
    var iconeCpu;
    var iconeRam;
    var iconeDisco;

    var setaCimaCpu = mediaCpu * 1.05
    var setaBaixoCpu = mediaCpu * 0.95

    if (ultCpu > setaCimaCpu) {
        iconeCpu = "↑"
    } else if (ultCpu < setaBaixoCpu) {
        iconeCpu = "↓"
    } else {
        iconeCpu = "~"
    }

    //Ram
    var setaCimaRam = mediaRam * 1.05
    var setaBaixoRam = mediaRam * 0.95

    if (ultRam > setaCimaRam) {
        iconeRam = "↑"
    } else if (ultRam < setaBaixoRam) {
        iconeRam = "↓"
    } else {
        iconeRam = "~"
    }

    //Disco
    var setaCimaDisco = mediaDisco * 1.05
    var setaBaixoDisco = mediaDisco * 0.95

    if (ultDisco > setaCimaDisco) {
        iconeDisco = "↑"
    } else if (ultDisco < setaBaixoDisco) {
        iconeDisco = "↓"
    } else {
        iconeDisco = "~"
    }

    Chart.defaults.color = '#fff';
    Chart.defaults.font.weight = 'bold';

    // Gráfico de Frequência Semanal
    new Chart(frequenciaCanvas, {
        type: 'line',
        data: {
            labels: ['29/10', '30/10', '31/10',
                '01/11', '02/11', '03/11', '04/11',
                '05/11', '06/11', '07/11', '08/11',
                '09/11', '10/11', '11/11', '12/11',
                '13/11', '14/11', '15/11', '16/11',
                '17/11', '18/11', '19/11', '20/11',
                '21/11', '22/11', '23/11', '24/11',
                '25/11', '26/11', '27/11', '28/11'],
            datasets: [
                {
                    label: 'CPU',
                    data: [5, 9, 6, 12, 7, 13, 6,
                        8, 10, 5, 7, 6, 9, 8,
                        7, 11, 9, 6, 5, 8, 7,
                        6, 10, 9, 8, 7, 6, 9,
                        8, 7, 9],
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167,139,250,0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    borderWidth: 2
                },
                {
                    label: 'RAM',
                    data: [9, 11, 13, 12, 10, 5, 9,
                        4, 12, 16, 13, 12, 15, 15,
                        12, 5, 10, 10, 13, 12, 14,
                        3, 13, 7, 14, 13, 15, 4,
                        11, 14, 9],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56,189,248,0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    borderWidth: 2
                },
                {
                    label: 'Disco',
                    data: [4, 6, 5, 7, 5, 8, 3,
                        6, 5, 4, 7, 6, 5, 4,
                        6, 7, 5, 4, 6, 5, 7,
                        4, 6, 5, 7, 6, 5, 4,
                        6, 5, 7],
                    borderColor: '#fbbf24',
                    backgroundColor: 'rgba(251,191,36,0.2)',
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
                    title: {
                        display: true,
                        text: 'Dias',
                        font: {
                            size: 24
                        }
                    },
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
                    title: {
                        display: true,
                        text: 'Alertas',
                        font: {
                            size: 24
                        }
                    },
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

    // Gráfico de Alertas por Componente
    if (alertasComponenteCanvas) {
        new Chart(alertasComponenteCanvas, {
            type: 'bar',
            data: {
                labels: ['CPU', 'RAM', 'Disco'],
                datasets: [{
                    label: 'Total de Alertas',
                    data: [32, 50, 8],
                    backgroundColor: [
                        'rgba(147, 112, 219, 0.8)',
                        'rgba(0, 191, 255, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ],
                    borderColor: [
                        '#9370DB',
                        '#00BFFF',
                        '#FFA500'
                    ],
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: {
                        bodyColor: '#fff',
                        titleColor: '#fff',
                        backgroundColor: '#333',
                        callbacks: {
                            label: labelAlerta => `${labelAlerta.parsed.y} alertas`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Quantidade de Alertas', color: '#fff', font: { size: 22} },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 18
                            }
                        },
                        grid: { color: '#333' }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Componente',
                            font: { size : 22}
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 18
                            }
                        },
                        grid: { display: false }

                    }
                }
            }
        });
    }

    // Gráfico de Tempo de Resolução por Componente
    if (tempoComponenteCanvas) {
        new Chart(tempoComponenteCanvas, {
            type: 'bar',
            data: {
                labels: ['CPU', 'RAM', 'Disco'],
                datasets: [{
                    label: 'Tempo médio (minutos)',
                    data: [20, 30, 5],
                    borderWidth: 1,
                    backgroundColor: [
                        'rgba(147, 112, 219, 0.8)',
                        'rgba(0, 191, 255, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo (min)',
                            font: {
                                size: 2
                            }
                        },
                        ticks: {
                            color: '#ccc',
                            font: {
                                size: 18
                            }
                        }

                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Componente',
                        },
                        ticks: {
                            color: '#ccc',
                            font: {
                                size: 18
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y} minutos`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Alertas por Servidor
    if (alertasServidorCanvas) {
        new Chart(alertasServidorCanvas, {
            type: 'bar',
            data: {
                labels: ['Baixa', 'Média', 'Alta'],
                datasets: [{
                    label: 'Alertas Registrados',
                    data: [45, 38, 25],
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
                    title: { display: false },
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
                            text: 'Quantidade de Alertas',
                            color: '#fff',
                            font: {
                                size: 22
                            }
                        },
                        ticks: {
                            color: '#ccc',
                            font: {
                                size: 18
                            }
                        },
                        grid: { color: '#333' }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Gravidades',
                            font: {
                                size: 22
                            }
                        },
                        ticks: {
                            font: {
                                size: 18
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Tempo de Resolução por Servidor
    if (tempoServidorCanvas) {
        new Chart(tempoServidorCanvas, {
            type: 'bar',
            data: {
                labels: ['Servidor A', 'Servidor B', 'Servidor C'],
                datasets: [{
                    label: 'Tempo Médio de Resolução (min)',
                    data: [12, 20, 8],
                    backgroundColor: ['#7c3aed', '#38bdf8', '#fbbf24'],
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'TempoAAA (min)', color: '#fff' },
                        ticks: { color: '#ccc' },
                        grid: { color: '#333' }
                    },
                    y: {
                        ticks: { color: '#ccc' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    title: { display: false },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.parsed.x} minutos`
                        }
                    }
                }
            }
        });
    }
}

// dash suporte ------------------------------------------------------------------------------------------------------------------

let graficoSuporte;
let indiceAtual = 0;

function gerarDadoAleatorio() {
    return Math.floor(Math.random() * 100);
}

function atualizarGrafico(grafico, tamanho) {
    for (var i = 0; i < tamanho; i++) {
    }
    grafico.update();
}

function dash_suporte() {
    console.log('Inicializando gráficos do suporte...');
    const canvas = document.getElementById('graficoSuporte');

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não carregado');
        setTimeout(inicializarGraficosSuporte, 500);
        return;
    }

    if (graficoSuporte) {
        console.log('Destruindo gráfico anterior...');
        graficoSuporte.destroy();
        graficoSuporte = null;
    }

    try {
        canvas.width = 600;
        canvas.height = 350;

        const ctx = canvas.getContext('2d');

        const configLine = {
            type: 'line',
            data: {
                labels: ['16:00', '18:00', '20:00', '22:00',
                    '00:00', '02:00', '04:00', '06:00',
                    '08:00', '10:00', '12:00', '14:00', '16:00'
                ],
                datasets: [
                    {
                        label: 'Uso de CPU (%)',
                        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80, 85],
                        borderColor: 'rgba(167,139,250,1)',
                        backgroundColor: 'rgba(167,139,250,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Uso de RAM (%)',
                        data: [28, 48, 40, 19, 86, 27, 90, 45, 60, 35, 50, 65, 70],
                        borderColor: 'rgba(56,189,248,1)',
                        backgroundColor: 'rgba(56,189,248,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Uso de Disco (%)',
                        data: [45, 35, 50, 60, 40, 55, 65, 50, 45, 60, 55, 50, 45],
                        borderColor: 'rgba(251,191,36,1)',
                        backgroundColor: 'rgba(251,191,36,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '',
                        data: Array(13).fill(70),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    }
                ]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    onComplete: function () {
                        console.log('Gráfico renderizado com sucesso!');
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#fff',
                            font: { size: 14 },
                            filter: function (legendItem, chart) {
                                return legendItem.text !== '';
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff',
                            maxRotation: 0,
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#fff',
                            callback: function (value) {
                                return value + '%';
                            },
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        };

        graficoSuporte = new Chart(ctx, configLine);
        console.log('Gráfico criado com sucesso!');

        indiceAtual = 0;
        atualizarVisibilidadeSuporte();

    } catch (error) {
        console.error('Erro ao criar gráfico:', error);
    }
}


function criarTabela() {
    const conteudo = document.getElementById('tabela-conteudo');
    if (!conteudo) return;

    conteudo.innerHTML = `
        <span class="tabela-label">#</span>
        <span class="tabela-label">Componente</span>
        <span class="tabela-label">Leitura</span>
        <span class="tabela-label">Grau</span>
        <span class="tabela-label">Timestamp</span>
    `;

    for (var i = 1; i <= 6; i++) {
        var leitura = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
        var componente, grau;

        if (leitura >= 90) {
            componente = "CPU";
            grau = "alto";
        } else if (leitura < 90 && leitura >= 80) {
            componente = "RAM";
            grau = "médio";
        } else {
            componente = "Disco";
            grau = "baixo";
        }

        conteudo.innerHTML += `
            <span class="tabela-celula">${i}</span>
            <span class="tabela-celula">${componente}</span>
            <span class="tabela-celula">${leitura}%</span>
            <span class="tabela-celula">${grau}</span>
            <span class="tabela-celula">2025-03-17 18:25:08</span>
        `;
    }
}