function direcionaDash() {
    if (sessionStorage.CARGO_USUARIO == "Analista de infraestrutura") {
        window.location = "./dashboard.html"
    } else {
        window.location = "./dashboard.html"
    }
}

function listarServidor() {
    fetch('/servidores/selecionarServidores', {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        idempresa: sessionStorage.ID_EMPRESA
    })
})
    .then(res => res.json())
    .then(servidores => {
        let listaServidores = '';

        console.log(servidores);

        for (let i = 0; i < servidores.length; i++) {
            let servidor = servidores[i];

            listaServidores += `
                <div class="card_servidor" onclick="direcionaDash()">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        <p>Quantidade de alertas:</p>
                        <div>12</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro} ${servidor.numero} - ${servidor.complemento}</div>
                    </div>
                </div>
            `;
        }
        const linha_serv = document.getElementById("linha_card_serv");
        linha_serv.innerHTML = listaServidores;
    }).catch(erro => {
        console.error("Erro ao buscar servidores:", erro);
    });
}
