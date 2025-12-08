let incidentes = null
let jira = null
let dados = {}
let servidores = []

let gravidadeSla = "Alto"

let servidorAtual = null
let gravidadeAtual = "alto"
let dataAtual = "dataAlto"
let slaAtual = null
let corAtual = ["rgba(255,0,0)", "rgba(255,0,0, 0.4)"]

let duracaoTotal = []
let listDate = []

// kpi de sla
let select = null
let kpi = null
let alerta_sla = null

const dt = new Date();

// mudar nome da variável para não conflitar
let anoSelecionado = dt.getFullYear();
let mesSelecionado = null
let selectServidor = null

let graficoSla = null;
let grafioTicket = null;

// Adicionar código para definir ano atual no select
window.onload = function() {
    const anoAtual = new Date().getFullYear();
    const selectAnoElement = document.getElementById("ano_periodo");
    
    selectAnoElement.value = anoAtual;
    
    let existeOpcao = false;
    for (let i = 0; i < selectAnoElement.options.length; i++) {
        if (selectAnoElement.options[i].value == anoAtual) {
            existeOpcao = true;
            selectAnoElement.value = anoAtual;
            break;
        }
    }
    
    if (!existeOpcao) {
        const option = document.createElement("option");
        option.value = anoAtual;
        option.text = anoAtual;
        selectAnoElement.add(option);
        selectAnoElement.value = anoAtual;
    }
}

function esconderLoader() {
    document.getElementById("loader").style.display = "none";
}


async function dashAdmin() {
    console.log("Carregando gráficos...")

    select = document.getElementById("alerta-sla")
    kpi = document.getElementById("kpi_sla")
    alerta_sla = select.value

    // usar variáveis diferentes para elementos DOM e valores
    const selectAnoElement = document.getElementById("ano_periodo")
    const selectMesElement = document.getElementById("mes_periodo")
    
    // Pegar os valores dos selects
    anoSelecionado = selectAnoElement.value
    mesSelecionado = selectMesElement.value
    
    selectServidor = document.getElementById("muda-servidor")

    // reseta os dados
    incidentes = []
    dados = {}
    servidores = []
    listDate = []
    selectServidor.innerHTML = ''

    try {
        [incidentes, jira] = await Promise.all([
            fetch('/servidores/listarIncidentes', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    idempresa: sessionStorage.ID_EMPRESA,
                    ano: anoSelecionado, 
                    mes: mesSelecionado 
                })
            }).then(res => res.json()),

            fetch('/servidores/pegarDadosJira', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    empresa: sessionStorage.NOME_EMPRESA,
                    ano: anoSelecionado, 
                    mes: mesSelecionado   
                })
            }).then(res => res.json())
        ]) 

        // pegar dados do mes passado para comparacao
        /*
        let anoPassado = anoSelecionado
        let mesPassado = null
        if ((mesSelecionado - 1) == 0) {
            anoPassado = anoSelecionado - 1
            mesPassado = 12
        } else {
            mesPassado = mesSelecionado - 1
        }
        [incidentesMesPassado, jiraMesPassado] = await Promise.all([
            fetch('/servidores/listarIncidentes', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    idempresa: sessionStorage.ID_EMPRESA,
                    ano: anoPassado, 
                    mes: mesPassado
                })
            }).then(res => res.json()),

            fetch('/servidores/pegarDadosJira', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    empresa: sessionStorage.NOME_EMPRESA,
                    ano: anoPassado, 
                    mes: mesPassado 
                })
            }).then(res => res.json())
        ]) 
        console.log("INCIDENTES do mes passado: ", incidentesMesPassado)
        console.log("JIRA do mes passado: ", jiraMesPassado)
        */


        console.log("INCIDENTES: ", incidentes)
        console.log("JIRA: ", jira)
    } catch(err) {
        console.log("Erro ao carregar gráficos")
    }

    
    // agrupar dados dos incidentes
    for (let i = 0; i < incidentes.length; i++) {
        let incidente = incidentes[i] 
        let serv = incidente.servidor
        //console.log(serv)

        if (dados[serv] == undefined) {
            servidores.push(serv)
            dados[serv] = {
                alto: [],
                medio: [],
                baixo: [],
                slaAlto: null,
                slaMedio: null,
                slaBaixo: null,
                dataAlto: [],
                dataMedio: [],
                dataBaixo: []
            }
        } 

        let date = new Date(incidente.inicio)
        listDate.push(date)

        let dataIn = date.toLocaleDateString('en-GB')

        duracaoTotal.push(incidente.duracao)

        if (incidente.gravidade == "Alto") {
            dados[serv].alto.push(incidente.duracao)
            dados[serv].slaAlto = incidente.sla
            dados[serv].dataAlto.push(dataIn)

        } 
        if (incidente.gravidade == "Médio") {
            dados[serv].medio.push(incidente.duracao)
            dados[serv].slaMedio = incidente.sla
            dados[serv].dataMedio.push(dataIn)

        }
        if (incidente.gravidade == "Baixo") {
            dados[serv].baixo.push(incidente.duracao)
            dados[serv].slaBaixo = incidente.sla
            dados[serv].dataBaixo.push(dataIn)

        }    
    }


    // inicializa os valores atuais
    servidorAtual = Object.keys(dados)[0]
    dataAtual = "dataAlto"
    slaAtual =  "slaAlto"
    corAtual = ["rgba(255,0,0)", "rgba(255,0,0, 0.4)"]
    
    //console.log("dados tratados:",dados)
    //console.log("lista servidores:",servidores)


    // cria o select para cada servidor
    selectServidor.innerHTML = null
    for (let i = 0; i < servidores.length; i++) {
        selectServidor.innerHTML += `
          <option value="${servidores[i]}">${servidores[i]}</option>
        `
    }

    if (graficoSla != null && grafioTicket != null) {
        graficoSla.destroy()
        grafioTicket.destroy()
    }


    mudarCor()
    criarKpis()
    criarGraficoSla()
    criarGraficoTicket()

    esconderLoader()
}

function criarKpis() {
    const mtta = document.getElementById('mtta')
    const mttrGeral = document.getElementById('mttr-geral')
    const mtbf = document.getElementById('mtbf')

    // mttr geral
    //console.log("diracao total: ", duracaoTotal)
    let totalMttrGeral = 0
    for (let i = 0; i < duracaoTotal.length; i++) {
        totalMttrGeral += duracaoTotal[i]
    }
    //  verificar se há dados antes de calcular
    if (duracaoTotal.length > 0) {
        mttrGeral.innerText = `${Math.round(totalMttrGeral/duracaoTotal.length)} min.`
    } else {
        mttrGeral.innerText = "0 min."
    }

    // mtbf
    let diff = []
    let totalMtbf = 0
    for (let i = 0; i < listDate.length; i++) {
        if (i > 0) {
            diff.push(listDate[i].getTime() - listDate[i-1].getTime())
            totalMtbf += (listDate[i].getTime() - listDate[i-1].getTime())
        }
    }
    //  verificar se há diferenças antes de calcular
    if (diff.length > 0) {
        let mediaMtbf = totalMtbf/diff.length
        let minMtbf = Math.round((mediaMtbf)/(1000 * 60))
        mtbf.innerText = `${minMtbf} min.`
    } else {
        mtbf.innerText = "0 min."
    }
}

function criarGraficoSla() {
    const tempoSla = document.getElementById("tempoSla");

    //console.log("dataAtual: ",dataAtual)
    //console.log("estou no criar grafio: ", dados[servidorAtual].dataAlto)
    //console.log("gravidadeSla: ",gravidadeSla)
    //console.log("servidorAtual: ",servidorAtual)
    //console.log("gravidadeAtual: ",gravidadeAtual)
    //console.log("corAtual: ",corAtual)

    if (!servidorAtual || !dados[servidorAtual] || dados[servidorAtual][dataAtual].length === 0) {
        // Opcional: mostrar mensagem de nenhum dado
        return;
    }

    graficoSla = new Chart(tempoSla,
        {
            type: 'line',
            data: {
                labels: dados[servidorAtual][dataAtual], 
                datasets: [
                    {
                        label: gravidadeSla,
                        data: dados[servidorAtual][gravidadeAtual],
                        borderColor: corAtual[0],
                        backgroundColor: corAtual[1],
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 2
                    },
                    {
                        label: 'limite SLA',
                        data: Array(dados[servidorAtual][dataAtual].length).fill(dados[servidorAtual][slaAtual]),
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167,139,250,0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        datalabels: { display: false }
                    }
                ]
            },
            options: {

                        plugins: {
                            datalabels: {
                                    color: '#fff',
                            },
                            legend: {
                                labels: {
                                    color: '#fff',
                                }
                            }
                        },
                   
                color: 'white',
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Incidentes',
                            color: 'white',
                            font: {
                                size: 20
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: 'white' // Set the tick label color to red
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo Resolução',
                            color: 'white',
                            font: {
                                size: 20
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: 'white' // Set the tick label color to red
                        }
                    }
                }
            },
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        })
}

function criarGraficoTicket() {
    console.log("Jira dentro da func ticket: ", jira)

    const kpi_mtta = document.getElementById("mtta")
    let nomes = []
    let tickets = []
    let listaTtas = []
    
    // verificar se jira existe e tem dados
    if (jira && jira.length > 0) {
        for (let i = 0;i < jira.length; i++) {
            let membroSup = jira[i]

            if (nomes.includes(membroSup.nome)) {
                tickets[nomes.indexOf(membroSup.nome)] += membroSup.qtdTickets
            } else {
                nomes.push(membroSup.nome)
                tickets.push(membroSup.qtdTickets)
            }

            //  verificar se datasMtta existe
            if (membroSup.datasMtta) {
                for (let j = 0;j < membroSup.datasMtta.length; j++) {
                    let tta = membroSup.datasMtta[j].timeToAcknowledgeMilis
                    listaTtas.push(tta)
                }
            }
        }
    }
    console.log("nomes: ",nomes)
    console.log("tickets: ",tickets)
    console.log("listaTtas: ",listaTtas)

    // cria kpi de mtta
    let totalMtta = 0
    for (let i = 0; i < listaTtas.length; i++) {
        totalMtta += listaTtas[i]
    }
    //  verificar se há dados antes de calcular
    if (listaTtas.length > 0) {
        let mtta = totalMtta/listaTtas.length
        kpi_mtta.innerText = `${Math.round(mtta/(1000 * 60))} min.`
    } else {
        kpi_mtta.innerText = "0 min."
    }

    const ticketsSup = document.getElementById("ticketsSup");
    //  verificar se há dados antes de criar gráfico
    if (nomes.length > 0) {
        grafioTicket = new Chart(ticketsSup,
            {
                type: 'bar',
                data: {
                    labels: nomes,
                    datasets: [
                        {
                          label: 'Tickets Resolvidos',
                          data: tickets,
                          borderColor: 'blue',
                          backgroundColor: 'rgba(0, 0,250,0.8)',
                          tension: 0.3,
                          fill: true,
                          pointRadius: 4,
                         borderWidth: 2
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    color: 'white',
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Tickets',
                                color: 'white',
                                font: {
                                    size: 20
                                }
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: {
                                color: 'white' // Set the tick label color to red
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Membro do Suporte',
                                color: 'white',
                                font: {
                                    size: 20
                                }
                            },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: {
                                color: 'white' // Set the tick label color to red
                            }
                        }
                    }
                },
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            })
    }
}

function mudarCor() {
    const kpi_sla = document.getElementById('kpi_sla')
    const kpi_sla_porcentagem = document.getElementById('kpi_sla_porcentagem')
    const kpi_sla_mttr = document.getElementById('kpi_sla_mttr')

    select = document.getElementById("alerta-sla")
    kpi = document.getElementById("kpi_sla")
    alerta_sla = select.value

    if (alerta_sla == "alto") {
        kpi.style.borderColor = "red"
    } else if (alerta_sla == "medio") {
        kpi.style.borderColor = "orange"
    } else {
        kpi.style.borderColor = "yellow"
    }

    console.log(dados)
    console.log(servidores)
    
    let totalDentroSla = 0
    let totalMttr = 0
    let length = 0
    for (let i = 0; i < servidores.length; i++) {
        for (let j = 0; j < dados[servidores[i]][alerta_sla].length; j++) {
            totalMttr += dados[servidores[i]][alerta_sla][j]
            length++
            if (alerta_sla == "alto") {
                //  verificar se slaAlto existe
                if (dados[servidores[i]].slaAlto && dados[servidores[i]][alerta_sla][j] < dados[servidores[i]].slaAlto) {
                    totalDentroSla++
                }
            } else if (alerta_sla == "medio") {
                //  verificar se slaMedio existe
                if (dados[servidores[i]].slaMedio && dados[servidores[i]][alerta_sla][j] < dados[servidores[i]].slaMedio) {
                    totalDentroSla++
                }
            } else if (alerta_sla == "baixo") {
                // verificar se slaBaixo existe
                if (dados[servidores[i]].slaBaixo && dados[servidores[i]][alerta_sla][j] < dados[servidores[i]].slaBaixo) {
                    totalDentroSla++
                }
            }
        }
    }
    //  verificar se length > 0 antes de calcular
    if (length > 0) {
        kpi_sla_porcentagem.innerText = `${((totalDentroSla/length) * 100).toFixed(2)}%`
        kpi_sla_mttr.innerText = `MTTR: ${Math.round(totalMttr/length)} min.`
    } else {
        kpi_sla_porcentagem.innerText = "0%"
        kpi_sla_mttr.innerText = `MTTR: 0 min.`
    }
}

function mudarAlerta() {
    if (gravidadeSla == "Alto") {
        gravidadeSla = "Médio"
    } else if (gravidadeSla == "Médio") {
        gravidadeSla = "Baixo"
    } else if (gravidadeSla == "Baixo") {
        gravidadeSla = "Alto"
    }

    let botao = document.getElementById('muda-alerta')
    botao.innerText = gravidadeSla

    atualizaGraficoSla()
}

function mudarServidor() {
    servidorAtual = document.getElementById('muda-servidor').value
    atualizaGraficoSla()
}

function destruirGraficos() {
    //  verificar se gráficos existem antes de destruir
    if (graficoSla != null) {
        graficoSla.destroy()
        graficoSla = null
    }
    if (grafioTicket != null) {
        grafioTicket.destroy()
        grafioTicket = null
    }
}

function atualizaGraficoSla() {
    // inves de destruir e criar denovo, atualizar toda vez que algum elemento for alterado,
    // como o servidor selecionado, gravidade alterada
    // Assuming 'myChart' is your Chart.js instance

    // toda essa parte das variaveisAtual vai para o atualizaGraficoSla,
    // e aqui só comeca pre-selecionado no Alto do primeiro servidor

    // verificar se gráfico existe antes de atualizar
    if (!graficoSla || !servidorAtual || !dados[servidorAtual]) {
        return
    }

    if (gravidadeSla == "Alto") {
        gravidadeAtual = "alto"
        dataAtual = "dataAlto"
        slaAtual = "slaAlto"
        corAtual = ["rgba(255,0,0)", "rgba(255,0,0, 0.4)"]

    } else if (gravidadeSla == "Médio") {
        gravidadeAtual = "medio"
        dataAtual = "dataMedio"
        slaAtual = "slaMedio"
        corAtual = ["rgba(255,150,0)", "rgba(255,150,0, 0.4)"]

    } else if (gravidadeSla == "Baixo") {
        gravidadeAtual = "baixo"
        dataAtual = "dataBaixo"
        slaAtual = "slaBaixo"
        corAtual = ["rgba(255,255,0)", "rgba(255,255,0, 0.4)"]

    }
    
    // verificar se dados existem antes de atualizar
    if (dados[servidorAtual][dataAtual] && dados[servidorAtual][dataAtual].length > 0) {
        graficoSla.data.labels = dados[servidorAtual][dataAtual]
        graficoSla.data.datasets[0].label = gravidadeSla
        graficoSla.data.datasets[0].data = dados[servidorAtual][gravidadeAtual]
        graficoSla.data.datasets[0].borderColor = corAtual[0]
        graficoSla.data.datasets[0].backgroundColor = corAtual[1]
        graficoSla.data.datasets[1].data = Array(dados[servidorAtual][dataAtual].length).fill(dados[servidorAtual][slaAtual])
        graficoSla.update()
    }
}
