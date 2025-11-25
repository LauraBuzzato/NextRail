let incidentes = null
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

let graficoSla = null;
let grafioTicket = null;

async function dashAdmin() {
    console.log("Carregando gráficos...")

    try {
        [incidentes] = await Promise.all([
            fetch('/servidores/listarIncidentes', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json())
        ]) 
        console.log(incidentes)

    } catch(err) {
        console.log("Erro ao carregar gráficos")
    }
    
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
    const selectServidor = document.getElementById("muda-servidor")
    selectServidor.innerHTML = null
    for (let i = 0; i < servidores.length; i++) {
        selectServidor.innerHTML += `
          <option value="${servidores[i]}">${servidores[i]}</option>
        `
    }



    if (typeof Chart === 'undefined') {
        console.log("erro ao carregar grafico")
        setTimeout(dashAdmin(), 500)
        return
    }

    criarKpis()
    criarGraficoSla()
    criarGraficoTicket()
}

function criarKpis() {
    const mtta = document.getElementById('mtta')
    const mttrGeral = document.getElementById('mttr-geral')
    const mtbf = document.getElementById('mtbf')

    // mttr geral
    //console.log("diracao total: ", duracaoTotal)
    let total = 0
    for (let i = 0; i < duracaoTotal.length; i++) {
        total += duracaoTotal[i]
    }
    mttrGeral.innerText = `${Math.round(total/duracaoTotal.length)} min.`

    // mtbf
    console.log("listDate: ",listDate)
    let diff = []
    for (let i = 0; i < listDate.length; i++) {
        if (i > 0) {
            diff.push(listDate[i-1].getTime() - listDate[i].getTime())
        }
    }
    console.log('diff: ',diff)

}

function criarGraficoSla() {
    const tempoSla = document.getElementById("tempoSla");

    //console.log("dataAtual: ",dataAtual)
    //console.log("estou no criar grafio: ", dados[servidorAtual].dataAlto)
    //console.log("gravidadeSla: ",gravidadeSla)
    //console.log("servidorAtual: ",servidorAtual)
    //console.log("gravidadeAtual: ",gravidadeAtual)
    //console.log("corAtual: ",corAtual)

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
                        data: Array(13).fill(dados[servidorAtual][slaAtual]),
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
                        grid: { color: 'rgba(255,255,255,0.1)' }
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
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            },
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        })
}

function criarGraficoTicket() {
    const ticketsSup = document.getElementById("ticketsSup");
    grafioTicket = new Chart(ticketsSup,
        {
            type: 'bar',
            data: {
                labels: ['João', 'Pedro', 'Matheus', 'Garbiel'],
                datasets: [
                    {
                        label: 'Tickets Atribuidos',
                        data: [4, 3, 2, 1],
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0,250,0.8)',
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 2
                    },
                    {
                      label: 'Tickets Resolvidos',
                      data: [4, 3, 1 ,2],
                      borderColor: 'green',
                      backgroundColor: 'rgba(0, 250, 0,0.8)',
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
                        grid: { color: 'rgba(255,255,255,0.1)' }
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
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            },
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        })
}

function mudarCor() {
  let select = document.getElementById("alerta-sla")
  let kpi = document.getElementById("kpi_sla")
  let alerta = select.value

  if (alerta == "alto") {
    kpi.style.borderColor = "red"
  } else if (alerta == "medio") {
    kpi.style.borderColor = "orange"
  } else {
    kpi.style.borderColor = "yellow"
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
    graficoSla.destroy()
    grafioTicket.destroy()
}

function atualizaGraficoSla() {
    // inves de destruir e criar denovo, atualizar toda vez que algum elemento for alterado,
    // como o servidor selecionado, gravidade alterada
    // Assuming 'myChart' is your Chart.js instance

    // toda essa parte das variaveisAtual vai para o atualizaGraficoSla,
    // e aqui só comeca pre-selecionado no Alto do primeiro servidor

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
    
    graficoSla.data.labels = dados[servidorAtual][dataAtual]
    graficoSla.data.datasets[0].label = gravidadeSla
    graficoSla.data.datasets[0].data = dados[servidorAtual][gravidadeAtual]
    graficoSla.data.datasets[0].borderColor = corAtual[0]
    graficoSla.data.datasets[0].backgroundColor = corAtual[1]
    graficoSla.data.datasets[1].data = Array(dados[servidorAtual][dataAtual].length).fill(dados[servidorAtual][slaAtual])
    graficoSla.update()
}
