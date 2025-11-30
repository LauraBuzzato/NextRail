
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

    var frequenciaCanvas = document.getElementById('frequenciaSemanalChart');
    var alertasComponenteCanvas = document.getElementById('alertasComponenteChart');
    var alertasServidorCanvas = document.getElementById('alertasServidorChart');

    if (!frequenciaCanvas) {
        console.error('Elemento frequenciaSemanalChart não encontrado');
        setTimeout(dash_analista, 200);
        return;
    }

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

            var porDia = {};
            var contagemComponentes = {};
            var contagemGravidades = {};

            var kpis = payload.kpisGerais;
            if (kpis !== undefined && kpis !== null) {
                var totalAlertsMes = 0;
                if (kpis.totalAlerts !== undefined && kpis.totalAlerts !== null) {
                    totalAlertsMes = kpis.totalAlerts;
                }

                var componenteMaisImpactado = 'N/A';
                if (kpis.componenteMaisAfetado !== undefined && kpis.componenteMaisAfetado !== null) {
                    componenteMaisImpactado = kpis.componenteMaisAfetado;
                }

                var mttrMedioMes = 0;
                if (kpis.mttrMedio !== undefined && kpis.mttrMedio !== null) {
                    mttrMedioMes = Math.round(kpis.mttrMedio);
                }

                var gravidadeMaisFrequente = 'N/A';
                if (kpis.gravidadePredominante !== undefined && kpis.gravidadePredominante !== null) {
                    gravidadeMaisFrequente = kpis.gravidadePredominante;
                }

                var elTotal = document.getElementById('kpi-total-alertas');
                if (elTotal) {
                    elTotal.innerText = totalAlertsMes;
                } else {
                    console.log('KPI totalAlerts:', totalAlertsMes);
                }


                var elComp = document.getElementById('kpi-componente-mais-impactado');
                if (elComp) {
                    elComp.innerText = componenteMaisImpactado;
                } else {
                    console.log('KPI componenteMaisAfetado:', componenteMaisImpactado);
                }

                var elMttr = document.getElementById('kpi-mttr-medio');
                if (elMttr) {
                    elMttr.innerText = mttrMedioMes;
                } else {
                    console.log('KPI mttrMedio:', mttrMedioMes);
                }

                var elGrav = document.getElementById('kpi-gravidade-mais-frequente');
                if (elGrav) {
                    elGrav.innerText = gravidadeMaisFrequente;
                } else {
                    console.log('KPI gravidadePredominante:', gravidadeMaisFrequente);
                }
            } else {
                console.log('kpisGerais não encontrado no payload');
            }

            var semanas;
            if (payload.dadosSemanais === undefined) {
                semanas = [];
            } else {
                semanas = payload.dadosSemanais;
            }

            for (var i = 0; i < semanas.length; i++) {
                var semana = semanas[i];
                var listaAlertas;
                if (semana.alertas === undefined) {
                    listaAlertas = [];
                } else {
                    listaAlertas = semana.alertas;
                }

                for (var j = 0; j < listaAlertas.length; j++) {
                    var alerta = listaAlertas[j];

                    var nomeCompRaw = alerta.nome_componente;
                    if (nomeCompRaw === undefined || nomeCompRaw === null) {
                        nomeCompRaw = alerta.componente;
                        if (nomeCompRaw === undefined || nomeCompRaw === null) {
                            nomeCompRaw = 'Outro';
                        }
                    }
                    var nomeCompLower = nomeCompRaw.toString().toLowerCase();
                    var chaveComp;

                    if (nomeCompLower.indexOf('cpu') !== -1) {
                        chaveComp = 'Cpu';
                    } else if (nomeCompLower.indexOf('ram') !== -1) {
                        chaveComp = 'Ram';
                    } else if (nomeCompLower.indexOf('disco') !== -1) {
                        chaveComp = 'Disco';
                    } else {
                        chaveComp = 'Outro';
                    }


                    if (contagemComponentes[chaveComp] === undefined) {
                        contagemComponentes[chaveComp] = 1;
                    } else {
                        contagemComponentes[chaveComp] = contagemComponentes[chaveComp] + 1;
                    }


                    var nomeGravRaw = alerta.nome_gravidade;
                    if (nomeGravRaw === undefined || nomeGravRaw === null) {
                        nomeGravRaw = alerta.gravidade;
                    }
                    var chaveGrav;
                    if (nomeGravRaw === undefined || nomeGravRaw === null) {
                        chaveGrav = 'indefinida';
                    } else {
                        var gravLower = nomeGravRaw.toString().toLowerCase();
                        if (gravLower.indexOf('alto') !== -1) {
                            chaveGrav = 'Alto';
                        } else if (gravLower.indexOf('med') !== -1 || gravLower.indexOf('méd') !== -1) {
                            chaveGrav = 'Médio';
                        } else if (gravLower.indexOf('baixo') !== -1) {
                            chaveGrav = 'Baixo';
                        } else {
                            chaveGrav = 'indefinida';
                        }
                    }

                    if (contagemGravidades[chaveGrav] === undefined) {
                        contagemGravidades[chaveGrav] = 1;
                    } else {
                        contagemGravidades[chaveGrav] = contagemGravidades[chaveGrav] + 1;
                    }

                    // por dia por componente (usamos YYYY-MM-DD para ordenar depois) 
                    var inicioRaw = alerta.inicio;
                    var dt = new Date(inicioRaw);

                    if (!isNaN(dt.getTime())) {
                        var y = dt.getFullYear();
                        var m = dt.getMonth() + 1;
                        var d = dt.getDate();
                        var mStr;
                        if (m < 10) {
                            mStr = '0' + m;
                        } else {
                            mStr = '' + m;
                        }
                        var dStr;
                        if (d < 10) {
                            dStr = '0' + d;
                        } else {
                            dStr = '' + d;
                        }
                        var chaveDia = y + '-' + mStr + '-' + dStr;

                        if (porDia[chaveDia] === undefined) {
                            porDia[chaveDia] = { 'Cpu': 0, 'Ram': 0, 'Disco': 0, 'Outro': 0 };
                        }

                        porDia[chaveDia][chaveComp] = porDia[chaveDia][chaveComp] + 1;
                    } else {
                        console.log("ERRO NA DATAA");

                    }
                }
            }

            // transformar porDia em arrays ordenados para o Chart (labels dd/MM)
            var chavesDatas = [];
            for (var k in porDia) {
                chavesDatas.push(k);
            }


            // ordenar chavesDatas por data (comparar new Date)
            chavesDatas.sort(function (a, b) {
                var da = new Date(a + 'T00:00:00');
                var db = new Date(b + 'T00:00:00');
                if (da < db) return -1;
                if (da > db) return 1;
                return 0;
            });

            var labelsDias = [];
            var cpuPorDia = [];
            var ramPorDia = [];
            var discoPorDia = [];

            if (chavesDatas.length === 0) {
                labelsDias.push('Sem dados');
                cpuPorDia.push(0);
                ramPorDia.push(0);
                discoPorDia.push(0);
            } else {
                for (var idx = 0; idx < chavesDatas.length; idx++) {
                    var chaveAtual = chavesDatas[idx]; // YYYY-MM-DD
                    var partes = chaveAtual.split('-');
                    var labelFormat = partes[2] + '/' + partes[1]; // DD/MM
                    labelsDias.push(labelFormat);

                    var objDia = porDia[chaveAtual];
                    if (objDia['Cpu'] === undefined) objDia['Cpu'] = 0;
                    if (objDia['Ram'] === undefined) objDia['Ram'] = 0;
                    if (objDia['Disco'] === undefined) objDia['Disco'] = 0;

                    cpuPorDia.push(objDia['Cpu']);
                    ramPorDia.push(objDia['Ram']);
                    discoPorDia.push(objDia['Disco']);
                }
            }

            // preparar arrays para componentes (ordem: Cpu, Ram, Disco) 
            var compCpu = 0;
            var compRam = 0;
            var compDisco = 0;

            if (contagemComponentes['Cpu'] !== undefined) {
                compCpu = contagemComponentes['Cpu'];
            }
            if (contagemComponentes['Ram'] !== undefined) {
                compRam = contagemComponentes['Ram'];
            }
            if (contagemComponentes['Disco'] !== undefined) {
                compDisco = contagemComponentes['Disco'];
            }

            //prepara array para gravidade
            var gravBaixo = 0;
            var gravMedio = 0;
            var gravAlto = 0;

            if (contagemGravidades['Baixo'] !== undefined) {
                gravBaixo = contagemGravidades['Baixo'];
            }
            if (contagemGravidades['Médio'] !== undefined) {
                gravMedio = contagemGravidades['Médio'];
            }
            if (contagemGravidades['Alto'] !== undefined) {
                gravAlto = contagemGravidades['Alto'];
            }

            // Frequência Semanal 
            if (frequenciaCanvas) {
                var configFreq = {
                    type: 'line',
                    data: {
                        labels: labelsDias,
                        datasets: [
                            {
                                label: 'CPU',
                                data: cpuPorDia,
                                borderColor: '#a78bfa',
                                backgroundColor: 'rgba(167,139,250,0.2)',
                                tension: 0.3,
                                fill: true,
                                pointRadius: 4,
                                borderWidth: 2
                            },
                            {
                                label: 'RAM',
                                data: ramPorDia,
                                borderColor: '#38bdf8',
                                backgroundColor: 'rgba(56,189,248,0.2)',
                                tension: 0.3,
                                fill: true,
                                pointRadius: 4,
                                borderWidth: 2
                            },
                            {
                                label: 'Disco',
                                data: discoPorDia,
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
                                display: false
                            }
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

            // Alertas por Componente 
            if (alertasComponenteCanvas) {
                var configComp = {
                    type: 'bar',
                    data: {
                        labels: ['Cpu', 'Ram', 'Disco'],
                        datasets: [{
                            data: [compCpu, compRam, compDisco],
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
                                        size: 14,
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

            // Alertas por Gravidade 
            if (alertasServidorCanvas) {
                var configGrav = {
                    type: 'bar',
                    data: {
                        labels: ['Baixo', 'Médio', 'Alto'],
                        datasets: [{
                            data: [gravBaixo, gravMedio, gravAlto],
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


                if (chartGrav !== null) { chartGrav.destroy(); chartGrav = null; }
                chartGrav = new Chart(alertasServidorCanvas, configGrav);
            }

        })
        .catch(function (err) {
            console.error('Erro no fetch do relatorio:', err);
        });

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
        canvas.height = 350;

        const ctx = canvas.getContext('2d');
        
        const configLine = {
            type: 'line',
            data: {
                labels: timestamps.toReversed(),

                datasets: [
                    {
                        label: 'Uso de RAM (%)',
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
        canvas.height = 350;

        const ctx = canvas.getContext('2d');
        
        const configLine = {
            type: 'line',
            data: {
                labels: timestamps.toReversed(),

                datasets: [
                    {
                        label: 'Uso de CPU (%)',
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
        canvas.height = 350;

        const ctx = canvas.getContext('2d');
        
        const configLine = {
            type: 'line',
            data: {
                labels: timestamps.toReversed(),

                datasets: [
                    {
                        label: 'Uso de Disco (%)',
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

        graficoCpu = new Chart(ctx, configLine);
        console.log('Gráfico disco criado com sucesso!');

    } catch (error) {
        console.error('Erro ao criar gráfico disco:', error);
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

        console.log(alertasJson)

        document.documentElement.style.setProperty('--linhas-grid', `repeat(${alertasJson.length + 1}, 25%)`)

        for (let i = 0; i < alertasJson.length; i++) {
            
            if (alertasJson[i].status_alerta != "Andamento") {

                var componente, grau, status, inicio, fim, corComponente, corLeitura, corStatus;
                
                corLeitura = (alertasJson[i].gravidade == "Alto") ? "background-color: red" : 
                (alertasJson[i].gravidade == "Médio") ? "background-color: darkorange" :
                (alertasJson[i].gravidade == "Baixo") ? "background-color: rgb(207, 207, 0)" : ""
                
                corComponente = (alertasJson[i].componente == "Cpu") ? "background-color: rgba(167,139,250,1)" : 
                (alertasJson[i].componente == "Ram") ? "background-color: rgba(56,189,248,1)" :
                (alertasJson[i].componente == "Disco") ? "background-color: rgba(251,191,36,1)" : ""
        
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
    }
}
console.log(sessionStorage)
console.log(localStorage)