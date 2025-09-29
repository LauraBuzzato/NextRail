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

  document.addEventListener("DOMContentLoaded", function() {
  const selectCargo = document.getElementById("cargo_input");

  fetch("/usuarios/procurarCargos", { method: "POST", headers: { "Content-Type": "application/json" } })
    .then(res => {
      if (!res.ok) throw "Erro na requisição de cargos!";
      return res.json();
    })
    .then(dados => {
      console.log("Cargos:", dados);
      dados.forEach(cargo => {
        if(cargo.id!=1){
        selectCargo.add(new Option(cargo.nome, cargo.id));  
        }
        
      });
    })
    .catch(erro => console.log("#ERRO cargos:", erro));

});