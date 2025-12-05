console.log(sessionStorage.ID_SERVIDOR)
const idServidor = sessionStorage.ID_SERVIDOR;
const idEmpresa = sessionStorage.ID_EMPRESA;
let graficoLinha, graficoLatencia, intervaloAtualizacao;
let componenteAtual = "cpu", visaoGeralAtiva = true, botoesCriados = false;
let cacheCompleto = { semanal: null, mensal: null };

const componentes = { cpu: 1, ram: 2, disco: 3 };
const cores = { cpu: "#a78bfa", ram: "#38bdf8", disco: "#ff89b0" };
const nomes = { cpu: "CPU", ram: "RAM", disco: "Disco" };
let metricasAlerta = { cpu: { baixo: 70, medio: 80, alto: 90 }, ram: { baixo: 70, medio: 80, alto: 90 }, disco: { baixo: 70, medio: 80, alto: 90 } };

Chart.defaults.color = "#fff";
Chart.defaults.font.family = "Poppins";

function mostrarLoader() {
    document.getElementById("loader").style.display = "flex";
}

function esconderLoader() {
    document.getElementById("loader").style.display = "none";
}

async function buscarDados(url, body) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return response.ok ? await response.json() : null;
    } catch { return null; }
}

async function buscarMetricas(componente) {
    const fkComponente = componentes[componente];
    if (!fkComponente) return null;
    
    const metricas = await buscarDados('/servidores/buscarMetricas', {
        idempresa: idEmpresa, idComponente: fkComponente, idServidor: idServidor
    });
    
    return metricas ? processarMetricas(metricas) : null;
}

function processarMetricas(dados) {
    const metricas = { baixo: 70, medio: 80, alto: 90 };
    if (dados && Array.isArray(dados)) {
        dados.forEach(item => {
            const gravidade = (item.nome_gravidade || '').toLowerCase();
            const valor = Number(item.valor) || 0;
            if (gravidade.includes('baixo')) metricas.baixo = valor;
            else if (gravidade.includes('médio') || gravidade.includes('medio')) metricas.medio = valor;
            else if (gravidade.includes('alto')) metricas.alto = valor;
        });
    }
    return metricas;
}

async function carregarTodasMetricas() {
    const [cpu, ram, disco] = await Promise.all([
        buscarMetricas('cpu'), buscarMetricas('ram'), buscarMetricas('disco')
    ]);
    if (cpu) metricasAlerta.cpu = cpu;
    if (ram) metricasAlerta.ram = ram;
    if (disco) metricasAlerta.disco = disco;
}

async function buscarDadosHistoricosAlertas(componente, periodo) {
    const fkComponente = componentes[componente];
    if (!fkComponente) return null;
    
    return await buscarDados('/servidores/buscarAlertasHistorico', {
        idempresa: idEmpresa, idComponente: fkComponente, idServidor: idServidor, periodo: periodo
    });
}

async function buscarDadosPrevisaoAWS() {
    const periodo = periodoSelect.value;
    return await buscarDados('/servidores/pegarPrevisao', {
        servidorId: idServidor, periodo: periodo
    });
}

function processarDadosParaPrevisao(dadosReais, periodo) {
    if (!dadosReais || !Array.isArray(dadosReais) || dadosReais.length === 0) {
        return { historico: 2, previsao: 2, alto: [0,0,0,0], medio: [0,0,0,0], baixo: [0,0,0,0] };
    }

    const dadosAnterior = dadosReais.find(d => d.periodo && d.periodo.includes('anterior'));
    const dadosAtual = dadosReais.find(d => d.periodo && d.periodo.includes('atual'));

    const alertasAltosAnterior = dadosAnterior ? Number(dadosAnterior.alertas_altos) || 0 : 0;
    const alertasMediosAnterior = dadosAnterior ? Number(dadosAnterior.alertas_medios) || 0 : 0;
    const alertasBaixosAnterior = dadosAnterior ? Number(dadosAnterior.alertas_baixos) || 0 : 0;
    const alertasAltosAtual = dadosAtual ? Number(dadosAtual.alertas_altos) || 0 : 0;
    const alertasMediosAtual = dadosAtual ? Number(dadosAtual.alertas_medios) || 0 : 0;
    const alertasBaixosAtual = dadosAtual ? Number(dadosAtual.alertas_baixos) || 0 : 0;

    const calcularCrescimento = (atual, anterior) => {
        if (anterior === 0 && atual === 0) return 0;
        if (anterior === 0) return 100;
        return ((atual - anterior) / anterior) * 100;
    };

    const crescimentoAltos = calcularCrescimento(alertasAltosAtual, alertasAltosAnterior);
    const crescimentoMedios = calcularCrescimento(alertasMediosAtual, alertasMediosAnterior);
    const crescimentoBaixos = calcularCrescimento(alertasBaixosAtual, alertasBaixosAnterior);

    const preverProximo = (valorAtual, crescimento) => {
        const previsao = Math.max(0, Math.round(valorAtual * (1 + crescimento/100)));
        return previsao;
    };

    const temDadosConsistentes = alertasAltosAnterior + alertasAltosAtual > 0;

    let previsao1Altos, previsao2Altos, previsao1Medios, previsao2Medios, previsao1Baixos, previsao2Baixos;

    if (temDadosConsistentes) {
        previsao1Altos = preverProximo(alertasAltosAtual, crescimentoAltos);
        previsao2Altos = preverProximo(previsao1Altos, crescimentoAltos);
        previsao1Medios = preverProximo(alertasMediosAtual, crescimentoMedios);
        previsao2Medios = preverProximo(previsao1Medios, crescimentoMedios);
        previsao1Baixos = preverProximo(alertasBaixosAtual, crescimentoBaixos);
        previsao2Baixos = preverProximo(previsao1Baixos, crescimentoBaixos);
    } else {
        previsao1Altos = previsao2Altos = alertasAltosAtual;
        previsao1Medios = previsao2Medios = alertasMediosAtual;
        previsao1Baixos = previsao2Baixos = alertasBaixosAtual;
    }

    return {
        alto: [alertasAltosAnterior, alertasAltosAtual, previsao1Altos, previsao2Altos],
        medio: [alertasMediosAnterior, alertasMediosAtual, previsao1Medios, previsao2Medios],
        baixo: [alertasBaixosAnterior, alertasBaixosAtual, previsao1Baixos, previsao2Baixos],
        historico: 2, previsao: 2
    };
}

function calcularCrescimentoLatencia(dados) {
    if (!dados.latencia || dados.latencia.length < 4) {
        return { crescimento: 0, tendencia: "estavel", inicio: 0, fim: 0 };
    }

    const primeiroPonto = dados.latencia[1];
    const ultimoPonto = dados.latencia[3];
    let crescimentoPercentual = 0;
    let tendencia = "estavel";

    if (primeiroPonto > 0) {
        crescimentoPercentual = ((ultimoPonto - primeiroPonto) / primeiroPonto) * 100;
        crescimentoPercentual = Math.round(crescimentoPercentual * 10) / 10;
        tendencia = crescimentoPercentual > 2 ? "crescendo" : crescimentoPercentual < -2 ? "decrescendo" : "estavel";
    }

    return { crescimento: crescimentoPercentual, tendencia: tendencia, inicio: primeiroPonto, fim: ultimoPonto };
}

function determinarCorPorMetrica(valor, componente) {
    const metricas = metricasAlerta[componente] || metricasAlerta.cpu;
    if (valor < metricas.baixo) return '#51cf66';
    else if (valor < metricas.medio) return '#ffd43b';
    else if (valor < metricas.alto) return '#ff922b';
    else return '#ff6b6b';
}

function mostrarMensagemSemDados(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Dados não encontrados", canvas.width / 2, canvas.height / 2);
}

function destruirGrafico(grafico) {
    if (grafico && typeof grafico.destroy === 'function') grafico.destroy();
    return null;
}

function limparTodosGraficos() {
    graficoLinha = destruirGrafico(graficoLinha);
    graficoLatencia = destruirGrafico(graficoLatencia);
}

function criarBotoesComponentes() {
    if (botoesCriados) return;

    const btnVisaoGeral = document.createElement('button');
    btnVisaoGeral.className = 'btn-visao-geral';
    btnVisaoGeral.id = 'btnVisaoGeral';
    btnVisaoGeral.textContent = 'Visão Geral';
    btnVisaoGeral.style.background = "#ffe066";
    btnVisaoGeral.style.color = "#000";
    btnVisaoGeral.style.border = "1px solid #ffe066";
    btnVisaoGeral.addEventListener('click', toggleVisaoGeral);

    const filtrosContainer = document.getElementById('filtrosContainer');
    if (filtrosContainer) filtrosContainer.appendChild(btnVisaoGeral);

    const botoesContainer = document.createElement('div');
    botoesContainer.className = 'botoes-componentes hidden';
    botoesContainer.id = 'botoesComponentes';
    botoesContainer.innerHTML = `<label>Componente:</label><div class="grupo-botoes">
        <button class="btn-componente" data-componente="cpu"><ion-icon name="hardware-chip-outline"></ion-icon>CPU</button>
        <button class="btn-componente" data-componente="ram"><ion-icon name="speedometer-outline"></ion-icon>RAM</button>
        <button class="btn-componente" data-componente="disco"><ion-icon name="save-outline"></ion-icon>Disco</button></div>`;

    if (filtrosContainer) filtrosContainer.appendChild(botoesContainer);
    botoesCriados = true;

    document.querySelectorAll('.btn-componente').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-componente').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            componenteAtual = this.dataset.componente;
            visaoGeralAtiva = false;
            const btnVisaoGeral = document.getElementById('btnVisaoGeral');
            btnVisaoGeral.textContent = 'Voltar para Visão Geral';
            btnVisaoGeral.style.background = "transparent";
            btnVisaoGeral.style.color = "#ffe066";
            btnVisaoGeral.style.border = "1px solid #ffe066";
            const periodo = periodoSelect.value;
            cacheCompleto[periodo] ? usarDadosCache(periodo) : atualizarDashboard();
        });
    });
}

function toggleVisaoGeral() {
    mostrarLoader()
    visaoGeralAtiva = !visaoGeralAtiva;
    const btnVisaoGeral = document.getElementById('btnVisaoGeral');
    const botoesComponentes = document.getElementById('botoesComponentes');
    
    if (visaoGeralAtiva) {
        btnVisaoGeral.textContent = 'Visão Geral';
        botoesComponentes.classList.add('hidden');
        document.querySelectorAll('.btn-componente').forEach(btn => btn.classList.remove('active'));
    } else {
        btnVisaoGeral.textContent = 'Voltar para Visão Geral';
        botoesComponentes.classList.remove('hidden');
        document.querySelectorAll('.btn-componente').forEach(btn => {
            if (btn.dataset.componente === componenteAtual) btn.classList.add('active');
        });
    }
    
    btnVisaoGeral.style.background = btnVisaoGeral.textContent == "Voltar para Visão Geral" ? "transparent" : "#ffe066";
    btnVisaoGeral.style.color = btnVisaoGeral.textContent == "Voltar para Visão Geral" ? "#ffe066" : "#000";
    btnVisaoGeral.style.border = "1px solid #ffe066";

    const periodo = periodoSelect.value;
    cacheCompleto[periodo] ? usarDadosCache(periodo) : atualizarDashboard();
}

async function usarDadosCache(periodo) {
    const dadosAWS = cacheCompleto[periodo];
    if (!dadosAWS) return;

    if (visaoGeralAtiva) {
        renderGraficoLinhasMultiplas(dadosAWS);
        renderGraficoLatenciaGeral(dadosAWS);
        atualizarKPIsGerais(dadosAWS);
    } else {
        renderGraficoLinhaUnica(dadosAWS);
        atualizarKPIs(dadosAWS);
        renderGraficoAlertas();
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    esconderLoader();
}


function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function gerarLabelsComDatas(periodo) {
    const hoje = new Date();
    const labels = [];

    if (periodo === "semanal") {
        const datas = [
            new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000),
            hoje,
            new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000),
            new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000)
        ];
        
        datas.forEach(data => {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            labels.push(`${dia}/${mes}/${ano}`);
        });
        
    } else { 
        const nomesDosMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const mesAtual = hoje.getMonth();
        
        for (let i = -1; i <= 2; i++) {
            let mesIndex = mesAtual + i;
            let ano = hoje.getFullYear();
            
            if (mesIndex < 0) {
                mesIndex += 12;
                ano -= 1;
            } else if (mesIndex >= 12) {
                mesIndex -= 12;
                ano += 1;
            }
            
            labels.push(nomesDosMeses[mesIndex]);
        }
    }

    return labels;
}
const labelsSemanais = gerarLabelsComDatas("semanal");
console.log("Labels Semanais:", labelsSemanais);


const labelsMensais = gerarLabelsComDatas("mensal");
console.log("Labels Mensais:", labelsMensais);





async function atualizarDashboard() {
    mostrarLoader()
    const periodo = periodoSelect.value;
    limparTodosGraficos();
    await carregarTodasMetricas();

    if (cacheCompleto[periodo]) {
        usarDadosCache(periodo);
        return;
    }

    if (!visaoGeralAtiva) await renderGraficoAlertas();

    try {
        const dadosAWS = await buscarDadosPrevisaoAWS();
        if (dadosAWS) {
            cacheCompleto[periodo] = dadosAWS;
            if (visaoGeralAtiva) {
                renderGraficoLinhasMultiplas(dadosAWS);
                renderGraficoLatenciaGeral(dadosAWS);
                atualizarKPIsGerais(dadosAWS);
            } else {
                renderGraficoLinhaUnica(dadosAWS);
                atualizarKPIs(dadosAWS);
            }
        } else {
            document.getElementById("kpisContainer").innerHTML = '<div class="KPI"><p>Dados temporariamente indisponíveis</p></div>';
        }
    } catch {
        if (!visaoGeralAtiva) document.getElementById("kpisContainer").innerHTML = '<div class="KPI"><p>Dados temporariamente indisponíveis</p></div>';
    }

    esconderLoader()
}

function renderGraficoLinhaUnica(dados) {
    const canvas = document.getElementById("graficoPrevisaoLinha");
    if (!canvas) return;

    document.getElementById("recursos").textContent = `Previsão de uso de ${componenteAtual} ${periodoSelect.value}`;
    
    const labels = gerarLabelsComDatas(periodoSelect.value);
    const dadosCompletos = dados[componenteAtual];

    if (!dadosCompletos || dadosCompletos.length !== 4) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    const datasets = [];
    const dadosHistorico = dadosCompletos.slice(0, 2);
    const dadosPrevisao = dadosCompletos.slice(2, 4);

    datasets.push({
        label: nomes[componenteAtual],
        data: dadosHistorico.concat(Array(2).fill(null)),
        borderColor: cores[componenteAtual],
        backgroundColor: `${cores[componenteAtual]}20`,
        fill: false, tension: 0.4, borderWidth: 3,
        pointRadius: 5, pointBackgroundColor: cores[componenteAtual], spanGaps: true
    });

    datasets.push({
        label: nomes[componenteAtual] + " (previsão)",
        data: [null, dadosHistorico[1], ...dadosPrevisao],
        borderColor: cores[componenteAtual],
        backgroundColor: `${cores[componenteAtual]}20`,
        fill: false, tension: 0.4, borderWidth: 3,
        pointRadius: 3, pointBackgroundColor: cores[componenteAtual],
        borderDash: [6, 6], spanGaps: true, isDashed: true
    });

    const limiteBaixo = metricasAlerta[componenteAtual]?.baixo || 70;
    datasets.push({
        label: "Limite alerta",
        data: Array(labels.length).fill(Number(limiteBaixo)),
        borderColor: "yellow", backgroundColor: "rgba(166, 161, 84, 0.2)",
        tension: 0.4, fill: false, pointRadius: 0
    });

    const ctx = canvas.getContext("2d");
    if (graficoLinha) graficoLinha.destroy();

    const temDadosValidos = dadosCompletos.some(valor => valor > 0);
    if (!temDadosValidos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    graficoLinha = new Chart(ctx, {
        type: "line", data: { labels, datasets },
        options: {
            maintainAspectRatio: false, responsive: true,
            plugins: {
                tooltip: { callbacks: { label: context => `${context.dataset.label || ''}: ${context.parsed.y.toFixed(1)}%` } },
                legend: { display: true, labels: { filter: (legendItem, chartData) => !chartData.datasets[legendItem.datasetIndex].isDashed, color: "#fff", font: { size: 15 } } }
            },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)" }, ticks: { color: "#fff", font: { size: 15 } } },
                x: { grid: { color: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)" }, ticks: { color: "#fff", font: { size: 12 } } }
            }
        }
    });
}


function renderGraficoLatenciaGeral(dados) {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) return;
    
    const labels = gerarLabelsComDatas(periodoSelect.value);
    const data = dados.latencia || [0, 0, 0, 0];
    const ctx = canvas.getContext("2d");
    
    if (graficoLatencia) graficoLatencia.destroy();

    document.getElementById('graflat').textContent = "Previsão de Latência entre os componentes";

    const temDadosValidos = data.some(valor => valor > 0);
    if (!temDadosValidos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    graficoLatencia = new Chart(ctx, {
        type: "bar", data: {
            labels: labels,
            datasets: [{
                label: "Latência", data: data,
                backgroundColor: context => `rgba(68, 94, 290, ${context.dataIndex < 2 ? '0.8' : '0.4'})`,
                borderColor: context => `rgba(47, 79, 242, 1), ${context.dataIndex < 2 ? '1' : '0.6'})`,
                borderWidth: 2, borderDash: context => context.dataIndex >= 2 ? [5,5] : []
            }]
        },
        options: {
            maintainAspectRatio: false, responsive: true,
            plugins: {
                tooltip: { callbacks: { label: context => `${context.dataset.label}${context.dataIndex < 2 ? ' (Histórico)' : ' (Previsão)'}: ${context.parsed.y.toFixed(1)} ms` } },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)" }, ticks: { color: "#fff", font: { size: 15 } } },
                x: { grid: { color: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)" }, ticks: { color: "#fff", font: { size: 12 } } }
            }
        }
    });
}

async function renderGraficoAlertas() {
    const canvas = document.getElementById("graficoLatencia");
    if (!canvas) return;
    
    const periodo = periodoSelect.value;
    const alertasReais = await buscarDadosHistoricosAlertas(componenteAtual, periodo);
    if (!alertasReais) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    let dadosProcessados = alertasReais.alto && alertasReais.medio && alertasReais.baixo ? alertasReais : processarDadosParaPrevisao(alertasReais, periodo);
    if (!dadosProcessados) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    const totalPontos = dadosProcessados.historico + dadosProcessados.previsao;
    const hoje = new Date();
    const labels = gerarLabelsComDatas(periodoSelect.value);

    const ajustarArray = (array, tamanho) => {
        if (!array) return Array(tamanho).fill(0);
        if (array.length === tamanho) return array;
        if (array.length > tamanho) return array.slice(0, tamanho);
        return array.concat(Array(tamanho - array.length).fill(0));
    };

    document.getElementById("graflat").textContent = `Gráfico de Alertas ${componenteAtual}`

    const alto = ajustarArray(dadosProcessados.alto, totalPontos);
    const medio = ajustarArray(dadosProcessados.medio, totalPontos);
    const baixo = ajustarArray(dadosProcessados.baixo, totalPontos);

    const datasets = [
        { label: 'Alertas Altos', data: alto, backgroundColor: context => `rgba(244, 67, 54, ${context.dataIndex < dadosProcessados.historico ? '0.8' : '0.4'})`, borderColor: context => `rgba(244, 67, 54, ${context.dataIndex < dadosProcessados.historico ? '1' : '0.7'})`, borderWidth: 1, borderDash: context => context.dataIndex >= dadosProcessados.historico ? [4,4] : [] },
        { label: 'Alertas Médios', data: medio, backgroundColor: context => `rgba(255, 152, 0, ${context.dataIndex < dadosProcessados.historico ? '0.8' : '0.4'})`, borderColor: context => `rgba(255, 152, 0, ${context.dataIndex < dadosProcessados.historico ? '1' : '0.7'})`, borderWidth: 1, borderDash: context => context.dataIndex >= dadosProcessados.historico ? [4,4] : [] },
        { label: 'Alertas Baixos', data: baixo, backgroundColor: context => `rgba(255, 235, 59, ${context.dataIndex < dadosProcessados.historico ? '0.8' : '0.4'})`, borderColor: context => `rgba(255, 235, 59, ${context.dataIndex < dadosProcessados.historico ? '1' : '0.7'})`, borderWidth: 1, borderDash: context => context.dataIndex >= dadosProcessados.historico ? [4,4] : [] }
    ];

    const ctx = canvas.getContext("2d");
    if (graficoLatencia) graficoLatencia.destroy();

    graficoLatencia = new Chart(ctx, {
        type: "bar", data: { labels, datasets },
        options: {
            maintainAspectRatio: false, responsive: true, indexAxis: 'x',
            plugins: {
                tooltip: { mode: 'index', intersect: false, callbacks: { label: context => `${context.dataset.label}${context.dataIndex < dadosProcessados.historico ? ' (Histórico)' : ' (Previsão)'}: ${context.parsed.y} alerta${context.parsed.y !== 1 ? 's' : ''}` } },
                legend: { position: "top", labels: { color: "#fff", font: { size: 15 } } }
            },
            scales: {
                y: { beginAtZero: true, stacked: false, grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#fff", font: { size: 15 }, callback: value => `${value} alerta${value !== 1 ? 's' : ''}` } },
                x: { stacked: false, grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#fff", font: { size: 12 } } }
            }
        }
    });
}

function renderGraficoLinhasMultiplas(dados) {
    const canvas = document.getElementById("graficoPrevisaoLinha");
    if (!canvas) return;
    
    const labels = gerarLabelsComDatas(periodoSelect.value);
    const datasets = [];

    document.getElementById('recursos').textContent = `Previsão do Uso de Recursos ${periodoSelect.value}`;

    for (const componente in dados) {
        if (['cpu', 'ram', 'disco'].includes(componente)) {
            const dadosCompletos = dados[componente];
            if (!dadosCompletos || dadosCompletos.length !== 4) continue;

            const dadosHistorico = dadosCompletos.slice(0, 2);

            datasets.push({
                label: nomes[componente],
                data: dadosHistorico.concat([null, null]),
                borderColor: cores[componente],
                backgroundColor: `${cores[componente]}20`,
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: cores[componente],
                spanGaps: true
            });

            datasets.push({
                label: nomes[componente] + " (previsão)",
                data: [null, dadosHistorico[1], ...dadosCompletos.slice(2, 4)],
                borderColor: cores[componente],
                backgroundColor: `${cores[componente]}20`,
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 3,
                pointBackgroundColor: cores[componente],
                borderDash: [6, 6],
                spanGaps: true
            });
        }
    }

    const ctx = canvas.getContext("2d");
    if (graficoLinha) graficoLinha.destroy();

    const temDadosValidos = datasets.some(dataset => 
        dataset.data.some(valor => valor !== null && valor > 0)
    );
    
    if (!temDadosValidos) {
        mostrarMensagemSemDados(canvas);
        return;
    }

    graficoLinha = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += context.parsed.y.toFixed(1) + '%';
                            return label;
                        }
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        filter: function (legendItem, chartData) {
                            return !legendItem.text.includes('previsão');
                        },
                        color: '#fff',
                        font: { size: 15 }
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
                        font: { size: 15 }
                    }
                },
                x: {
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)"
                    },
                    ticks: {
                        color: "#fff",
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

async function atualizarKPIs(dados) {
    const periodo = periodoSelect.value;
    const valores = dados[componenteAtual] || [0, 0, 0, 0];
    const mediaUso = Array.isArray(valores) ? (valores.reduce((a,b)=>a+b,0)/valores.length).toFixed(1) : "0.0";

    const hoje = new Date();
    const dataInicio = new Date(hoje);
    const dataFim = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - (periodo === "semanal" ? 7 : 30));
    dataFim.setDate(hoje.getDate() + (periodo === "semanal" ? 14 : 60));

    let crescimentoPercentual = 0;
    let tendencia = "estavel";
    if (valores.length >= 4) {
        const primeiroPonto = valores[1];
        const ultimoPonto = valores[3];
        if (primeiroPonto > 0) {
            crescimentoPercentual = ((ultimoPonto - primeiroPonto) / primeiroPonto) * 100;
            crescimentoPercentual = Math.round(crescimentoPercentual * 10) / 10;
            tendencia = crescimentoPercentual > 2 ? "crescendo" : crescimentoPercentual < -2 ? "decrescendo" : "estavel";
        }
    }

    const alertasReais = await buscarDadosHistoricosAlertas(componenteAtual, periodo);
    let alertaMaisFrequente = "Sem alertas";
    let corAlerta = "#51cf66";
    let temAlertas = false;

    if (alertasReais) {
        const dadosProcessados = processarDadosParaPrevisao(alertasReais, periodo);
        if (dadosProcessados && dadosProcessados.alto && dadosProcessados.medio && dadosProcessados.baixo) {
            const previsoesAltos = dadosProcessados.alto.slice(2,4) || [0,0];
            const previsoesMedios = dadosProcessados.medio.slice(2,4) || [0,0];
            const previsoesBaixos = dadosProcessados.baixo.slice(2,4) || [0,0];
            const totalAltos = previsoesAltos.reduce((a,b)=>a+b,0);
            const totalMedios = previsoesMedios.reduce((a,b)=>a+b,0);
            const totalBaixos = previsoesBaixos.reduce((a,b)=>a+b,0);
            const totalAlertas = totalAltos + totalMedios + totalBaixos;

            if (totalAlertas > 0) {
                temAlertas = true;
                if (totalAltos > totalMedios && totalAltos > totalBaixos) { alertaMaisFrequente = "Alto"; corAlerta = "#ff6b6b"; }
                else if (totalMedios > totalBaixos) { alertaMaisFrequente = "Médio"; corAlerta = "#ff922b"; }
                else if (totalBaixos > 0) { alertaMaisFrequente = "Baixo"; corAlerta = "#ffd43b"; }
            }
        }
    }

    const corTendencia = tendencia === 'crescendo' ? '#ff6b6b' : tendencia === 'decrescendo' ? '#51cf66' : 'rgba(255, 255, 255, 1)';
    const iconeTendencia = tendencia === 'crescendo' ? '📈' : tendencia === 'decrescendo' ? '📉' : null;
    const periodoTexto = periodo === "mensal" ? "Mensal" : "Semanal";
    const corMedia = determinarCorPorMetrica(Number(mediaUso), componenteAtual);

    let statusComponente = "Normal";
    if (Number(mediaUso) >= metricasAlerta[componenteAtual].medio) statusComponente = "Atenção";
    if (Number(mediaUso) >= metricasAlerta[componenteAtual].alto) statusComponente = "Crítico";
    const corStatus = determinarCorPorMetrica(Number(mediaUso), componenteAtual);

    document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI"><h2>Previsão de Uso Médio de ${componenteAtual} ${periodoTexto}</h2><p class="valor-kpi" style="color:${corMedia}">${mediaUso}%</p><p class="descricao-kpi" style="font-size:12px;margin-top:5px;">Status: ${statusComponente}</p></div>
        <div class="KPI"><h2>Taxa de Crescimento Projetada</h2><p class="descricao-kpi">${formatarData(dataInicio)} → ${formatarData(dataFim)}</p><p class="valor-kpi" style="color:${corTendencia}">${crescimentoPercentual > 0 ? '+' : ''}${crescimentoPercentual.toFixed(1)}%</p><p class="tendencia" style="color:${corTendencia}">${iconeTendencia || ''} ${tendencia === "crescendo" ? "Crescendo" : tendencia === "decrescendo" ? "Decrescendo" : "Estável"}</p></div>
        <div class="KPI"><h2>Previsão do Alerta Mais Frequente</h2><p class="valor-kpi" style="color:${corAlerta}">${alertaMaisFrequente}</p><p class="descricao-kpi" style="font-size:12px;margin-top:5px;">${temAlertas ? 'Baseado nas previsões futuras' : 'Sem alertas previstos'}</p></div>
        <div class="KPI"><h2>Status do Componente</h2><p class="valor-kpi" style="color:${corStatus}">${statusComponente}</p></div>
    `;
}

function atualizarKPIsGerais(dados) {
    const periodo = periodoSelect.value;
    const crescimentoLatencia = calcularCrescimentoLatencia(dados);

    const valoresPrevisoes = {
        cpu: dados.cpu ? Math.max(dados.cpu[2], dados.cpu[3]) : 0,
        ram: dados.ram ? Math.max(dados.ram[2], dados.ram[3]) : 0,
        disco: dados.disco ? Math.max(dados.disco[2], dados.disco[3]) : 0
    };

    let maiorComponentePrevisao = "ram";
    let maiorValorPrevisao = valoresPrevisoes.ram;
    if (valoresPrevisoes.cpu > maiorValorPrevisao) { maiorComponentePrevisao = "cpu"; maiorValorPrevisao = valoresPrevisoes.cpu; }
    if (valoresPrevisoes.disco > maiorValorPrevisao) { maiorComponentePrevisao = "disco"; maiorValorPrevisao = valoresPrevisoes.disco; }

    const valoresAtuais = { cpu: dados.cpu ? dados.cpu[1] : 0, ram: dados.ram ? dados.ram[1] : 0, disco: dados.disco ? dados.disco[1] : 0 };
    const valoresPrimeiroPonto = { cpu: dados.cpu ? dados.cpu[0] : 0, ram: dados.ram ? dados.ram[0] : 0, disco: dados.disco ? dados.disco[0] : 0 };
    const mediaPrimeiroPonto = (valoresPrimeiroPonto.cpu + valoresPrimeiroPonto.ram + valoresPrimeiroPonto.disco) / 3;
    const mediaAtual = (valoresAtuais.cpu + valoresAtuais.ram + valoresAtuais.disco) / 3;

    let crescimentoMedio = 0;
    let tendenciaMedia = "estavel";
    if (mediaPrimeiroPonto > 0) {
        crescimentoMedio = ((mediaAtual - mediaPrimeiroPonto) / mediaPrimeiroPonto) * 100;
        crescimentoMedio = Math.round(crescimentoMedio * 10) / 10;
        tendenciaMedia = crescimentoMedio > 2 ? "crescendo" : crescimentoMedio < -2 ? "decrescendo" : "estavel";
    }

    let somaTotal = 0, contador = 0;
    ['cpu', 'ram', 'disco'].forEach(componente => {
        const valores = dados[componente];
        if (valores && Array.isArray(valores)) valores.forEach(valor => { if (!isNaN(valor)) { somaTotal += valor; contador++; } });
    });

    const mediaGeral = contador > 0 ? somaTotal / contador : 0;
    const corMedia = determinarCorPorMetrica(mediaGeral, 'cpu');
    const corMaiorComponente = determinarCorPorMetrica(maiorValorPrevisao, maiorComponentePrevisao);
    const corTextoMaiorComponente = cores[maiorComponentePrevisao];
    const corCrescimentoLatencia = crescimentoLatencia.tendencia === 'crescendo' ? '#rgb(65, 94, 243)' : crescimentoLatencia.tendencia === 'decrescendo' ? '#rgb(65, 94, 243)' : 'rgb(65, 94, 243)';

    let statusGeral = "Normal";
    if (mediaGeral >= metricasAlerta.cpu.medio) statusGeral = "Atenção";
    if (mediaGeral >= metricasAlerta.cpu.alto) statusGeral = "Crítico";
    const corStatus = determinarCorPorMetrica(mediaGeral, 'cpu');

    const hoje = new Date();
    const dataFim = new Date(hoje);
    dataFim.setDate(hoje.getDate() + (periodo === "semanal" ? 14 : 60));

    document.getElementById("kpisContainer").innerHTML = `
        <div class="KPI"><h2>Uso Médio Geral ${periodo === "mensal" ? "Mensal" : "Semanal"}</h2><p class="valor-kpi" style="color:${corMedia}">${mediaGeral.toFixed(1)}%</p></div>
        <div class="KPI"><h2>Componente com Maior Uso na Previsão</h2><p class="valor-kpi" style="color:${corTextoMaiorComponente}">${nomes[maiorComponentePrevisao]}</p><p class="tendencia" style="color:${corMaiorComponente}">${maiorValorPrevisao.toFixed(1)}%</p><p class="descricao-kpi" style="font-size:12px;margin-top:5px;">Previsão de pico</p></div>
        <div class="KPI"><h2>Taxa de Crescimento da Latência</h2><p class="descricao-kpi">${formatarData(hoje)} → ${formatarData(dataFim)}</p><p class="valor-kpi" style="color:rgba(47, 79, 242, 1)">${crescimentoLatencia.crescimento > 0 ? '+' : ''}${crescimentoLatencia.crescimento.toFixed(1)}%</p><p class="tendencia" style="color:${corCrescimentoLatencia}">${crescimentoLatencia.tendencia === "crescendo" ? "📈" : crescimentoLatencia.tendencia === "decrescendo" ? "📉" : ""} ${crescimentoLatencia.tendencia === "crescendo" ? "Crescendo" : crescimentoLatencia.tendencia === "decrescendo" ? "Decrescendo" : "Estável"}</p><p class="descricao-kpi" style="font-size:12px;margin-top:5px;">${crescimentoLatencia.inicio.toFixed(1)}ms → ${crescimentoLatencia.fim.toFixed(1)}ms</p></div>
        <div class="KPI"><h2>Status Geral do Servidor</h2><p class="valor-kpi" style="color:${corStatus}">${statusGeral}</p></div>
    `;
}

function iniciarAtualizacaoAutomatica() {
    if (intervaloAtualizacao) clearInterval(intervaloAtualizacao);
    intervaloAtualizacao = setInterval(async function () {
        const periodo = periodoSelect.value;
        try {
            const dadosAWS = await buscarDadosPrevisaoAWS();
            if (dadosAWS) {
                cacheCompleto[periodo] = dadosAWS;
                if (visaoGeralAtiva) {
                    renderGraficoLinhasMultiplas(dadosAWS);
                    renderGraficoLatenciaGeral(dadosAWS);
                    atualizarKPIsGerais(dadosAWS);
                } else {
                    renderGraficoLinhaUnica(dadosAWS);
                    atualizarKPIs(dadosAWS);
                }
            }
        } catch {}
    }, 120000);
}

async function inicializar() {
    mostrarLoader()
    criarBotoesComponentes();
    const periodoSelect = document.getElementById("periodoSelect");
    if (periodoSelect) periodoSelect.addEventListener("change", atualizarDashboard);
    await atualizarDashboard();
    esconderLoader()
    iniciarAtualizacaoAutomatica();
}

document.addEventListener('DOMContentLoaded', inicializar);