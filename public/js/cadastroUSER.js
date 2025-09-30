function mascaraCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

document.getElementById("cpf_input").addEventListener("input", function () {
  this.value = mascaraCPF(this.value);
});

const selectCargo = document.getElementById("cargo_input");

document.addEventListener("DOMContentLoaded", function () {
  const selectCargo = document.getElementById("cargo_input");

  fetch("/usuarios/procurarCargos", { method: "POST", headers: { "Content-Type": "application/json" } })
    .then(res => {
      if (!res.ok) throw "Erro na requisição de cargos!";
      return res.json();
    })
    .then(dados => {
      console.log("Cargos:", dados);
      dados.forEach(cargo => {
        if (cargo.id != 1) {
          selectCargo.add(new Option(cargo.nome, cargo.id));
        }

      });
    })
    .catch(erro => console.log("#ERRO cargos:", erro));

});

function cadastrar(){
  var nomeVar = nome_input.value;
  var cpfVar = cpf_input.value;
  var cargoVar = cargo_input.value;
  var emailVar = email_input.value;
  var senhaVar = senha_input.value;
  var confirmacaoSenhaVar = confirmacao_senha_input.value;
  var idEmpresaVar = sessionStorage.ID_EMPRESA;

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
    finalizarAguardar("Os campos não podem ser vazios.");
    return false;
  }
  if (nomeVar.length <= 1) {
    finalizarAguardar("O nome deve conter mais de 1 caractere.");
    return false;
  }

  if (senhaVar.length < 8 || senhaVar.length > 128 || !CaracterEspeciais.some(char => senhaVar.includes(char))) {
    finalizarAguardar("Sua senha deve ter mais de 8 caracteres e possuir caracteres Especiais!")
    return false
  }



  if (!emailVar.includes('@') || !emailVar.includes('.')) {
    finalizarAguardar("O e-mail é inválido.");
    return false;
  }

  else {
    fetch("/usuarios/cadastrar", {
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
        idempresa: idEmpresaVar

      }),
    })
      .then(function (resposta) {
        console.log("resposta: ", resposta);

        if (resposta.ok) {
          var sectionErrosLogin = document.getElementById("section_erros_login");
          sectionErrosLogin.style.backgroundColor = '#069006';

          finalizarAguardar("Cadastro realizado com sucesso!");

          
        } else {
          throw "Houve um erro ao tentar realizar o cadastro!";
        }
      })
      .catch(function (resposta) {
        console.log(`#ERRO: ${resposta}`);
        finalizarAguardar(resposta);
      });
  }

  function sumirMensagem() {
    cardErro.style.display = "none";
  }
}