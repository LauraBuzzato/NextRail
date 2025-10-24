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
            labels: ['01/10', '02/10', '03/10', '04/10', '05/10', '06/10', '07/10'],
            datasets: [
                {
                    label: 'CPU',
                    data: [5, 9, 6, 17, 7, 13, 6],
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167,139,250,0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    borderWidth: 2
                },
                {
                    label: 'RAM',
                    data: [9, 11, 13, 14, 12, 18, 17],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56,189,248,0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    borderWidth: 2
                },
                {
                    label: 'Disco',
                    data: [4, 6, 5, 7, 5, 8, 3],
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
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#fff'
                    }
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
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
                        callbacks: {
                            label: labelAlerta => `${labelAlerta.parsed.y} alertas`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Quantidade de Alertas', color: '#fff' },
                        ticks: { color: '#ccc' },
                        grid: { color: '#333' }
                    },
                    x: {
                        ticks: { color: '#ccc' },
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
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo (min)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Componente'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Tempo Médio de Resolução de Alertas por Componente'
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
                labels: ['Baixo', 'Médio', 'Alta'],
                datasets: [{
                    label: 'Alertas Registrados',
                    data: [45, 38, 25],
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
                        callbacks: {
                            label: ctx => `${ctx.parsed.y} alertas`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Quantidade de Alertas', color: '#fff' },
                        ticks: { color: '#ccc' },
                        grid: { color: '#333' }
                    },
                    x: {
                        ticks: { color: '#ccc' },
                        grid: { display: false }
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
                        title: { display: true, text: 'Tempo (min)', color: '#fff' },
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
function dash_suporte() {
    // Verificar se os elementos existem
    //const cpuCanvas = document.getElementById('graficoSuporteCPU');
    //const ramCanvas = document.getElementById('graficoSuporteRAM');
    //const discoCanvas = document.getElementById('graficoSuporteDisco');
    const canvas = document.getElementById('graficoSuporte');

    /*if (!cpuCanvas || !ramCanvas || !discoCanvas) {
        console.error('Elementos de gráfico do suporte não encontrados');
        return;
    }*/
    if (!canvas) {
        console.error('Elementos de gráfico do suporte não encontrados');
        return;
    }
        
    
    //nome_usuario_span.innerHTML = sessionStorage.NOME_USUARIO;
    gerarDadoAleatorio();
    inicializarGraficos();
}

function gerarDadoAleatorio() {
    return Math.floor(Math.random() * 100);
}

function atualizarGrafico(grafico, tamanho) {
    for (var i = 0; i < tamanho; i++) {
        grafico.data.datasets[0].data.push(gerarDadoAleatorio());
        grafico.data.datasets[1].data.push(gerarDadoAleatorio());
        grafico.data.datasets[2].data.push(gerarDadoAleatorio());
        grafico.data.datasets[3].data.push(70);
        grafico.data.datasets[4].data.push(80);
        grafico.data.datasets[5].data.push(90);
    }
    grafico.update();
}

function inicializarGraficos() {
    //const cpuCtx = document.getElementById('graficoSuporteCPU').getContext('2d');
    //const ramCtx = document.getElementById('graficoSuporteRAM').getContext('2d');
    //const discoCtx = document.getElementById('graficoSuporteDisco').getContext('2d');
    const ramCtx = document.getElementById('graficoSuporte').getContext('2d');

    const tamanho = 13;

    const configLine = {
        type: 'line',
        data: {
            labels: [
                '16:00:00', '18:00:00', '20:00:00', '22:00:00',
                '00:00:00', '02:00:00', '04:00:00', '06:00:00',
                '08:00:00', '10:00:00', '12:00:00', '14:00:00',
                '16:00:00'
        ],

            datasets: [{
                label: '',
                data: [],
                borderColor: 'rgba(167,139,250,1)',
                backgroundColor: 'rgba(167,139,250,1)',
                tension: 0.4,
                fill: false
            },
        {
                label: '',
                data: [],
                borderColor: 'rgba(56,189,248,1)',
                backgroundColor: 'rgba(56,189,248,1)',
                tension: 0.4,
                fill: false
            },
        {
                label: '',
                data: [],
                borderColor: 'rgba(251,191,36,1)',
                backgroundColor: 'rgba(251,191,36,1)',
                tension: 0.4,
                fill: false
            },
        {
                label: '',
                data: [],
                borderColor: 'rgba(24, 216, 24, 0.4)',
                backgroundColor: 'rgba(24, 216, 24, 0.4)',
                tension: 0.4,
                fill: false,
                pointRadius: 0
            },
        {
                label: '',
                data: [],
                borderColor: 'rgba(255, 255, 0, 0.4)',
                backgroundColor: 'rgba(255, 255, 0, 0.4)',
                tension: 0.4,
                fill: false,
                pointRadius: 0
            },
        {
                label: '',
                data: [],
                borderColor: 'rgba(255, 57, 57, 0.4)',
                backgroundColor: 'rgba(255, 57, 57, 0.4)',
                tension: 0.4,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800 },
            plugins: { legend: { display: true } },
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    };

    Chart.defaults.color = 'white';
    Chart.defaults.borderColor = '#383838';

    //const graficoCPU = new Chart(cpuCtx, JSON.parse(JSON.stringify(configLine)));
    //graficoCPU.data.datasets[0].label = 'Uso de CPU (%)';

    //const graficoRAM = new Chart(ramCtx, JSON.parse(JSON.stringify(configLine)));
    //graficoRAM.data.datasets[0].label = 'Uso de RAM (%)';

    //const graficoDisco = new Chart(discoCtx, JSON.parse(JSON.stringify(configLine)));
    //graficoDisco.data.datasets[0].label = 'Uso de Disco (%)';

    const grafico = new Chart(ramCtx, JSON.parse(JSON.stringify(configLine)));
    grafico.data.datasets[0].label = 'Uso de CPU (%)';
    grafico.data.datasets[1].label = 'Uso de RAM (%)';
    grafico.data.datasets[2].label = 'Uso de Disco (%)';
    grafico.data.datasets[3].label = 'Baixo';
    grafico.data.datasets[4].label = 'Médio';
    grafico.data.datasets[5].label = 'Alto';

    //atualizarGrafico(graficoCPU, tamanho);
    //atualizarGrafico(graficoRAM, tamanho);
    //atualizarGrafico(graficoDisco, tamanho);
    atualizarGrafico(grafico, tamanho);
    criarTabela();
}

function criarTabela(){
    const conteudo = document.getElementById('tabela-conteudo');

    conteudo.innerHTML += `<span class="tabela-label">#</span>
          <span class="tabela-label">Componente</span>
          <span class="tabela-label">leitura</span>
          <span class="tabela-label">Grau</span>
          <span class="tabela-label">Timestamp</span>`
          
    for (var i = 1; i <= 6; i++){
        var leitura = Math.floor(Math.random() * (100 - 70 + 1)) + 70;

        
        if (leitura >= 90){
            conteudo.innerHTML += `<span class="tabela-celula">${i}</span>
            <span class="tabela-celula">CPU</span>
            <span class="tabela-celula">${leitura}%</span>
            <span class="tabela-celula">alto</span>
            <span class="tabela-celula">2025-03-17-18:25:08</span>`
        }
        else if (leitura < 90 && leitura >= 80){
            conteudo.innerHTML += `<span class="tabela-celula">${i}</span>
            <span class="tabela-celula">RAM</span>
            <span class="tabela-celula">${leitura}%</span>
            <span class="tabela-celula">médio</span>
            <span class="tabela-celula">2025-03-17-18:25:08</span>`
        }
        else if (leitura < 80 && leitura >= 70){
            conteudo.innerHTML += `<span class="tabela-celula">${i}</span>
            <span class="tabela-celula">disco</span>
            <span class="tabela-celula">${leitura}%</span>
            <span class="tabela-celula">baixo</span>
            <span class="tabela-celula">2025-03-17-18:25:08</span>`
        }
    }
}