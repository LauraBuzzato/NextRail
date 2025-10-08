function inicializarGraficos() {
    const cpuCtx = document.getElementById('graficoRelatorioCPU').getContext('2d');
    const ramCtx = document.getElementById('graficoRelatorioRAM').getContext('2d');
    const discoCtx = document.getElementById('graficoRelatorioDisco').getContext('2d');

    const configLine = {
        type: 'line',
        data: {
            labels: Array.from({ length: 10 }, (_, i) => i + 1),
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

    function gerarDadoAleatorio() {
        return Math.floor(Math.random() * 100);
    }

    function atualizarGrafico(grafico) {
        if (grafico.data.datasets[0].data.length >= 10) {
            grafico.data.datasets[0].data.shift();
        }
        grafico.data.datasets[0].data.push(gerarDadoAleatorio());
        grafico.update();
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setInterval(() => atualizarGrafico(graficoCPU), 500);
            setInterval(() => atualizarGrafico(graficoRAM), 1000);
            setInterval(() => atualizarGrafico(graficoDisco), 700);
            observer.disconnect();
        }
    }, { threshold: 0.1 });


    observer.observe(document.getElementById('relatorios'));
}