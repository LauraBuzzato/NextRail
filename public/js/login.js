function entrar() {
    aguardar();

    var emailVar = email_input.value;
    var senhaVar = senha_input.value;

    if (emailVar == "" || senhaVar == "") {
        cardErro.style.display = "block"
        mensagem_erro.innerHTML = "Preencha todos os campos!";
        finalizarAguardar();
        setTimeout(() => {
            cardErro.style.display = "none";
        }, 5000);
        return false;
    }

    console.log("FORM LOGIN: ", emailVar);
    console.log("FORM SENHA: ", senhaVar);

    fetch("/usuarios/autenticar", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        emailServer: emailVar,
        senhaServer: senhaVar,
    })
}).then(function (resposta) {
    console.log("ESTOU NO THEN DO entrar()!");

    if (resposta.ok) {
        resposta.json().then(json => {
            console.log(json);
            sessionStorage.EMAIL_USUARIO = json.email;
            sessionStorage.NOME_USUARIO = json.nome;
            sessionStorage.ID_USUARIO = json.id;
            sessionStorage.CARGO_USUARIO = json.cargo;

            setTimeout(() => {
                if (json.cargo === "Suporte técnico") {
                    window.location = "./paginaSUP.html"; 
                } else if (json.cargo === "Analista de infraestrutura") {
                    window.location = "./dashboard.html"; 
                } else {
                    window.location = "./usuarios.html"; 
                }
            }, 1000);
        });

    } else {
        resposta.text().then(texto => {
            console.error(texto);
            finalizarAguardar(texto);
        });
    }

}).catch(function (erro) {
    console.log(erro);
});

    return false;
}
