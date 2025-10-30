function carregarCSS(caminho) {
  const cssAntigo = document.getElementById('css-dashboard');
  if (cssAntigo) {
    cssAntigo.remove();
  }

  // Adicionar novo CSS
  const link = document.createElement('link');
  link.id = 'css-dashboard';
  link.rel = 'stylesheet';
  link.href = caminho;
  document.head.appendChild(link);
}

function desabilitarCSSPrincipal() {
  const csSTYLE = document.getElementById('css-STYLE');
  if (csSTYLE) {
    csSTYLE.disabled = true;
  }
}

function habilitarCSSPrincipal() {
  const csSTYLE = document.getElementById('css-STYLE');
  if (csSTYLE) {
    csSTYLE.disabled = false;
  }
}

function inicializarDashboard() {
  validarSessao();
  arrumarMenu();

  setTimeout(() => {
    if (!verificarDependencias()) {
      console.log('Aguardando Chart.js...');
      setTimeout(() => {
        const cargo = analisaCargo();
        atualizar(cargo);
      }, 1000);
      return;
    }

    const cargo = analisaCargo();
    atualizar(cargo);
  }, 300);
}

function inicializarGraficosSuporte() {
  setTimeout(() => {
    if (typeof dash_suporte === 'function') {
      console.log('Inicializando gráficos do suporte...');
      try {
        dash_suporte();
      } catch (error) {
        console.error('Erro ao inicializar gráficos do suporte:', error);
      }
    } else {
      console.error('dash_suporte não disponível');
      setTimeout(() => {
        if (typeof dash_suporte === 'function') {
          try {
            dash_suporte();
          } catch (error) {
            console.error('Erro na segunda tentativa do suporte:', error);
          }
        }
      }, 1000);
    }
  }, 500);
}

function inicializarGraficosAnalista() {
  setTimeout(() => {
    if (typeof dash_analista === 'function') {
      console.log('Inicializando gráficos do analista...');
      try {
        dash_analista();
      } catch (error) {
        console.error('Erro ao inicializar gráficos do analista:', error);
        console.error('Detalhes do erro:', error.message);
      }
    } else {
      console.error('dash_analista não disponível');
      setTimeout(() => {
        if (typeof dash_analista === 'function') {
          try {
            dash_analista();
          } catch (error) {
            console.error('Erro na segunda tentativa do analista:', error);
          }
        }
      }, 1000);
    }
  }, 500);
}

function verificarDependencias() {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js não carregado!');
    return false;
  }

  console.log('Chart.js carregado');
  return true;
}

async function atualizar(a) {
  const dash_analista = document.getElementById("div_analista");
  const dash_suporte = document.getElementById("div_suporte");

  // Limpar conteúdos anteriores
  dash_analista.innerHTML = '';
  dash_suporte.innerHTML = '';

  if (a === true) { // SUPORTE TÉCNICO
    // Desabilitar CSS principal
    desabilitarCSSPrincipal();

    // Inserir HTML do suporte
    dash_suporte.innerHTML = `
    <div class="container-pagina">
      <h1 class="bem-vindo">Bem-vindo(a) <span>${sessionStorage.NOME_USUARIO}</span></h1>
      <h2 class="desempenho" id="subtitulo-destaque">${localStorage.NOME_SERVIDOR}</h2>
      <section class="conteudo-principal">
        <div class="kpi-container">
          <div class="kpi-1">
            <div class="kpi-titulo">Uso de memória RAM atual</div>
            <div class="kpi-conteudo"><span style="color: rgba(255, 0, 0, 1);">90%</span></div>
            <div class="kpi-passado">Leitura anterior: 78%</div>
          </div>
          <div class="kpi-2">
            <div class="kpi-titulo">Uso de CPU atual</div>
            <div class="kpi-conteudo"><span style="color: yellow;">74%</span></div>
            <div class="kpi-passado">Leitura anterior: 88%</div>
          </div>
          <div class="kpi-3">
            <div class="kpi-titulo">Uso de DISCO atual</div>
            <div class="kpi-conteudo"><span style="color: rgb(24, 216, 24);">53%</span></div>
            <div class="kpi-passado">Leitura anterior: 48%</div>
          </div>
        </div>

          <div class="graficos-container">
            <div class="grafico-box">
              <div class="grafico-header">
              <button id="btnPrev" class="grafico-btn btn-esquerda"><svg fill="#000000" width="50px" height="30px" viewBox="0 0 24 24"
     id="left-circle" data-name="Flat Color"
     xmlns="http://www.w3.org/2000/svg"
     class="icon flat-color">
  <g id="SVGRepo_iconCarrier">
    <circle id="primary" cx="12" cy="12" r="10"></circle>
    <path id="secondary"
          d="M13,16a1,1,0,0,1-.71-.29l-3-3a1,1,0,0,1,0-1.42l3-3a1,1,0,0,1,1.42,1.42L11.41,12l2.3,2.29a1,1,0,0,1,0,1.42A1,1,0,0,1,13,16Z">
    </path>
  </g>
</svg></button>
              <h3 class="grafico-titulo">Uso dos componentes nas últimas 24 horas</h3>
              <button id="btnNext" class="grafico-btn btn-direita"><svg fill="#000000" width="50px" height="30px" viewBox="0 0 24 24"
     id="right-circle" data-name="Flat Color"
     xmlns="http://www.w3.org/2000/svg"
     class="icon flat-color">
  <g id="SVGRepo_iconCarrier">
    <circle id="primary" cx="12" cy="12" r="10"></circle>
    <path id="secondary"
          d="M11,16a1,1,0,0,1-.71-.29,1,1,0,0,1,0-1.42L12.59,12l-2.3-2.29a1,1,0,0,1,1.42-1.42l3,3a1,1,0,0,1,0,1.42l-3,3A1,1,0,0,1,11,16Z">
    </path>
  </g>
</svg></button>
            </div>
            <canvas id="graficoSuporte"></canvas>
              </div>

          <div class="container-tabela-dinamica">
            <div class="tabela-titulo">Histórico de alertas da última semana</div>
            <div id="tabela-conteudo" class="tabela-conteudo"></div>
          </div>
        </div>
      </section>
    </div>`;

    dash_suporte.style.display = "block";
    dash_analista.style.display = "none";

    carregarCSS('./css/styleSuporte.css');

    setTimeout(() => {
      inicializarGraficosSuporte();
      criarTabela()

      setTimeout(() => {
        configurarCarrosselSuporte();
      }, 300);
    }, 200);

  } else { // ANALISTA DE INFRAESTRUTURA
    // ... (o resto do código do analista permanece igual)
    // IMPORTANTE: Primeiro habilitar o CSS principal
    habilitarCSSPrincipal();

    dash_analista.innerHTML = `
      <div class="dashboard-grid">
      <h1 class="bem-vindo">Bem-vindo(a) ${sessionStorage.NOME_USUARIO}</span></h1>

    <h2 class="desempenho">Alertas do ${localStorage.NOME_SERVIDOR}</h2>
    <!-- KPIs -->
    <section class="kpis">

      <div class="kpi-box">
        <span class="kpi-title">Quantidade total de Alertas do Mês</span>
        <h2 class="kpi-value">25</h2>
      </div>

      <div class="kpi-box">
        <span class="kpi-title">Componente Mais Impactado do Mês</span>
        <h2 class="kpi-value">RAM</h2>
      </div>

      <div class="kpi-box">
        <span class="kpi-title">MTTR (Tempo Médio de Reparo) do Mês</span>
        <h2 class="kpi-value">20 min</h2>
      </div>

      <div class="kpi-box">
        <span class="kpi-title">Gravidade mais frequente do Mês</span>
        <h2 class="kpi-value">Média</h2>
      </div>
    </section>
    
    <section class="analise-direita">

      <div class="grafico-box">
        <h3 class="grafico-titulo">Alertas divididos por Gravidade deste Mês</h3>
        <canvas id="alertasServidorChart"></canvas>
      </div>

      
      <div class="grafico-box">
        <h3 class="grafico-titulo">Alertas por Componente deste Mês  </h3>
        <canvas id="alertasComponenteChart"></canvas>
      </div>


    </section>
    
    <section class="tendencia-semanal">
      <div class="grafico-box-grande">
        <h3 class="grafico-titulo">Frequência Mensal de Alertas</h3>
        <canvas id="frequenciaSemanalChart"></canvas>
      </div>
    </section>
    
    `;

    dash_analista.style.display = "block";
    dash_suporte.style.display = "none";

    setTimeout(() => {
      carregarCSS('./css/styleAnalista.css');
    }, 100);


    setTimeout(() => {
      inicializarGraficosAnalista();
    }, 300);
  }
}

function arrumarMenu() {
  if (sessionStorage.CARGO_USUARIO == "Analista de infraestrutura") {
    DIVmenu.innerHTML = `<ul class="link-items">
      <div class="logo-container">
        <img src="./assets/icon/logo-SFroxo.png" alt="Logo NextRail" class="logo-menu">
      </div>
      <li class="link-item active" id="dashboard">
        <a href="selecionarServidor.html" class="link">
          <ion-icon name="grid-outline"></ion-icon>
          <span style="--i: 1">Dashboards</span>
        </a>
      </li>
      <li class="link-item" id="relatorios">
        <a href="relatoriosDash.html" class="link">
          <ion-icon name="stats-chart-outline"></ion-icon>
          <span style="--i: 2">Relatórios</span>
        </a>
      </li>
      <li class="link-item">
        <a onclick="limparSessao()" class="link">
          <ion-icon name="log-out-outline"></ion-icon>
          <span style="--i: 4">Sair</span>
        </a>
      </li>
    </ul>`;
  } else {
    DIVmenu.innerHTML = `<ul class="link-items">
      <div class="logo-container">
        <img src="./assets/icon/logo-SFroxo.png" alt="Logo NextRail" class="logo-menu">
      </div>
      <li class="link-item active" id="dashboard">
        <a href="selecionarServidor.html" class="link">
          <ion-icon name="grid-outline"></ion-icon>
          <span style="--i: 1">Dashboards</span>
        </a>
      </li>
      <li class="link-item" id="cadastroServer">
        <a href="cadastroServidor.html" class="link">
          <ion-icon name="construct"></ion-icon>
          <span style="--i: 3">Cadastrar Servidor</span>
        </a>
      </li>
      <li class="link-item" id="configuracoes">
        <a href="configAlerta.html" class="link">
          <ion-icon name="settings-outline"></ion-icon>
          <span style="--i: 3">Parâmetros</span>
        </a>
      </li>
      <li class="link-item">
        <a onclick="limparSessao()" class="link">
          <ion-icon name="log-out-outline"></ion-icon>
          <span style="--i: 4">Sair</span>
        </a>
      </li>
    </ul>`;
  }
}

function analisaCargo() {
  var cargo = sessionStorage.CARGO_USUARIO;
  var mudanca;

  if (cargo == "Analista de infraestrutura") {
    mudanca = false;
  } else if (cargo == "Suporte técnico") {
    mudanca = true;
  } else {
    mudanca = false;
  }

  return mudanca;
}



function configurarCarrosselSuporte() {
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');

  if (!btnNext || !btnPrev) {
    console.error('Botões do carrossel não encontrados. Tentando novamente em 100ms...');

    return;
  }

  const newBtnNext = btnNext.cloneNode(true);
  const newBtnPrev = btnPrev.cloneNode(true);

  btnNext.parentNode.replaceChild(newBtnNext, btnNext);
  btnPrev.parentNode.replaceChild(newBtnPrev, btnPrev);

  newBtnNext.addEventListener('click', () => {
    indiceAtual = (indiceAtual + 1) % 4;
    atualizarVisibilidadeSuporte();
  });

  newBtnPrev.addEventListener('click', () => {
    indiceAtual = (indiceAtual - 1 + 4) % 4;
    atualizarVisibilidadeSuporte();
  });

  console.log('Carrossel do suporte configurado com sucesso');
}

function atualizarVisibilidadeSuporte() {
  if (!graficoSuporte) {
    console.error('Gráfico do suporte não inicializado');
    return;
  }

  const datasets = graficoSuporte.data.datasets;
  const legendas = ['Todos os Componentes', 'CPU', 'RAM', 'Disco'];

  const tituloGrafico = document.querySelector('.grafico-box h3');
  if (tituloGrafico) {
    tituloGrafico.textContent = `Uso de ${legendas[indiceAtual]} nas últimas 24 horas`;
  }

  // Controlar visibilidade dos datasets
  switch (indiceAtual) {
    case 0: // Todos
      datasets[0].hidden = false;
      datasets[1].hidden = false;
      datasets[2].hidden = false;
      datasets[3].hidden = true;
      break;
    case 1: // CPU
      datasets[0].hidden = false;
      datasets[1].hidden = true;
      datasets[2].hidden = true;
      datasets[3].hidden = false;
      datasets[3].data = Array(13).fill(70)
      break;
    case 2: // RAM
      datasets[0].hidden = true;
      datasets[1].hidden = false;
      datasets[2].hidden = true;
      datasets[3].hidden = false;
      datasets[3].data = Array(13).fill(60)
      break;
    case 3: // Disco
      datasets[0].hidden = true;
      datasets[1].hidden = true;
      datasets[2].hidden = false;
      datasets[3].hidden = false;
      datasets[3].data = Array(13).fill(65)
      break;
  }

  graficoSuporte.update();
}