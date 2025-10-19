function gerarDadoAleatorio() {
    return Math.floor(Math.random() * 100);
}

function atualizarGrafico(grafico, tamanho) {
    /*if (grafico.data.datasets[0].data.length >= 5) {
        grafico.data.datasets[0].data.shift();
    }*/
    for (var i = 0; i < tamanho; i++) {
        grafico.data.datasets[0].data.push(gerarDadoAleatorio());
    }
    grafico.update();

    /*setTimeout(() => atualizarGrafico(grafico), 1000)*/
}

function inicializarGraficos() {
    const cpuCtx = document.getElementById('graficoRelatorioCPU').getContext('2d');
    const ramCtx = document.getElementById('graficoRelatorioRAM').getContext('2d');
    const discoCtx = document.getElementById('graficoRelatorioDisco').getContext('2d');

    const tamanho = 49

    const configLine = {
        type: 'line',
        data: {
            labels: [
                '16:00:00', '16:30:00', '17:00:00', '17:30:00', '18:00:00', '18:30:00', '19:00:00', '19:30:00',
                '20:00:00', '20:30:00', '21:00:00', '21:30:00', '22:00:00', '22:30:00', '23:00:00', '23:30:00',
                '00:00:00', '00:30:00', '01:00:00', '01:30:00', '02:00:00', '02:30:00', '03:00:00', '03:30:00',
                '04:00:00', '04:30:00', '05:00:00', '05:30:00', '06:00:00', '06:30:00', '07:00:00', '07:30:00',
                '08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
                '12:00:00', '12:30:00', '13:00:00', '13:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00',
                '16:00:00'
            ]
            ,
            datasets: [{
                label: '',
                data: [],
                borderColor: '#4e79a7',
                backgroundColor: 'rgba(78,121,167,0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800 },
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    };

    Chart.defaults.color = 'white';
    Chart.defaults.borderColor = '#383838';

    const graficoCPU = new Chart(cpuCtx, JSON.parse(JSON.stringify(configLine)));
    graficoCPU.data.datasets[0].label = 'Uso de CPU (%)';

    const graficoRAM = new Chart(ramCtx, JSON.parse(JSON.stringify(configLine)));
    graficoRAM.data.datasets[0].label = 'Uso de RAM (%)';

    const graficoDisco = new Chart(discoCtx, JSON.parse(JSON.stringify(configLine)));
    graficoDisco.data.datasets[0].label = 'Uso de Disco (%)';

    atualizarGrafico(graficoCPU, tamanho)
    atualizarGrafico(graficoRAM, tamanho)
    atualizarGrafico(graficoDisco, tamanho)
}