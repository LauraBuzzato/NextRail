let meuChart = null;
let meuChart2 = null;
function adicionarNomeServidor() {
    nomeServidor.innerHTML = localStorage.NOME_SERVIDOR
}

function mostrarLoader() {
    document.getElementById("loader").style.display = "flex";
}

function esconderLoader() {
    document.getElementById("loader").style.display = "none";
}



async function mudarVisualizacao() {
    try {
        mostrarLoader();
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
        const corGraficoUsoComponente = nomeComponente === "Disco" ? "do" : "da";

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

            if (freq > 10) {
                corFrequencia = "red"
            }
        }

        const textoDiferenca =
            diferenca_freq < 0 ? `↓ ${Math.abs(diferenca_freq)}% que o ${textoFreqAnterior} anterior` :
                diferenca_freq > 0 ? `↑ ${diferenca_freq}% que o ${textoFreqAnterior} anterior` :
                    `0% de diferença que o ${textoFreqAnterior} anterior`;

        // --- Buscar dados do uso real ---
        const hoje = new Date();
        const mesAtual = hoje.getMonth() + 1;
        const anoAtual = hoje.getFullYear();

        const diaAtual = hoje.getDate();

        const dadosUso = await fetch(`/servidores/uso?empresa=${sessionStorage.NOME_EMPRESA}&servidor=${localStorage.NOME_SERVIDOR}&tipo=${periodo.toLowerCase()}&ano=${anoAtual}&mes=${mesAtual}&componente=${componente}`)
            .then(r => r.json());

        let mediaUso;
        let listaPeriodos;

        if (!dadosUso || (!dadosUso.mediasDiarias && !dadosUso.mediasMensais)) {
            alert(`O servidor ${localStorage.NOME_SERVIDOR} ainda não possui registros de uso para esse período.`);

            mediaUso = 0;

            if (periodo === "Anual") {
                listaPeriodos = [];
                for (let i = 1; i <= mesAtual; i++) {
                    listaPeriodos.push({ mes: i, media: 0 });
                }
            } else {
                listaPeriodos = [];
                for (let i = 1; i <= diaAtual; i++) {
                    listaPeriodos.push({
                        dia: `${anoAtual}-${mesAtual}-${String(i).padStart(2, '0')}`,
                        media: 0
                    });
                }
            }
        } else {
            mediaUso = periodo === "Anual" ? dadosUso.mediaAnual : dadosUso.mediaMensal;
            listaPeriodos = periodo === "Anual" ? dadosUso.mediasMensais : dadosUso.mediasDiarias;
        }


        let corUsoMedio = "green";

        if (!isNaN(mediaUso)) {

            for (let i = gravidades.length - 1; i >= 0; i--) {
                if (gravidades[i].valor <= mediaUso) {
                    if (gravidades[i].nome_gravidade === "Baixo") corUsoMedio = "yellow";
                    else if (gravidades[i].nome_gravidade === "Alto") corUsoMedio = "red";
                    else corUsoMedio = "orange";
                    break;
                }
            }
        }

        corGrafico = 'rgba(147, 112, 219, 0.8)'
        corGraficoTransparente = 'rgba(147, 112, 219, 0.2)'

        if (nomeComponente == 'Cpu') {
            corGrafico = 'rgba(147, 112, 219, 0.8)'
            corGraficoTransparente = 'rgba(147, 112, 219, 0.2)'
        } else if (nomeComponente == 'Ram') {
            corGrafico = 'rgba(0, 191, 255, 0.8)'
            corGraficoTransparente = 'rgba(0, 191, 255, 0.2)'
        } else {
            corGrafico = 'rgba(255, 137, 176, 0.8)'
            corGraficoTransparente = 'rgba(255, 137, 176, 0.2)'
        }


        // --- Renderizar o HTML ---
        containerGeral.innerHTML = `
            <div class="container-KPIS">
            <div class="KPI">
                        <h2>Uso médio ${palavraAntesComponente} ${nomeComponente}</h2>
                        <h1 style="color: ${corUsoMedio};">${mediaUso.toFixed(2)}%</h1>
                        <h4>Parâmetro limite: ${gravidadeBaixo}%</h4>
                    </div>
                <div class="KPI">
                    <h2 class="arrumarLinha">Período em alerta <div class="info-icon teste2" data-tooltip="Segundo práticas comuns de SRE e monitoramento de capacidade, até 10% do tempo em alerta é considerado variação normal de carga.">
    <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" id="information-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary-upstroke" x1="12.05" y1="8" x2="11.95" y2="8" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary" x1="12" y1="13" x2="12" y2="16" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><path id="primary" d="M3,12a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9h0a9,9,0,0,1-9,9h0a9,9,0,0,1-9-9Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
  </div></h2>
                    <h1 style="color: ${corFrequencia};">${freq}%</h1>
                    <h4 style="color: ${diferenca_freq <= 0 ? "green" : "red"};">${textoDiferenca}</h4>
                </div>
                <div class="KPI">
                    <h2>Gravidade dos alertas</h2>
                    <canvas id="alertasComponenteChart" height="170px"></canvas>
                </div>
                <div class="KPI">
                    <h2 class="titulo-kpi arrumarLinha2">Ranking <div class="info-icon teste" data-tooltip="Os servidores classificados entre os três primeiros colocados no ranking de alertas recebem prioridade crítica devido à maior recorrência de eventos de saturação.">
    <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" id="information-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary-upstroke" x1="12.05" y1="8" x2="11.95" y2="8" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary" x1="12" y1="13" x2="12" y2="16" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><path id="primary" d="M3,12a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9h0a9,9,0,0,1-9,9h0a9,9,0,0,1-9-9Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
  </div></h2>
                    <h1 class="texto-grande" style="color: ${corPintar};">${posicao[0].posicao_ranking}º</h1>
                    <h4>Servidor com mais alertas de ${nomeComponente}</h4>
                </div>
            </div>

            <div class="container-KPIS-segunda-linha">
                <div class="GRAFICO-2">
                    <h2>Variação do uso</h2>
                    <canvas id="varicaoUso" width="1500" height="400"></canvas>
                </div>
                
            </div>
        `;

        let labelPeriodo = [];
        if (periodo === "Anual") {
            const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            for (let i = 0; i < listaPeriodos.length; i++) {
                const item = listaPeriodos[i];
                labelPeriodo.push(meses[item.mes - 1]);
            }
        } else {
            for (let i = 0; i < listaPeriodos.length; i++) {
                const item = listaPeriodos[i];

                const partes = item.dia.split('-');

                labelPeriodo.push(`${partes[2]}/${partes[1]}`);
            }
        }

        let valoresGrafico = [];
        for (let i = 0; i < listaPeriodos.length; i++) {
            valoresGrafico.push(listaPeriodos[i].media);
        }

        const ctx2 = document.getElementById("varicaoUso");

        meuChart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: labelPeriodo,
                datasets: [
                    {
                        label: nomeComponente,
                        data: valoresGrafico,
                        borderColor: corGrafico,
                        backgroundColor: corGraficoTransparente,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 2
                    },
                    {
                        label: '',
                        data: Array(labelPeriodo.length).fill(gravidadeBaixo),
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
            msg.style.fontSize = "30px";
            pai.appendChild(msg);
        } else {
            let dataAlertas = [];

            for (let i = 0; i < alertas.length; i++) {
                dataAlertas.push(alertas[i].total_alertas);
            }


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

        esconderLoader();

    } catch (erro) {
        esconderLoader();
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