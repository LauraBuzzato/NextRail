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
      alert(`${usuarioParaExcluir} foi excluído!`)
      const linha = document.getElementById(`usuario-${usuarioIdParaExcluir}`)
      if (linha) {
        linha.remove()
      }
    }, 100)
  }

  