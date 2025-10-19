function analisaCargo() {
    var cargo = sessionStorage.CARGO_USUARIO;
    // o nome da variavel está atribuidas nas mudanças do corpo das páginas não em relação ao menu
    // apesar de haver mudanças no menu não considero como alterações no corpo =)
    var mudanca;

    if (cargo == "Analista de infraestrutura") {
        mudanca = false;
    }else if (cargo == "Suporte técnico") {
        mudanca = true;
    }

    atualizar(mudanca)
}

function atualizar(a) {
    // if a = true então a página que logou é a do Suporte técnico
    if (a == true) {
        // mudando o menu de acordo com o cargo para disponibilidade
       /* var li_relatorio = document.getElementById("relatorios");
        li_relatorio.style.display = "none";*/

        var li_configuracoes = document.getElementById("configuracoes")
        li_configuracoes.style.display = "flex";

        var li_cadastrar_server = document.getElementById("cadastroServer")
        li_cadastrar_server.style.display = "flex";

        var main_titulo_destaque = document.getElementById("titulo-destaque")
        main_titulo_destaque.innerHTML = `Bem vindo(a) ${sessionStorage.NOME_USUARIO}`

        // mudança no corpo
        // lembrando de sempre colocar as classes dentro dos atributos para herdar o css

        //João, por favor inserir os elementos da página de dashboard depois na função

        /*var main_conteudo_Principal = document.getElementById("conteudoPrincipal")
        main_conteudo_Principal.innerHTML = `
        <h1 class="titulo-destaque">Bem vindo(a) ${sessionStorage.NOME_USUARIO}</h1>
        <div class="kpi-container">

        <div class="kpi-1">
          <div class="kpi-titulo">Memórias RAM acima do limite estipulado em tempo real</div>
          <div class="kpi-conteudo">
            <span style="color: red;">SERVIDOR: </span>SERV-32 <span style="color: red;">ID: </span> 32 
            <br>
            <br>
          </div>
        </div>
        
        <div class="kpi-2">
          <div class="kpi-titulo">Número de alertas nas últimas duas horas incluindo todos os componentes de todos os servidores</div>
          <div class="kpi-conteudo">
          <span style="color: red;">SERVIDOR: </span>SERV-32 <span style="color: red;">ALERTAS: </span> 2 
            <br>
            <br>
            <span style="color: red;">SERVIDOR: </span>SERV-64 <span style="color: red;">ALERTAS: </span> 0 
            <br>
            <br>
            </div>
        </div>

        <div class="kpi-3">
          <div class="kpi-titulo">Tempo total em que a CPU ficou acima do limite estipulado nas últimas duas horas (em segundos por servidor)</div>
          <div class="kpi-conteudo">
          <span style="color: red;">SERVIDOR: </span>SERV-32 <span style="color: red;">TEMPO: </span> 367 
            <br>
            <br>
            <span style="color: red;">SERVIDOR: </span>SERV-64 <span style="color: red;">TEMPO: </span> 28 
            <br>
            <br>
            </div>
        </div>
    </div>
        <div class="graficos-container">
        <div class="grafico-box">
          <h3>Uso de CPU</h3>
          <canvas id="graficoRelatorioCPU"></canvas>
        </div>
        <div class="grafico-box">
          <h3>Uso de RAM</h3>
          <canvas id="graficoRelatorioRAM"></canvas>
        </div>
        <div class="grafico-box">
          <h3>Uso de Disco</h3>
          <canvas id="graficoRelatorioDisco"></canvas>
        </div>
      </div>
        `*/
        inicializarGraficos();
        
    }else {
        
        var li_configuracoes = document.getElementById("configuracoes")
        li_configuracoes.style.display = "none";

        var li_cadastrar_server = document.getElementById("cadastroServer")
        li_cadastrar_server.style.display = "none";

    }
}