let usuarioParaExcluir = ''
let usuarioIdParaExcluir = null

var senhaDigitada = ""
var senhaDigitadaConfirmar = ""

function mascaraCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function RetiraMascara(ObjCPF) {
  return ObjCPF.value.replace(/\D/g, '');
}



function editar(id) {
  localStorage.ID_USUARIO_EDITAR = id;

  window.location.href = "edicaoUsuario.html"

}

function carregarDados() {
  usuarioIdParaEditar = localStorage.ID_USUARIO_EDITAR
  fetch('/usuarios/carregarDados', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: usuarioIdParaEditar
    })
  })
    .then(res => res.json())
    .then(usuario => {
      console.log(usuario);
      
      senhaDigitada = usuario[0].senha
      senhaDigitadaConfirmar = usuario[0].senha
      if (usuario[0].idcargo == 1) {
        cardEdicao.innerHTML = `<h2>Editar Usuário: ${usuario[0].nome}</h2>
                    <div class="formulario">
                        <div class="campo">
                            <span>Nome:</span>
                            <input id="nome_input" type="text" placeholder="" value="${usuario[0].nome}">
                        </div>
                        <div class="campo">
                            <span>CPF:</span>
                            <input type="text" id="cpf_input" required maxlength="14" value="${mascaraCPF(usuario[0].cpf)}">
                        </div>
                        <div class="campo">
                            <span>E-mail:</span>
                            <input id="email_input" type="text" placeholder="@gmail.com" value="${usuario[0].email}">
                        </div>
                        <div class="campo">
                            <span>Senha:</span>
                            <div class="senha" id="senha">
                            <input id="senha_input" type="password" placeholder="******" value="${usuario[0].senha}" oninput="salvarsenha()">
                            <ion-icon name="eye-off" class="icon" onclick="mostrarsenha()"></ion-icon>
                            </div>
                        </div>
                        <div class="campo">
              <span>Confirmar senha:</span>
              <div class="confirmarSenha" id="confirmarSenha">
              <input id="confirmacao_senha_input" type="password" placeholder="******" value="${usuario[0].senha}" oninput="salvarsenha()">
              </div>
            </div>
                        <button class="botao" onclick="atualizar()">Atualizar</button>`
      } else {
        cardEdicao.innerHTML = `<h2>Editar Usuário: ${usuario[0].nome}</h2>
                    <div class="formulario">
                        <div class="campo">
                            <span>Nome:</span>
                            <input id="nome_input" type="text" placeholder="" value="${usuario[0].nome}">
                        </div>
                        <div class="campo">
                            <span>CPF:</span>
                            <input type="text" id="cpf_input" required maxlength="14" value="${mascaraCPF(usuario[0].cpf)}">
                        </div>
                        <div class="campo">
                            <span>Cargo:</span>
                            <select name="" id="cargo_input">
                                
                            </select>
                        </div>
                        <div class="campo">
                            <span>E-mail:</span>
                            <input id="email_input" type="text" placeholder="@gmail.com" value="${usuario[0].email}">
                        </div>
                        <div class="campo">
                            <span>Senha:</span>
                            <div class="senha" id="senha">
                            <input id="senha_input" type="password" placeholder="******" value="${usuario[0].senha}" oninput="salvarsenha()">
                            <ion-icon name="eye-off" class="icon" onclick="mostrarsenha()"></ion-icon>
                            </div>
                        </div>
                        <div class="campo">
              <span>Confirmar senha:</span>
              <div class="confirmarSenha" id="confirmarSenha">
              <input id="confirmacao_senha_input" type="password" placeholder="******" value="${usuario[0].senha}" oninput="salvarsenha()">
              </div>
            </div>
                        <button class="botao" onclick="atualizar()">Atualizar</button>`

        const selectCargo = document.getElementById("cargo_input");

        selectCargo.add(new Option(usuario[0].cargo, usuario[0].idcargo));

        fetch("/usuarios/procurarCargos", { method: "POST", headers: { "Content-Type": "application/json" } })
          .then(res => {
            if (!res.ok) throw "Erro na requisição de cargos!";
            return res.json();
          })
          .then(dados => {
            console.log("Cargos:", dados);
            dados.forEach(cargo => {
              if (cargo.id != 1 && cargo.id != usuario[0].idcargo) {
                selectCargo.add(new Option(cargo.nome, cargo.id));
              }

            });
          })
      }

      document.getElementById("cpf_input").addEventListener("input", function () {
        this.value = mascaraCPF(this.value);
      });

    })
    .catch(erro => {
      console.error("Erro ao buscar usuarios:", erro);
    });

}

function excluir(id, nome) {
  usuarioParaExcluir = nome;
  usuarioIdParaExcluir = id
  document.getElementById('mensagemPopup').innerText = `Quer mesmo excluir ${nome}?`
  document.getElementById('popupExcluir').style.display = 'flex'
}

function fecharPopup() {
  document.getElementById('popupExcluir').style.display = 'none'
}


function confirmarExclusao() {
  fecharPopup()
  setTimeout(() => {
    fetch("/usuarios/excluir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({

        id: usuarioIdParaExcluir

      }),
    })
      .then(function (resposta) {
        console.log("resposta: ", resposta);

        if (resposta.ok) {


          alert(`${usuarioParaExcluir} foi excluído!`)



          buscarUsuarios();



        } else {
          throw "Houve um erro ao tentar realizar a exclusão!";
        }
      })

  }, 100)
}
function atualizar() {
  var nomeVar = nome_input.value;
  var cpfVar = RetiraMascara(cpf_input);
  var cargoVar = cargo_input.value;
  var emailVar = email_input.value;
  var senhaVar = senha_input.value;
  var confirmacaoSenhaVar = confirmacao_senha_input.value;
  var idEmpresaVar = sessionStorage.ID_EMPRESA;
  var usuarioIdParaEditar = localStorage.ID_USUARIO_EDITAR;

  const CaracterEspeciais = ['!', '@', '#', '$', '%', '&', '*', '(', ')']

  if (
    nomeVar == "" ||
    cpfVar == "" ||
    cargoVar == "" ||
    emailVar == "" ||
    senhaVar == "" ||
    confirmacaoSenhaVar == "" ||
    idEmpresaVar == ""

  ) {
    alert("Os campos não podem ser vazios.");
    return false;
  }
  if (nomeVar.length <= 1) {
    alert("O nome deve conter mais de 1 caractere.");
    return false;
  }





  if (!emailVar.includes('@') || !emailVar.includes('.')) {
    alert("O e-mail é inválido.");
    return false;
  }

  else {
    fetch("/usuarios/atualizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({

        nome: nomeVar,
        email: emailVar,
        cpf: cpfVar,
        senha: senhaVar,
        cargo: cargoVar,
        idempresa: idEmpresaVar,
        idusuario: usuarioIdParaEditar

      }),
    })
      .then(function (resposta) {
        console.log("resposta: ", resposta);

        if (resposta.ok) {


          alert("Usuário atualizado com sucesso!");

          localStorage.clear();

          window.location.href = "usuarios.html"


        } else {
          throw "Houve um erro ao tentar atualizar o usuário!";
        }
      })
      .catch(function (resposta) {
        console.log(`#ERRO: ${resposta}`);
        alert(resposta);
      });
  }


}



function salvarsenha(){
    senhaDigitada = senha_input.value
    senhaDigitadaConfirmar = confirmacao_senha_input.value
}

function mostrarsenha(){
    senha.innerHTML = `<input id="senha_input" type="text" placeholder="******" value="${senhaDigitada}" oninput="salvarsenha()">
            <ion-icon name="eye" class="icon" onclick="escondersenha()"></ion-icon>`

    confirmarSenha.innerHTML = `<input id="confirmacao_senha_input" type="text" placeholder="******" oninput="salvarsenha()" value="${senhaDigitadaConfirmar}">`
}

function escondersenha(){
    senha.innerHTML = `<input id="senha_input" type="password" placeholder="******" value="${senhaDigitada}" oninput="salvarsenha()">
            <ion-icon name="eye-off" class="icon" onclick="mostrarsenha()"></ion-icon>`

    confirmarSenha.innerHTML = `<input id="confirmacao_senha_input" type="password" placeholder="******" oninput="salvarsenha()" value="${senhaDigitadaConfirmar}">`
}