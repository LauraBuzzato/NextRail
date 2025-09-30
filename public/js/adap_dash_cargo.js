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
        var li_relatorio = document.getElementById("relatorios");
        li_relatorio.style.display = "none";

        var li_configuracoes = document.getElementById("configuracoes")
        li_configuracoes.style.display = "flex";

        var li_cadastrar_server = document.getElementById("cadastroServer")
        li_cadastrar_server.style.display = "none";

        // mudança no corpo
        // lembrando de sempre colocar as classes dentro dos atributod para herdar o css
        var main_conteudo_Principal = document.getElementById("conteudoPrincipal")
        main_conteudo_Principal.innerHTML = `
        <h1 class="titulo-destaque">Bem vindo a Dashboard Do SUPORTE</h1>
        <p class="subtitulo">AINDA ESTOU PENSANDO.</p>
        `
        
    }else {
        var li_configuracoes = document.getElementById("configuracoes")
        li_configuracoes.style.display = "none";

    }
}