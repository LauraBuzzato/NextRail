let usuarioParaExcluir = ''
let usuarioIdParaExcluir = null

function editar(id) {
  window.location.href = "edicaoUsuario.html"
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

