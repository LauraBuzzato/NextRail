let meuChart = null;
let meuChart2 = null;
function adicionarNomeServidor() {
    nomeServidor.innerHTML = localStorage.NOME_SERVIDOR
}


async function mudarVisualizacao() {
    try {
        // destruir gráficos anteriores
        if (meuChart) { meuChart.destroy(); meuChart = null; }
        if (meuChart2) { meuChart2.destroy(); meuChart2 = null; }

        // pegar dados da tela
        const select = document.getElementById("selectComponentes");
        const option = select.options[select.selectedIndex];

        const componente = option.value;
        const nomeComponente = option.text;
        const periodo = selectPeriodo.value;

        nomePeriodo.innerHTML = periodo;

        const palavraAntesComponente = nomeComponente === "Disco" ? "do" : "da";

        const labelPeriodo = periodo === "Anual"
            ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            : ['01/11', '02/11', '03/11', '04/11', '05/11', '06/11', '07/11', '08/11', '09/11', '10/11', '11/11', '12/11', '13/11', '14/11', '15/11', '16/11', '17/11', '18/11', '19/11', '20/11', '21/11', '22/11', '23/11', '24/11', '25/11', '26/11', '27/11', '28/11', '29/11', '30/11'];

        const periodoParaTexto = periodo === "Anual" ? "anuais" : "mensais";
        const textoFreqAnterior = periodo === "Anual" ? "ano" : "mês";

        // --- FETCHS EM PARALELO ---
        const [
            posicao,
            gravidades,
            frequencia,
        ] = await Promise.all([
            fetch("/servidores/buscarPosicaoRank", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA,
                    idComponente: componente,
                    periodoAnalisado: periodo,
                    idServidor: sessionStorage.ID_SERVIDOR
                })
            }).then(r => r.json()),

            fetch("/servidores/buscarMetricas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA,
                    idComponente: componente,
                    idServidor: sessionStorage.ID_SERVIDOR
                })
            }).then(r => r.json()),

            fetch("/servidores/pegarFrequencia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA,
                    idComponente: componente,
                    periodoAnalisado: periodo,
                    idServidor: sessionStorage.ID_SERVIDOR
                })
            }).then(r => r.json())
        ]);

        let gravidadeBaixo = 0;

        for (let i = 0; i < gravidades.length; i++) {
            if (gravidades[i].nome_gravidade === "Baixo") {
                gravidadeBaixo = gravidades[i].valor;
                break;
            }
        }

        // --- KPIs de ranking ---
        const corPintar = posicao[0].posicao_ranking <= 3 ? "red" : "green";

        // --- Freq e gravidades ---
        let corFrequencia = "green";
        let freq = 0;
        let diferenca_freq = 0;

        if (frequencia.length > 0) {
            freq = frequencia[0].frequencia_alerta_percentual;
            diferenca_freq = frequencia[0].diferenca_percentual;

            // corrigido: loop decrescente
            for (let i = gravidades.length - 1; i >= 0; i--) {
                if (gravidades[i].valor <= freq) {
                    if (gravidades[i].nome_gravidade === "Baixo") corFrequencia = "yellow";
                    else if (gravidades[i].nome_gravidade === "Alto") corFrequencia = "red";
                    else corFrequencia = "orange";
                    break;
                }
            }
        }

        const textoDiferenca =
            diferenca_freq < 0 ? `↓ ${Math.abs(diferenca_freq)}% que o ${textoFreqAnterior} anterior` :
                diferenca_freq > 0 ? `↑ ${diferenca_freq}% que o ${textoFreqAnterior} anterior` :
                    `0% de diferença`;

        // --- Buscar dados do uso real ---
        const dadosUso = await fetch(`/servidores/uso?empresa=${sessionStorage.NOME_EMPRESA}&servidor=${localStorage.NOME_SERVIDOR}&tipo=${periodo.toLowerCase()}&ano=2025&mes=11&componente=${componente}`)
            .then(r => r.json());

        let mediaUso = periodo === "Anual" ? dadosUso.mediaAnual : dadosUso.mediaMensal;
        let taxaVariacao = dadosUso.variancia;

        let listaPeriodos = periodo === "Anual" ? dadosUso.mediasMensais : dadosUso.mediasDiarias;

        // --- Renderizar o HTML ---
        containerGeral.innerHTML = `
            <div class="container-KPIS">
                <div class="KPI">
                    <h2>Tempo em Alerta (%):</h2>
                    <h1 style="color: ${corFrequencia};">${freq}%</h1>
                    <h4 style="color: ${diferenca_freq <= 0 ? "green" : "red"};">${textoDiferenca}</h4>
                </div>
                <div class="KPI">
                    <h2>Gravidade dos alertas:</h2>
                    <canvas id="alertasComponenteChart"></canvas>
                </div>
                <div class="KPI">
                    <h2 class="titulo-kpi">Ranking:</h2>
                    <h1 class="texto-grande" style="color: ${corPintar};">${posicao[0].posicao_ranking}º</h1>
                    <h4>Servidor com mais alertas de ${nomeComponente}</h4>
                </div>
            </div>

            <div class="container-KPIS-segunda-linha">
                <div class="GRAFICO-2">
                    <h2>Variação do uso:</h2>
                    <canvas id="varicaoUso" width="1000" height="400"></canvas>
                </div>
                <div class="Container-KPI-2">
                    <div class="KPI-2">
                        <h2>Uso médio ${palavraAntesComponente} ${nomeComponente}:</h2>
                        <h1>${mediaUso.toFixed(2)}%</h1>
                    </div>
                    <div class="KPI-2">
                        <h2>Taxa de variação:</h2>
                        <h1>${taxaVariacao.toFixed(2)}</h1>
                    </div>
                </div>
            </div>
        `;

        // -------------------------------------------------------
        //   SOMENTE AGORA O CANVAS EXISTE → criar gráficos
        // -------------------------------------------------------

        // gráfico 2 – variação de uso
        const valoresGrafico = listaPeriodos.map(x => x.media);
        const ctx2 = document.getElementById("varicaoUso");

        meuChart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: labelPeriodo,
                datasets: [
                    {
                        label: nomeComponente,
                        data: valoresGrafico,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167,139,250,0.2)',
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 2
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
        });



        // agora buscar alertas (depois do canvas renderizado)
        const alertas = await fetch('/servidores/buscarAlertasComponenteEspecifico', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idempresa: sessionStorage.ID_EMPRESA,
                idComponente: componente,
                periodoAnalisado: periodo,
                idServidor: sessionStorage.ID_SERVIDOR
            })
        }).then(r => r.json());

        const ctx = document.getElementById("alertasComponenteChart");
        const pai = ctx.parentElement;

        if (alertas.length === 0) {
            const msg = document.createElement("h1");
            msg.textContent = `Sem alertas ${periodoParaTexto} de ${nomeComponente}`;
            msg.classList.add("msg-sem-servidores");
            msg.style.textAlign = "center";
            msg.style.color = "green";
            msg.style.marginTop = "-95px";
            pai.appendChild(msg);
        } else {
            const dataAlertas = alertas.map(a => a.total_alertas);

            meuChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Baixa", "Média", "Alta"],
                    datasets: [{
                        data: dataAlertas,
                        backgroundColor: ["yellow", "orange", "red"],
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

    } catch (erro) {
        console.error("Erro na visualização:", erro);
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

            mudarVisualizacao()
        })
        .catch(erro => console.log("#ERRO componentes:", erro));
}