async function carregarSelects() {
  try {
    const [empresas, tipos, sistemas, estados] = await Promise.all([
      fetch("/servidores/listarEmpresas").then(res => res.json()),
      fetch("/servidores/listarTipos").then(res => res.json()),
      fetch("/servidores/listarSO").then(res => res.json()),
      fetch("/estados/listar").then(res => res.json())
    ]);

    const selectEmpresa = document.getElementById("empresa");
    const selectTipo = document.getElementById("tipo");
    const selectSO = document.getElementById("so");
    const selectEstado = document.getElementById("estado");

    selectEmpresa.innerHTML = `<option value="">Selecione a empresa</option>`;
    selectTipo.innerHTML = `<option value="">Selecione o tipo</option>`;
    selectSO.innerHTML = `<option value="">Selecione o sistema operacional</option>`;
    selectEstado.innerHTML = `<option value="">Selecione o estado</option>`;

    empresas.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.razao_social;
      selectEmpresa.appendChild(opt);
    });

    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.nome;
      selectTipo.appendChild(opt);
    });

    sistemas.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.descricao;
      selectSO.appendChild(opt);
    });

    estados.forEach(est => {
      const opt = document.createElement("option");
      opt.value = est.id;
      opt.textContent = `${est.nome} (${est.sigla})`;
      selectEstado.appendChild(opt);
    });

  } catch (erro) {
    console.error("Erro ao carregar selects:", erro);
  }
}

async function cadastrarServidor(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const fk_empresa = document.getElementById("empresa").value;
  const fk_tipo = document.getElementById("tipo").value;
  const fk_so = document.getElementById("so").value;
  const logradouro = document.getElementById("logradouro").value.trim();
  const cep = document.getElementById("cep").value.trim();
  const numero = document.getElementById("numero").value.trim();
  const complemento = document.getElementById("complemento").value.trim();
  const fk_estado = document.getElementById("estado").value;

  console.log({
    nome,
    fk_empresa,
    fk_tipo,
    fk_so,
    logradouro,
    cep,
    numero,
    complemento,
    fk_estado
  });

  try {
    const resposta = await fetch("/servidores/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        fk_empresa,
        fk_tipo,
        fk_so,
        logradouro,
        cep,
        numero,
        complemento,
        fk_estado
      })
    });

    if (resposta.ok) {
      alert("Servidor cadastrado com sucesso!");
      document.getElementById("formServidor").reset();
    } else {
      const erroTexto = await resposta.text();
      console.error("Erro ao cadastrar servidor:", erroTexto);
      alert("❌ Erro ao cadastrar servidor.");
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
  }
}


function limparFormulario() {
  document.getElementById("formServidor").reset();
}
