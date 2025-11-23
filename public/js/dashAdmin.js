//let data = {
//    servidor1: {
//        Alto: {
//            labels: ['22/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
//            dados: [0.8, 0.7, 0.9, 1.2, 0.8, 0.8, 0.7, 0.8, 0.8, 0.9],
//            cores: ['rgba(256,0,0)', 'rgba(255,0,0,0.4)'],
//            sla: 1.0
//        },
//        Médio: {
//            labels: ['22/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
//            dados: [1.9, 1.5, 1.6, 1.7, 2.1, 1.9, 1.7, 1.5, 1.8, 1.9],
//            cores: ['rgba(256,150,0)', 'rgba(255,150,0,0.4)'],
//            sla: 2.0
//        },
//        Baixo: {
//            labels: ['22/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
//            dados: [2.8, 2.5, 2.4, 2.5, 2.1, 2.7, 2.7, 2.5, 2.8, 2.6],
//            cores: ['rgba(256,255,0)', 'rgba(255,255,0,0.4)'],
//            sla: 3.0
//        }
//    }
//}

let gravidadeSla = "Alto"
let servidorAtual = null
let incidentes = null

let dados = {}
let servidores = []

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
    
    //var dados = {
    //    "Servidor1": {
    //        alto: [],
    //        medio: [],
    //        baixo: [],
    //        slaAlto: null,
    //        slaMedio: null,
    //        slaBaixo: null
    //    },
    //    "Servidor2": {
    //        alto: [],
    //        medio: [],
    //        baixo: [],
    //        slaAlto: null,
    //        slaMedio: null,
    //        slaBaixo: null
    //    }
   // }
    for (let i = 0; i < incidentes.length; i++) {
        let incidente = incidentes[i] 
        let serv = incidente.servidor
        console.log(serv)

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

        let dataIn = new Date(incidente.inicio).toLocaleDateString('en-GB')

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
    // inicializa o servidor atual
    servidorAtual = Object.keys(dados)[0]
    
    console.log("dados tratados:",dados)
    console.log("lista servidores:",servidores)

    if (typeof Chart === 'undefined') {
        console.log("erro ao carregar grafico")
        setTimeout(dashAdmin(), 500)
        return
    }
    criarGraficoSla()
    criarGraficoTicket()
}


function criarGraficoSla() {
    const tempoSla = document.getElementById("tempoSla");
    const selectServidor = document.getElementById("muda-servidor")

    // toda essa parte das variaveisAtual vai para o atualizaGraficoSla,
    // e aqui só comeca pre-selecionado no Alto do primeiro servidor
    let gravidadeAtual = null
    let dataAtual = null
    let slaAtual = null
    let corAtual = null

    if (gravidadeSla == "Alto") {
        gravidadeAtual = "alto"
        dataAtual = "dataAlto"
        slaAtual = "slaAlto"
        corAtual = "rgba(255,0,0)"

    } else if (gravidadeSla == "Médio") {
        gravidadeAtual = "medio"
        dataAtual = "dataMedio"
        slaAtual = "slaMedio"
        corAtual = "rgba(255,150,0)"

    } else if (gravidadeSla == "Baixo") {
        gravidadeAtual = "baixo"
        dataAtual = "dataBaixo"
        slaAtual = "slaBaixo"
        corAtual = "rgba(255,255,0)"

    }

    selectServidor.innerHTML = null
    for (let i = 0; i < servidores.length; i++) {
        selectServidor.innerHTML += `
          <option value="${servidores[i]}">${servidores[i]}</option>
        `
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
                        borderColor: corAtual,
                        backgroundColor: corAtual,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 2
                    },
                    {
                        label: 'limite SLA',
                        data: Array(13).fill(slaAtual),
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
    console.log(gravidadeSla)
    if (gravidadeSla == "Alto") {
        gravidadeSla = "Médio"
    } else if (gravidadeSla == "Médio") {
        gravidadeSla = "Baixo"
    } else if (gravidadeSla == "Baixo") {
        gravidadeSla = "Alto"
    }

    let botao = document.getElementById('muda-alerta')
    botao.innerText = gravidadeSla

    destruirGraficos()
    criarGraficoSla()
    criarGraficoTicket()
}

function mudarServidor() {
    servidorAtual = document.getElementById('muda-servidor').value
}

function destruirGraficos() {
    graficoSla.destroy()
    grafioTicket.destroy()
}

function atualizaGraficoSla() {
    // inves de destruir e criar denovo, atualizar toda vez que algum elemento for alterado,
    // como o servidor selecionado, gravidade alterada
    // Assuming 'myChart' is your Chart.js instance
    //myChart.data.datasets[0].data[2] = 50; // Updates the third data point of the first dataset
    //myChart.data.labels[2] = 'New Label'; // Updates the third label
}
//{
//                label: 'Médio',
//                data: [],
//                borderColor: 'orange',
//                backgroundColor: 'rgba(255,150,0,0.2)',
//                tension: 0.3,
//                fill: true,
//                pointRadius: 4,
//                borderWidth: 2
//              },
//              {
//                label: 'Baixo',
//                data: [0,0,0,0,0,0,0,0,0,0],
//                borderColor: 'yellow',
//                backgroundColor: 'rgba(255,255,0,0.2)',
//                tension: 0.3,
//                fill: true,
//                pointRadius: 4,
//                borderWidth: 2
//              },
