
var chartFreq = null;
var chartComp = null;
var chartGrav = null;

function dash_analista() {
    console.log('Executando dash_analista...');

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não disponível em dash_analista');
        setTimeout(dash_analista, 500);
        return;
    }

    var alertasComponenteCanvas = document.getElementById('alertasComponenteChart');

    console.log('Criando gráficos do analista...');

    Chart.defaults.color = '#fff';
    Chart.defaults.font.weight = 'bold';

    // pegar ano e mês atuais 
    var hojeData = new Date();
    var anoEscolhido = hojeData.getFullYear();
    var mesEscolhido = hojeData.getMonth() + 1; // 1..12

    var caminhoRelatorio = '/relatorio/mensal-detalhado/' + anoEscolhido + '/' + mesEscolhido;


    fetch(caminhoRelatorio)
        .then(function (res) {
            if (!res.ok) {
                console.error('Erro ao buscar relatorio mensal-detalhado. Status:', res.status);
                return null;
            }
            return res.json();
        })
        .then(function (payload) {
            if (payload === null) {
                return;
            }

            var kpis = payload.kpisGerais;


            var mttrMedioMes = 0;
            if (kpis.mttrMedio !== undefined && kpis.mttrMedio !== null) {
                mttrMedioMes = Math.round(kpis.mttrMedio);
            }

            var elMttr = document.getElementById('kpi-mttr-medio');
            if (elMttr) {
                elMttr.innerText = `${mttrMedioMes} min`;
            } else {
                console.log('KPI mttrMedio:', mttrMedioMes);
            }

        });


    // ================================================= S3 ==============================================================

    var nomeServidor = localStorage.NOME_SERVIDOR

    if (!nomeServidor || nomeServidor === "undefined") {
        nomeServidor = "Servidor01";
    }
    var caminho = `/servidores/dados?nomeServer=${nomeServidor}`;

    console.log("Buscando dados do S3 em:", caminho);

    fetch(caminho)
        .then(function (res) {
            if (!res.ok) throw new Error('Erro ao pegar dados S3');
            return res.json();
        })
        .then(function (dadosS3) {
            console.log("JSON do S3 recebido:", dadosS3);



            var objGrafico = dadosS3.grafico_linha || {};

            var labelsProntas = objGrafico.labels || [];
            var dadosCpu = objGrafico.cpu || [];
            var dadosRam = objGrafico.ram || [];
            var dadosDisco = objGrafico.disco || [];


            var frequenciaCanvas = document.getElementById('frequenciaSemanalChart');


            if (frequenciaCanvas) {
                var configFreq = {
                    type: 'line',
                    data: {
                        labels: labelsProntas,
                        datasets: [
                            {
                                label: 'CPU',
                                data: dadosCpu,
                                borderColor: '#a78bfa',
                                backgroundColor: 'rgba(167,139,250,0.2)',
                                tension: 0.3,
                                fill: true,
                                pointRadius: 4,
                                borderWidth: 2
                            },
                            {
                                label: 'RAM',
                                data: dadosRam,
                                borderColor: '#38bdf8',
                                backgroundColor: 'rgba(56,189,248,0.2)',
                                tension: 0.3,
                                fill: true,
                                pointRadius: 4,
                                borderWidth: 2
                            },
                            {
                                label: 'Disco',
                                data: dadosDisco,
                                borderColor: '#ff89b0',
                                backgroundColor: 'rgba(255,137,176,0.2)',
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
                                display: true
                            },

                        },
                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false,
                            position: 'nearest',
                            // Adicione estas linhas:
                            z: 9999, // Alto z-index
                            external: function (context) {
                                // Garante que o tooltip fique na frente
                                var tooltip = context.tooltip;
                                if (tooltip && tooltip.el) {
                                    tooltip.el.style.zIndex = '9999';
                                }
                            }
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Quantidades',
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Dias',
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                }
                            }
                        }
                    }
                };

                if (chartFreq !== null) {
                    chartFreq.destroy(); chartFreq = null;
                }
                chartFreq = new Chart(frequenciaCanvas, configFreq);
            }


            var totalS3 = dadosS3.total_alertas_baixo +
                dadosS3.total_alertas_medio +
                dadosS3.total_alertas_alto


            var s3Baixo = dadosS3.total_alertas_baixo;
            var s3Medio = dadosS3.total_alertas_medio;
            var s3Alto = dadosS3.total_alertas_alto;

            var s3Cpu = dadosS3.total_alertas_cpu;
            var s3Ram = dadosS3.total_alertas_ram;
            var s3Disco = dadosS3.total_alertas_disco;


            var compMaisAfetado = ""

            if (s3Cpu >= s3Ram && s3Cpu >= s3Disco) {
                compMaisAfetado = "Cpu"
            } else if (s3Ram >= s3Cpu && s3Ram >= s3Disco) {
                compMaisAfetado = "Ram"
            }
            else if (s3Disco >= s3Ram && s3Disco >= s3Cpu) {
                compMaisAfetado = "Disco"
            }


            var elComp = document.getElementById('kpi-componente-mais-impactado');
            if (elComp) {
                elComp.innerText = compMaisAfetado;
            } else {
                console.log('KPI componenteMaisAfetado:', compMaisAfetado);
            }

            if (compMaisAfetado == "Cpu") {
                elComp.style.color = "#a78bfa";
            } else if (compMaisAfetado == "Ram") {
                elComp.style.color = "#38bdf8";
            } else if (compMaisAfetado == "Disco") {
                elComp.style.color = "#ff89b0";
            }


            var textoGravidade = "Sem alertas";
            var corKPI = "white";

            //Qtd total
            if (totalS3 > 0) {
                if (s3Alto >= s3Medio && s3Alto >= s3Baixo && s3Alto > 0) {
                    textoGravidade = "Alto";
                    corKPI = "rgba(255, 0, 0, 1)";
                }
                else if (s3Medio >= s3Baixo && s3Medio > s3Alto && s3Medio > 0) {
                    textoGravidade = "Médio";
                    corKPI = "rgba(255, 165, 0, 1)";
                }
                else if (s3Baixo > s3Medio && s3Baixo > s3Alto && s3Baixo > 0) {
                    textoGravidade = "Baixo";
                    corKPI = "rgba(255, 255, 0, 1)";
                }


                var maiorValor = Math.max(s3Alto, s3Medio, s3Baixo);

                // Prioridade 
                if (s3Alto === maiorValor) {
                    textoGravidade = "Alto";
                    corKPI = "rgba(255, 0, 0, 1)";
                }
                else if (s3Medio === maiorValor) {
                    textoGravidade = "Médio";
                    corKPI = "rgba(255, 165, 0, 1)";
                }
                else {
                    textoGravidade = "Baixo";
                    corKPI = "rgba(255, 255, 0, 1)";
                }
            }


            var kpiGravidade = document.getElementById('kpi-gravidade-mais-frequente');

            if (kpiGravidade) {
                kpiGravidade.innerHTML = textoGravidade;
                kpiGravidade.style.color = corKPI
                kpiGravidade.style.fontSize = "40px"
                kpiGravidade.style.weight = "bold"

            }
            console.log(`Cor aplicada: ${corKPI} (Alto: ${s3Alto}, Médio: ${s3Medio}, Baixo: ${s3Baixo})`);

            var kpiTotal = document.getElementById('kpi-total-alertas');
            if (kpiTotal) {
                kpiTotal.innerHTML = totalS3;
            }

            console.log(`Dados referentes a: ${dadosS3.mes_referencia}/${dadosS3.ano_referencia}`);


            // Alertas por Gravidade 
            var alertasServidorCanvas = document.getElementById('alertasServidorChart');

            if (alertasServidorCanvas) {
                var configGrav = {
                    type: 'bar',
                    data: {
                        labels: ['Baixo', 'Médio', 'Alto'],
                        datasets: [{
                            data: [s3Baixo, s3Medio, s3Alto],
                            backgroundColor: ['rgba(255, 255, 0, 1)', 'rgba(255, 165, 0, 1)', 'rgba(255, 0, 0, 1)'],
                            borderColor: ['rgba(255, 255, 0, 1)', 'rgba(3, 2, 0, 1)', 'rgba(255, 0, 0, 1)'],
                            borderWidth: 1,
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false,
                            position: 'nearest',
                            // Adicione estas linhas:
                            z: 9999, // Alto z-index
                            external: function (context) {
                                // Garante que o tooltip fique na frente
                                var tooltip = context.tooltip;
                                if (tooltip && tooltip.el) {
                                    tooltip.el.style.zIndex = '9999';
                                }
                            }
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Quantidades',
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Gravidades',
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                }
                            }
                        }
                    }
                };


                if (chartGrav !== null) {
                    chartGrav.destroy(); chartGrav = null;
                }
                chartGrav = new Chart(alertasServidorCanvas, configGrav);

            }
            // Alertas por Componente 
            if (alertasComponenteCanvas) {
                var configComp = {
                    type: 'bar',
                    data: {
                        labels: ['Cpu', 'Ram', 'Disco'],
                        datasets: [{
                            data: [s3Cpu, s3Ram, s3Disco],
                            backgroundColor: ['rgba(147, 112, 219, 0.8)', 'rgba(0, 191, 255, 0.8)', 'rgba(255, 137, 176, 0.8)'],
                            borderColor: ['#9370DB', '#00BFFF', '#ff89b0'],
                            borderWidth: 1,
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false,
                            position: 'nearest',
                            // Adicione estas linhas:
                            z: 9999, // Alto z-index
                            external: function (context) {
                                // Garante que o tooltip fique na frente
                                var tooltip = context.tooltip;
                                if (tooltip && tooltip.el) {
                                    tooltip.el.style.zIndex = '9999';
                                }
                            }
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Quantidades',
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Componentes',
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20,
                                        weight: "bold"
                                    }
                                }
                            }
                        }
                    }
                };

                if (chartComp !== null) {
                    chartComp.destroy(); chartComp = null;
                }
                chartComp = new Chart(alertasComponenteCanvas, configComp);
            }

        })
        .catch(function (erro) {
            console.error("Erro na integração S3:", erro);
        });


    //Lógica Definição kpi Sla
    var idServidor = sessionStorage.ID_SERVIDOR;

    fetch(`/servidores/sla/${idServidor}`)
        .then(res => res.json())
        .then(data => {
            console.log("Média de SLA recebida:", data.mediaSla);

            var metricaMTTR = document.getElementById('metrica-sla');

            if (metricaMTTR) {
                metricaMTTR.innerHTML = `(SLA: < ${data.mediaSla} min)`;
            }

        })
        .catch(err => {
            console.error("Erro ao buscar SLA:", err);
        });



    //Função de comparação de alertas (%) com base no mês anterior
    fetch(`/servidores/comparacao/${idServidor}`)
        .then(res => res.json())
        .then(dados => {
            var kpiVariacao = document.getElementById('variacao');
            if (kpiVariacao) {
                kpiVariacao.innerHTML = `
                    (${dados.percentual}% 
                    <ion-icon name="${dados.icone}" style="color: ${dados.cor}"></ion-icon> ${dados.texto})
                    `;
            }
        })
        .catch(err => console.error("Erro comparação:", err));

}


// dash suporte ------------------------------------------------------------------------------------------------------------------

let graficoSuporte;
let graficoRam;
let graficoCpu;
let graficoDisco;
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
                        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 88, 75],
                        borderColor: 'rgba(167,139,250,1)',
                        backgroundColor: 'rgba(167,139,250,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Uso de RAM (%)',
                        data: [28, 48, 40, 19, 86, 27, 90, 45, 60, 35, 50, 78, 82],
                        borderColor: 'rgba(56,189,248,1)',
                        backgroundColor: 'rgba(56,189,248,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Uso de Disco (%)',
                        data: [45, 35, 50, 60, 40, 55, 65, 50, 45, 60, 55, 48, 53],
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

    } catch (error) {
        console.error('Erro ao criar gráfico:', error);
    }
}

async function kpi_suporte(componente) {
    const larguraGrafico = 586;
    const alturaGrafico = 370;
    let parametrosJsonTemp;
    let parametrosScriptJsonTemp;

    try {
    const resposta = await fetch(`/servidores/buscarParametrosDoServidor/${sessionStorage.ID_SERVIDOR}/${componente}`);

    if (!resposta.ok) {
        
        const erroTexto = await resposta.text();
        console.error("Erro recebido do servidor:", erroTexto);
        return; 
    }
    
    parametrosJsonTemp = await resposta.json();
    console.log("Parametros do servidor: ", parametrosJsonTemp);

    } 
    catch (erro) {
        console.error("Erro de rede ou JSON: ", erro);
        return;
    }

    try {
    const resposta = await fetch(`/servidores/script/${sessionStorage.ID_SERVIDOR}`);

    if (!resposta.ok) {
        
        const erroTexto = await resposta.text();
        console.error("Erro recebido do servidor:", erroTexto);
        return; 
    }

        parametrosScriptJsonTemp = await resposta.json();
        console.log("Parametros script: ", parametrosScriptJsonTemp)

    } 
    catch (erro) {
        console.error("Erro de rede ou JSON: ", erro);
        return;
    }

    const parametrosJson = parametrosJsonTemp;
    const parametrosScriptJson = parametrosScriptJsonTemp;
    const dadosMaquinaJson = await buscarDadosComponentes();

    let dadosCpu = [], dadosRam = [], dadosDisco = [], timestamps = [];

    // 2 minutos (120 segundos) dividido pelo intervalo de leitura do script retorna a quantidade de dados do gráfico de linhas
    let tamanhoVetor = Math.round(120 / parametrosScriptJson[0].intervalo); 

    for (let i = dadosMaquinaJson.length - 1; i >= (dadosMaquinaJson.length - tamanhoVetor); i--){

        dadosCpu.push(Number(dadosMaquinaJson[i].cpu.replaceAll(",", ".")));
        dadosRam.push(Number(dadosMaquinaJson[i].ram.replaceAll(",", ".")));
        dadosDisco.push(Number(dadosMaquinaJson[i].disco.replaceAll(",", ".")));
        timestamps.push(dadosMaquinaJson[i].timestampCaptura.split(" ")[1]); // pegar somente o horário
    }
    
    if (componente == 'ram') {

        console.log('Inicializando kpi ram');
        const canvas = document.getElementById('grafico_ram');

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não carregado');
        setTimeout(kpi_suporte('ram'), 500);
        return;
    }
    
    if (graficoRam) {
        console.log('Destruindo gráfico anterior(ram)...');
        graficoRam.destroy();
        graficoRam = null;
    }
    
    try {
        canvas.width = larguraGrafico;
        canvas.height = alturaGrafico;

        const ctx = canvas.getContext('2d');
        
        const configLine = {
            type: 'line',
            data: {
                labels: timestamps.toReversed(),

                datasets: [
                    {
                        label: 'RAM (%)',
                        data: dadosRam.toReversed(),
                        borderColor: 'rgba(56,189,248,1)',
                        backgroundColor: 'rgba(56,189,248,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Alerta baixo',
                        data: Array(tamanhoVetor).fill(parametrosJson[0].valor),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Alerta médio',
                        data: Array(tamanhoVetor).fill(parametrosJson[1].valor),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Alerta alto',
                        data: Array(tamanhoVetor).fill(parametrosJson[2].valor),
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

        graficoRam = new Chart(ctx, configLine);
        console.log('Gráfico ram criado com sucesso!');

    } catch (error) {
        console.error('Erro ao criar gráfico ram:', error);
    }
}
    if (componente == 'cpu') {

        console.log('Inicializando kpi cpu');
        const canvas = document.getElementById('grafico_cpu');

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não carregado');
        setTimeout(kpi_suporte('cpu'), 500);
        return;
    }
    
    if (graficoCpu) {
        console.log('Destruindo gráfico anterior(cpu)...');
        graficoCpu.destroy();
        graficoCpu = null;
    }
    
    try {
        canvas.width = larguraGrafico;
        canvas.height = alturaGrafico;

        const ctx = canvas.getContext('2d');
        
        const configLine = {
            type: 'line',
            data: {
                labels: timestamps.toReversed(),

                datasets: [
                    {
                        label: 'CPU (%)',
                        data: dadosCpu.toReversed(),
                        borderColor: 'rgba(167,139,250,1)',
                        backgroundColor: 'rgba(167,139,250,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Alerta baixo',
                        data: Array(tamanhoVetor).fill(parametrosJson[0].valor),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Alerta médio',
                        data: Array(tamanhoVetor).fill(parametrosJson[1].valor),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Alerta alto',
                        data: Array(tamanhoVetor).fill(parametrosJson[2].valor),
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

        graficoCpu = new Chart(ctx, configLine);
        console.log('Gráfico cpu criado com sucesso!');

    } catch (error) {
        console.error('Erro ao criar gráfico cpu:', error);
    }
}
    if (componente == 'disco') {

        console.log('Inicializando kpi disco');
        const canvas = document.getElementById('grafico_disco');

    if (typeof Chart === 'undefined') {
        console.error('Chart.js não carregado');
        setTimeout(kpi_suporte('disco'), 500);
        return;
    }
    
    if (graficoDisco) {
        console.log('Destruindo gráfico anterior(disco)...');
        graficoDisco.destroy();
        graficoDisco = null;
    }
    
    try {
        canvas.width = larguraGrafico;
        canvas.height = alturaGrafico;

        const ctx = canvas.getContext('2d');
        
        const configLine = {
            type: 'line',
            data: {
                labels: timestamps.toReversed(),

                datasets: [
                    {
                        label: 'Disco (%)',
                        data: dadosDisco.toReversed(),
                        borderColor: 'rgba(251,191,36,1)',
                        backgroundColor: 'rgba(251,191,36,0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Alerta baixo',
                        data: Array(tamanhoVetor).fill(parametrosJson[0].valor),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Alerta médio',
                        data: Array(tamanhoVetor).fill(parametrosJson[1].valor),
                        borderColor: 'rgba(255,0,0,1)',
                        backgroundColor: 'rgba(255,0,0,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Alerta alto',
                        data: Array(tamanhoVetor).fill(parametrosJson[2].valor),
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

        graficoDisco = new Chart(ctx, configLine);
        console.log('Gráfico disco criado com sucesso!');

    } catch (error) {
        console.error('Erro ao criar gráfico disco:', error);
    } finally {
        setTimeout(() => kpi_suporte(componente), 130000);
    }
}
}

 async function buscarDadosComponentes() {
    try {

        const response = await fetch(`/servidores/pegarUso/${sessionStorage.NOME_EMPRESA}/${localStorage.NOME_SERVIDOR}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const dadosNovos = await response.json();
        
        console.log('Dados recebidos do bucket:', dadosNovos);
        
        return dadosNovos;

    } catch (error) {
        console.error('Erro ao buscar dados de uso:', error);
        return null;
    }
}

 async function criarTabela() {
    const conteudo = document.getElementById('tabela-conteudo');
    if (!conteudo) return;

    conteudo.innerHTML = `
    <span class="tabela-label">Componente</span>
    <span class="tabela-label">Grau</span>
    <span class="tabela-label">Status</span>
    <span class="tabela-label">Início</span>
    <span class="tabela-label">Fim</span>
    `;

    try {
        
        const resposta = await fetch(`/servidores/buscarAlertasDoServidor/${sessionStorage.ID_SERVIDOR}`);
        const alertasJson = await resposta.json();

        console.log("Alertas: ", alertasJson)

        document.documentElement.style.setProperty('--linhas-grid', `repeat(${alertasJson.length + 1}, 25%)`)

        for (let i = 0; i < alertasJson.length; i++) {
            
            if (alertasJson[i].status_alerta != "Andamento") {

                var componente, grau, status, inicio, fim, corComponente, corLeitura, corStatus;
                
                corLeitura = (alertasJson[i].gravidade == "Alto") ? "background-color: red" : 
                (alertasJson[i].gravidade == "Médio") ? "background-color: darkorange" :
                (alertasJson[i].gravidade == "Baixo") ? "background-color: rgb(207, 207, 0)" : ""
                
                corComponente = "color: var(--amarelo)"

                corStatus = (alertasJson[i].status_alerta == "Aberto") ? "background-color: red" : 
                (alertasJson[i].status_alerta == "Fechado") ? "background-color: green" : ""

                //formatando a data que naturalmente vem em um formato não amigável
                const inicioBruto = new Date(alertasJson[i].inicio);
                const fimBruto = new Date(alertasJson[i].fim);
        
                componente = alertasJson[i].componente;
                grau = alertasJson[i].gravidade;
                status = alertasJson[i].status_alerta;
                
                inicio = (alertasJson[i].inicio === null) ? "NA" : inicioBruto.toLocaleString("pt-BR", {
                    timeZone: "UTC"
                });

                fim = (alertasJson[i].fim === null) ? "NA" : fimBruto.toLocaleString("pt-BR", {
                    timeZone: "UTC"
                });
        
                conteudo.innerHTML += `
                <span class="tabela-celula" style="${corComponente}">${componente}</span>
                <span class="tabela-celula" style="${corLeitura}">${grau}</span>
                <span class="tabela-celula" style="${corStatus}">${status}</span>
                <span class="tabela-celula">${inicio}</span>
                <span class="tabela-celula">${fim}</span>
        `;
            }
        }
    } catch (erro) {
        console.log("Erro: ", erro)
    } finally {
        setTimeout(() => criarTabela(), 130000);
    }
}