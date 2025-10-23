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

  if (a == true) { // SUPORTE TÉCNICO
    // Desabilitar CSS principal para o suporte
    desabilitarCSSPrincipal();

    dash_suporte.innerHTML = `
      <div class="container-pagina">
        <h1 class="bem-vindo">Bem-vindo(a) <span>${sessionStorage.NOME_USUARIO}</span></h1>
        <h2 class="desempenho" id="subtitulo-destaque">Servidor-001</h2>
        <section class="conteudo-principal">
          <div class="kpi-container">
            <div class="kpi-1">
              <div class="kpi-titulo">Uso de memória RAM atual</div>
              <div class="kpi-conteudo">
                <span style="color: red;">82%</span>
              </div>
              <div class="kpi-passado">Última leitura: <br> 78%</div>
            </div>
            <div class="kpi-2">
              <div class="kpi-titulo">Uso de CPU atual</div>
              <div class="kpi-conteudo">
                <span style="color: yellow;">75%</span>
              </div>
              <div class="kpi-passado">Última leitura: <br> 88%</div>
            </div>
            <div class="kpi-3">
              <div class="kpi-titulo">Uso de DISCO atual</div>
              <div class="kpi-conteudo">
                <span style="color: green;">53%</span>
              </div>
              <div class="kpi-passado">Última leitura: <br> 48%</div>
            </div>
          </div>
          <div class="graficos-container">
            <div class="grafico-box">
              <h3>Uso de RAM nas últimas 24 horas</h3>
              <canvas id="graficoSuporteRAM"></canvas>
            </div>
            <div class="grafico-box">
              <h3>Uso de CPU nas últimas 24 horas</h3>
              <canvas id="graficoSuporteCPU"></canvas>
            </div>
            <div class="grafico-box">
              <h3>Uso de Disco nas últimas 24 horas</h3>
              <canvas id="graficoSuporteDisco"></canvas>
            </div>
          </div>
          <div class="container-tabela-dinamica">
            <div class="tabela-titulo">Histórico de alertas da última semana</div>
            <div class="tabela-labels">
              <span class="tabela-label">#</span>
              <span class="tabela-label">Componente</span>
              <span class="tabela-label">leitura</span>
              <span class="tabela-label">Grau</span>
              <span class="tabela-label">Timestamp</span>
            </div>
            <div id="tabela-conteudo" class="tabela-conteudo"></div>
        </div>
        </section>
      </div>`;

    dash_suporte.style.display = "block";
    dash_analista.style.display = "none";

    // Carregar CSS específico do suporte
    carregarCSS('./css/styleSuporte.css');

    // Inicializar gráficos do suporte
    inicializarGraficosSuporte();

  } else { // ANALISTA DE INFRAESTRUTURA
    // IMPORTANTE: Primeiro habilitar o CSS principal
    habilitarCSSPrincipal();

    dash_analista.innerHTML = `
      <div class="dashboard-grid">
      <h1 class="bem-vindo">Bem-vindo(a) ${sessionStorage.NOME_USUARIO}</span></h1>

    <h2 class="desempenho">Desempenho Serv-001</h2>
    <!-- KPIs -->
    <section class="kpis">

      <div class="kpi-box">
      <span class="kpi-title">MTTR (Tempo Médio de Reparo)</span>
      <h2 class="kpi-value">30 min ↑20%</h2>
        
      </div>

      <div class="kpi-box">
        <span class="kpi-title">Servidor com Mais Alertas</span>
        <h2 class="kpi-value">SERV-001</h2>
      </div>

      <div class="kpi-box">
        <span class="kpi-title">Componente Mais Impactado</span>
        <h2 class="kpi-value">RAM</h2>
      </div>

      <div class="kpi-box">
        <span class="kpi-title">Alertas no Mês</span>
        <h2 class="kpi-value">12</h2>
      </div>

    </section>
    
    <section class="tendencia-semanal">
      <div class="grafico-box grande">
        <h3 class="grafico-titulo">Frequência Semanal de Alertas</h3>
        <canvas id="frequenciaSemanalChart"></canvas>
      </div>
    </section>

    <section class="analise-direita">
      <!-- Servidores: Linha 1 da Coluna Direita -->
      <div class="grafico-box">
        <h3 class="grafico-titulo">Alertas por Servidor (Top 3)</h3>
        <canvas id="alertasServidorChart"></canvas>
      </div>
      <div class="grafico-box">
        <h3 class="grafico-titulo">Tempo Médio de Resolução por Servidor</h3>
        <canvas id="tempoResolucaoServidorChart"></canvas>
      </div>

      <div class="grafico-box">
        <h3 class="grafico-titulo">Alertas por Componente</h3>
        <canvas id="alertasComponenteChart"></canvas>
      </div>
      <div class="grafico-box">
        <h3 class="grafico-titulo">Tempo Médio de Resolução por Componente</h3>
        <canvas id="tempoResolucaoComponenteChart"></canvas>
      </div>
    </section>`;

    dash_analista.style.display = "block";
    dash_suporte.style.display = "none";

    // Carregar CSS específico do analista APÓS habilitar o principal
    setTimeout(() => {
      carregarCSS('./css/styleAnalista.css');
    }, 100);

    // Inicializar gráficos do analista com mais delay para garantir CSS
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