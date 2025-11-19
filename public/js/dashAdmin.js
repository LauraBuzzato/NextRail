let data = {
    Alto: {
        labels: ['21/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
        dados: [0.8, 0.7, 0.9, 1.2, 0.8, 0.8, 0.7, 0.8, 0.8, 0.9],
        cores: ['rgba(255,0,0)', 'rgba(255,0,0,0.4)'],
        sla: 1.0
    },
    Médio: {
        labels: ['21/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
        dados: [1.3, 1.5, 1.4, 1.7, 2.1, 1.9, 1.7, 1.5, 1.8, 1.9],
        cores: ['rgba(255,150,0)', 'rgba(255,150,0,0.4)'],
        sla: 2.0
    },
    Baixo: {
        labels: ['21/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
        dados: [2.3, 2.5, 2.4, 2.5, 2.1, 2.7, 2.7, 2.5, 2.8, 2.6],
        cores: ['rgba(255,255,0)', 'rgba(255,255,0,0.4)'],
        sla: 3.0
    }
}

let atual = "Alto"

let graficoSla = null;
let grafioTicket = null;

function dashAdmin() {
    console.log("Carregando gráficos...")

    if (typeof Chart === 'undefined') {
        console.log("erro ao cerregar grafico")
        setTimeout(dashAdmin(), 500)
        return
    }


    criarGraficoSla()
    criarGraficoTicket()
    try {
        //const [alertas] = await Promise.all([
        //    fetch('/servidores/listarAlertas', {
        //        method: "POST",
        //        headers: { "Content-Type": "application/json" },
        //        body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
        //    }).then(res => res.json())
        //]) 
        //console.log(alertas)

    } catch(err) {
        console.log("Erro ao carregar gráficos")
    }
}


function criarGraficoSla() {
    const tempoSla = document.getElementById("tempoSla");

    graficoSla = new Chart(tempoSla,
        {
            type: 'line',
            data: {
                labels: data[atual].labels, //LABELS
                datasets: [
                    {
                        label: atual,
                        data: data[atual].dados,
                        borderColor: data[atual].cores[0],
                        backgroundColor: data[atual].cores[1],
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        borderWidth: 2
                    },
                    {
                        label: 'limite SLA',
                        data: Array(13).fill(data[atual].sla),
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
    console.log(atual)
    if (atual == "Alto") {
        atual = "Médio"
    } else if (atual == "Médio") {
        atual = "Baixo"
    } else if (atual == "Baixo") {
        atual = "Alto"
    }
    destruirGraficos()
    criarGraficoSla()
    criarGraficoTicket()
}

function destruirGraficos() {
    graficoSla.destroy()
    grafioTicket.destroy()
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
