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
  console.log("Oi?");
  
  sessionStorage.PAGINA_DESEJADA = "./dashboard.html"
  if(sessionStorage.ID_SERVIDOR>=1){
  validarSessao();
  arrumarMenuDash();

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
  }else{
    window.location = "./selecionarServidor.html"
  }

  
}

function arrumarMenuDash() {
  if (sessionStorage.CARGO_USUARIO == "Analista de infraestrutura") {
    DIVmenu.innerHTML = `<ul class="link-items">
      <div class="logo-container">
        <img src="./assets/icon/logo-SFroxo.png" alt="Logo NextRail" class="logo-menu">
      </div>
      <li class="link-item" id="dashboard">
        <a href="selecionarServidor.html" class="link">
          <ion-icon name="grid-outline"></ion-icon>
          <span style="--i: 1">Servidores</span>
        </a>
      </li>
      <li class="link-item active" id="dashboard">
        <a href="dashboard.html" class="link">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span style="--i: 2">Alertas</span>
        </a>
      </li>
      <li class="link-item" id="dashboard">
        <a href="dashcomponentes.html" class="link">
          <ion-icon name="hardware-chip-outline"></ion-icon>
          <span style="--i: 3">Componentes</span>
        </a>
      </li>
      <li class="link-item">
        <a href="testePrevisoes.html" class="link">
          <ion-icon name="analytics-outline"></ion-icon>
          <span style="--i: 4">Previsões</span>
        </a>
      </li>
      <li class="link-item" id="relatorios">
        <a href="relatoriosDash.html" class="link">
          <ion-icon name="stats-chart-outline"></ion-icon>
          <span style="--i: 5">Relatórios</span>
        </a>
      </li>
      <li class="link-item">
        <a onclick="limparSessao()" class="link">
          <ion-icon name="log-out-outline"></ion-icon>
          <span style="--i: 7">Sair</span>
        </a>
      </li>
    </ul>`;
  } else {
    DIVmenu.innerHTML = `<ul class="link-items">
      <div class="logo-container">
        <img src="./assets/icon/logo-SFroxo.png" alt="Logo NextRail" class="logo-menu">
      </div>
      <li class="link-item" id="dashboard">
        <a href="selecionarServidor.html" class="link">
          <ion-icon name="grid-outline"></ion-icon>
          <span style="--i: 1">Servidores</span>
        </a>
      </li>
      <li class="link-item active" id="dashboard">
        <a href="dashboard.html" class="link">
          <ion-icon name="pulse-outline"></ion-icon>
          <span style="--i: 2">Uso Componentes</span>
        </a>
      </li>
      <li class="link-item" id="dashboard">
        <a href="dashProcessos.html" class="link">
          <ion-icon name="layers-outline"></ion-icon>
          <span style="--i: 3">Processos</span>
        </a>
      </li>
      <li class="link-item" id="cadastroServer">
        <a href="cadastroServidor.html" class="link">
          <ion-icon name="construct-outline"></ion-icon>
          <span style="--i: 4">Cadastrar Servidor</span>
        </a>
      </li>
      <li class="link-item" id="configuracoes">
        <a href="configAlerta.html" class="link">
          <ion-icon name="settings-outline"></ion-icon>
          <span style="--i: 5">Parâmetros</span>
        </a>
      </li>
      <li class="link-item">
        <a onclick="limparSessao()" class="link">
          <ion-icon name="log-out-outline"></ion-icon>
          <span style="--i: 7">Sair</span>
        </a>
      </li>
    </ul>`;
  }
}

function inicializarGraficosSuporte() {
  setTimeout(() => {
    if (typeof dash_suporte === 'function') {
      console.log('Inicializando gráficos do suporte...');
      /*try {
        dash_suporte();
      } catch (error) {
        console.error('Erro ao inicializar gráficos do suporte:', error);
      }*/
      try {
        kpi_suporte('ram');
      } catch (error) {
        console.error("Erro ao inicializar a kpi ram:", error)
      }
      try {
        kpi_suporte('cpu');
      } catch (error) {
        console.error("Erro ao inicializar a kpi cpu:", error)
      }
      try {
        kpi_suporte('disco');
      } catch (error) {
        console.error("Erro ao inicializar a kpi disco:", error)
      }
    } else {
      console.error('dash_suporte não disponível');
      setTimeout(() => {
        if (typeof dash_suporte === 'function') {
          /*try {
            dash_suporte();
          } catch (error) {
            console.error('Erro na segunda tentativa do suporte:', error);
          }*/
          try {
            kpi_suporte('ram');
          } catch (error) {
            console.error('Erro na segunda tentativa da kpi ram:', error);
          }
          try {
            kpi_suporte('cpu');
          } catch (error) {
            console.error('Erro na segunda tentativa da kpi cpu:', error);
          }
          try {
            kpi_suporte('disco');
          } catch (error) {
            console.error('Erro na segunda tentativa da kpi disco:', error);
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
      <h1 class="bem-vindo">Uso dos Componentes: ${localStorage.NOME_SERVIDOR}</span></h1>
      <section class="conteudo-principal">
        <div class="kpi-container">
          <div class="kpi-1">
            <div class="kpi-titulo">Uso de RAM nos últimos dois minutos</div>
            <canvas id="grafico_ram"></canvas>
          </div>
          <div class="kpi-2">
            <div class="kpi-titulo">Uso de CPU nos últimos dois minutos</div>
            <canvas id="grafico_cpu"></canvas>
          </div>
          <div class="kpi-3">
            <div class="kpi-titulo">Uso de DISCO nos últimos dois minutos</div>
            <canvas id="grafico_disco"></canvas>
          </div>
        </div>

          <div class="graficos-container">
            <!--<div class="grafico-box">
    <div class="grafico-header">Leituras mais frequentes nas últimas 24 horas</div>
    <canvas id="graficoSuporte"></canvas>
  </div>-->

          <div class="container-tabela-dinamica">
            <div class="tabela-titulo">Histórico de alertas dos últimos 7 dias</div>
            <div class="legenda">
      <div class="opcaoLegenda">
        <div class="bloco_cor" style="background-color:green"></div>
        <p>Sem Alerta </p>
      </div>
      <p>|</p>
      <div class="opcaoLegenda">
        <div class="bloco_cor" style="background-color:yellow"></div>
        <p>Alerta Baixo</p>
      </div>
      <p>|</p>
      <div class="opcaoLegenda">
        <div class="bloco_cor" style="background-color:darkorange"></div>
        <p>Alerta Médio</p>
      </div>
      <p>|</p>
      <div class="opcaoLegenda">
        <div class="bloco_cor" style="background-color:red"></div>
        <p>Alerta Alto</p>
      </div>
    </div>
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
      
    }, 200);

  } else { // ANALISTA DE INFRAESTRUTURA
    // ... (o resto do código do analista permanece igual)
    // IMPORTANTE: Primeiro habilitar o CSS principal
    habilitarCSSPrincipal();

    dash_analista.innerHTML = `
      <div class="dashboard-grid">

  
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    <h2 class="desempenho" >Alertas do ${localStorage.NOME_SERVIDOR} </h2>

    <select id="selectPeriodo" onchange="dash_analista()" style="padding: 10px; border-radius: 5px; font-weight: bold;">
            <option value="mensal" selected>Visualização Mensal</option>
            <option value="anual">Visualização Anual</option>
        </select>
        </div>
    
    <!-- KPIs -->
    <section class="kpis">

      <div class="kpi-box">
        <span class="kpi-title" id="titulo-kpi-total"></span>
        <div id="kpi-total-alertas" ></div>
      <h4 class="seta" id="variacao"></h4>

      </div>

      <div class="kpi-box">
        <span class="kpi-title" id="titulo-kpi-comp"> </span>
        <div id="kpi-componente-mais-impactado" style="font-size: 40px;"></div>
      </div>

      <div class="kpi-box">
    <span class="kpi-title">
        
        <span id="titulo-kpi-mttr"></span>
        
        <span class="info-icon" data-tooltip="Média de tempo decorrido entre o início de um alerta e sua finalização." style="display: inline-block; vertical-align: middle; margin-left: 5px;">
             <svg fill="#000000" width="18px" height="18px" viewBox="0 0 24 24" id="information-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color" style="display: block;">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <line id="secondary-upstroke" x1="12.05" y1="8" x2="11.95" y2="8" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line>
                    <line id="secondary" x1="12" y1="13" x2="12" y2="16" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line>
                    <path id="primary" d="M3,12a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9h0a9,9,0,0,1-9,9h0a9,9,0,0,1-9-9Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path>
                </g>
            </svg>
        </span>
    </span>
  


        <div id="kpi-mttr-medio"></div>
        <h4 id="metrica-sla"></h4>
      </div>

      <div class="kpi-box">
        <span class="kpi-title" id="titulo-kpi-grav"></span>
        <div id="kpi-gravidade-mais-frequente"></div>
      </div>
    </section>
    
    
    
    <section class="tendencia-semanal">
      <div class="grafico-box-grande">
        <h3 class="grafico-titulo" id="titulo-graf-freq"></h3>
        <canvas id="frequenciaSemanalChart"></canvas>
      </div>

      <section class="analise-direita">

      <div class="grafico-box">
        <h3 class="grafico-titulo" id="titulo-graf-grav"> </h3>
        <canvas id="alertasPorGravidade"></canvas>
      </div>

      
      <div class="grafico-box">
        <h3 class="grafico-titulo" id="titulo-graf-comp"> </h3>
        <canvas id="alertasComponenteChart"></canvas>
      </div>


    </section>
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
          <span style="--i: 1">Servidores</span>
        </a>
      </li>
      <li class="link-item" id="dashboard">
        <a href="dashboard.html" class="link">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span style="--i: 2">Alertas</span>
        </a>
      </li>
      <li class="link-item" id="dashboard">
        <a href="dashcomponentes.html" class="link">
          <ion-icon name="hardware-chip-outline"></ion-icon>
          <span style="--i: 3">Componentes</span>
        </a>
      </li>
      <li class="link-item">
        <a href="testePrevisoes.html" class="link">
          <ion-icon name="analytics-outline"></ion-icon>
          <span style="--i: 4">Previsões</span>
        </a>
      </li>
      <li class="link-item" id="relatorios">
        <a href="relatoriosDash.html" class="link">
          <ion-icon name="stats-chart-outline"></ion-icon>
          <span style="--i: 5">Relatórios</span>
        </a>
      </li>
      <li class="link-item">
        <a onclick="limparSessao()" class="link">
          <ion-icon name="log-out-outline"></ion-icon>
          <span style="--i: 7">Sair</span>
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
          <span style="--i: 1">Servidores</span>
        </a>
      </li>
      <li class="link-item" id="dashboard">
        <a href="dashboard.html" class="link">
          <ion-icon name="pulse-outline"></ion-icon>
          <span style="--i: 2">Uso Componentes</span>
        </a>
      </li>
      <li class="link-item" id="dashboard">
        <a href="dashProcessos.html" class="link">
          <ion-icon name="layers-outline"></ion-icon>
          <span style="--i: 3">Processos</span>
        </a>
      </li>
      <li class="link-item" id="cadastroServer">
        <a href="cadastroServidor.html" class="link">
          <ion-icon name="construct-outline"></ion-icon>
          <span style="--i: 4">Cadastrar Servidor</span>
        </a>
      </li>
      <li class="link-item" id="configuracoes">
        <a href="configAlerta.html" class="link">
          <ion-icon name="settings-outline"></ion-icon>
          <span style="--i: 5">Parâmetros</span>
        </a>
      </li>
      <li class="link-item">
        <a onclick="limparSessao()" class="link">
          <ion-icon name="log-out-outline"></ion-icon>
          <span style="--i: 7">Sair</span>
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