const { options } = require("nodemon/lib/config");

async function dashAdmin() {
  console.log("Carregando gráficos...")

  if (typeof Chart === 'undefined') {
    console.log("erro ao cerregar grafico")
    setTimeout(dashAdmin(), 500)
    return
  }

  try {
    //const [alertas] = await Promise.all([
    //    fetch('/servidores/listarAlertas', {
    //        method: "POST",
    //        headers: { "Content-Type": "application/json" },
    //        body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
    //    }).then(res => res.json())
    //]) 
    //console.log(alertas)

    // grafico tempo resolucao x sla
    const tempoSla = document.getElementById("tempoSla");
    new Chart(tempoSla,
    {
      type: 'line',
      data: {
        labels: ['21/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10', '30/10'],
        datasets: [
          {
            label: 'Alto',
            data: [0, 0, 1, 4, 1, 0, 0, 0, 0, 0],
            borderColor: 'red',
            backgroundColor: 'rgba(255,0,0,0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            borderWidth: 2
          },
          {
            label: 'Médio',
            data: [0, 0, 0, 0, 0, 3, 0, 1, 0, 2],
            borderColor: 'yellow',
            backgroundColor: 'rgba(255,255,0,0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            borderWidth: 2
          },
          {
            label: 'Baixo',
            data: [0, 4, 0, 1, 0, 0, 0, 0, 2, 1],
            borderColor: 'green',
            backgroundColor: 'rgba(0,255,0,0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            borderWidth: 2
          },
          {
              label: 'limite SLA',
              data: Array(13).fill(3.5),
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

    // grafico ticketsSup
    const ticketsSup = document.getElementById("ticketsSup");
    new Chart(ticketsSup,
    {
      type: 'bar',
      data: {
        labels: ['João', 'Pedro', 'Matheus', 'Garbiel'],
        datasets: [
          {
            label: 'Tickets Atribuidos',
            data: [4, 3, 2, 1],
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0,250,0.4)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            borderWidth: 2
          },
          //{
          //  label: 'Tickets Resolvidos',
          //  data: [4, 3, 3 ,0],
          //  borderColor: 'green',
          //  backgroundColor: 'rgba(0, 250, 0,0.4)',
          //  tension: 0.3,
          //  fill: true,
          //  pointRadius: 4,
          //  borderWidth: 2
         // }
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
  } catch(err) {
    console.log("Erro ao carregar gráficos")
  }


}
