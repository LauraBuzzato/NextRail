function mostrarLoader() {
    document.getElementById("loader").style.display = "flex";
}

function esconderLoader() {
    document.getElementById("loader").style.display = "none";
}
async function carregarDados() {
    console.log("Iniciando carregamento de dados...");

    const servidor = localStorage.NOME_SERVIDOR;

    if (!servidor) {
      console.error("Nenhum servidor selecionado!");
      return;
    }

    const resposta = await fetch(`/api/processos?servidor=${servidor}`);
    const dados = await resposta.json();

    if (dados.erro) {
      console.error("Erro do servidor:", dados.erro);
      document.getElementById('mensagemQtdProcesso').innerText = dados.erro;
      return { labelsMemoria: [], memoriaMB: [], horarios: [], processos24h: [] };
    }

    console.log("Dados recebidos da API:", dados);
    return dados;
  }


  async function montarGraficos() {
    try {
      console.log('Iniciando carregamento de dados...');

      const dados = await carregarDados();

      console.log('Dados recebidos da API:', dados);

      if (dados.maximoProcessos !== undefined) {
        document.getElementById('maximoProcessos').textContent = dados.maximoProcessos;
      }
      if (dados.mediaProcessos !== undefined) {
        document.getElementById('mediaProcessos').textContent = dados.mediaProcessos;
      }
      if (dados.processoMaisFrequente) {
        document.getElementById('textoProcessoFrequente').textContent = dados.processoMaisFrequente;
      }

      if (!dados.labelsMemoria || dados.labelsMemoria.length === 0) {
        console.warn('Sem dados para gráficos');
        document.getElementById('mensagemQtdProcesso').innerText += ' (Sem dados)';
        return;
      }

      const ctx1 = document.getElementById('frequenciaProcessosChart');
      if (ctx1) {
        new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: dados.labelsMemoria,
            datasets: [{
              label: "MB de memória",
              data: dados.memoriaMB,
              backgroundColor: 'rgba(56,189,248,1)',
              borderColor: 'rgba(56,189,248,0)',
              borderWidth: 2,
              borderRadius: 8
            },


            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: '5 maiores Processos - Uso de Memória'
              }
            }
          }
        });
      }

      const ctx2 = document.getElementById('varicaoUso');
      if (ctx2 && dados.horarios && dados.horarios.length > 0) {
        new Chart(ctx2, {
          type: 'line',
          data: {
            labels: dados.horarios,
            datasets: [{
              label: 'Quantidade de processos',
              data: dados.processos24h,
              borderColor: '#a78bfa',
              backgroundColor: 'rgba(167,139,250,0.2)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              borderWidth: 2
            },
            {
              label: 'Media de processos',
              data: Array(dados.horarios.length).fill(dados.mediaProcessos),
              borderColor: '#c7c7b9',
              backgroundColor: '#bfbfb2',
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              pointRadius: 0,
              datalabels: { display: false }
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      console.log('Gráficos montados com sucesso!');

    } catch (error) {
      console.error('Erro ao montar gráficos:', error);
      document.getElementById('mensagemQtdProcesso').innerText = 'Erro ao carregar dados: ' + error.message;
    }

    esconderLoader()
  }

  montarGraficos();