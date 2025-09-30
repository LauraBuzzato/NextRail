function mascaraCPF(value) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function buscarUsuarios(){
    fetch('/usuarios/buscarUsuarios', {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        idempresa: sessionStorage.ID_EMPRESA
    })
})
    .then(res => res.json())
    .then(usuarios => {
        
        let linha = '';


        for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
            

            if (i == 0) {
                linha += `
                <tr>
                        <td>${usuario.nome} (você)</td>
                        <td>${mascaraCPF(usuario.cpf)}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.cargo}</td>
                        <td>
                            <div class="icones">
                                <ion-icon name="pencil" onclick="editar(${usuario.id})" class="icone"></ion-icon>
                                <ion-icon name="trash" onclick="excluir(${usuario.id})" class="icone primeiraLixeira"></ion-icon>
                            </div>
                        </td>
                        </tr>

                    `;

                
                
            }
            else {
                linha += `
                        <tr id="usuario-${usuario.id}">
                            <td>${usuario.nome}</td>
                            <td>${mascaraCPF(usuario.cpf)}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.cargo}</td>
                            <td>
                                <div class="icones">
                                    <ion-icon name="pencil" onclick="editar(${usuario.id})" class="icone"></ion-icon>
                                    <ion-icon name="trash" onclick="excluir(${usuario.id}, '${usuario.nome}')" class="icone"></ion-icon>
                                </div>
                            </td>
                        </tr>

                    `;

                
            }

            



        }

        conteudoTabela.innerHTML=linha


    })
    .catch(erro => {
        console.error("Erro ao buscar usuarios:", erro);
    });
}
