function gerarDadoAleatorio() {
    return Math.floor(Math.random() * 100);
}

function atualizarGrafico(grafico) {
    /*if (grafico.data.datasets[0].data.length >= 5) {
        grafico.data.datasets[0].data.shift();
    }*/
    grafico.data.datasets[0].data.push(gerarDadoAleatorio());
    grafico.data.datasets[0].data.push(gerarDadoAleatorio());
    grafico.data.datasets[0].data.push(gerarDadoAleatorio());
    grafico.data.datasets[0].data.push(gerarDadoAleatorio());
    grafico.data.datasets[0].data.push(gerarDadoAleatorio());
    grafico.update();

    /*setTimeout(() => atualizarGrafico(grafico), 1000)*/
}

function inicializarGraficos() {
    const cpuCtx = document.getElementById('graficoRelatorioCPU').getContext('2d');
    const ramCtx = document.getElementById('graficoRelatorioRAM').getContext('2d');
    const discoCtx = document.getElementById('graficoRelatorioDisco').getContext('2d');

    const configLine = {
        type: 'line',
        data: {
            labels: ['16:00:00', '16:30:00', '17:00:00', '17:30:00', '18:00:00'],
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

    atualizarGrafico(graficoCPU)
    atualizarGrafico(graficoRAM)
    atualizarGrafico(graficoDisco)
}