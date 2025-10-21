function mascaraCEP(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 9);
}

function RetiraMascara(ObjCEP) {
  return ObjCEP.replace(/\D/g, '');
}

document.getElementById("cep").addEventListener("input", async function () {
  this.value = mascaraCEP(this.value);

  const cepLimpo = RetiraMascara(cep.value);
  if (cepLimpo.length === 8) {
    await buscarCEP(cepLimpo);
  }
});

async function carregarSelects() {
  try {
    const [tipos, sistemas, estados] = await Promise.all([
      fetch("/servidores/listarTipos").then(res => res.json()),
      fetch("/servidores/listarSO").then(res => res.json()),
      fetch("/estados/listar").then(res => res.json())
    ]);

    const selectTipo = document.getElementById("tipo");
    const selectSO = document.getElementById("so");
    const selectEstado = document.getElementById("estado");

    selectTipo.innerHTML = `<option value="">Selecione o tipo</option>`;
    selectSO.innerHTML = `<option value="">Selecione o sistema operacional</option>`;
    selectEstado.innerHTML = `<option value="">Selecione o estado</option>`;

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

async function buscarCEP(cep) {
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) throw new Error("Erro ao consultar CEP");
    const dados = await resposta.json();

    document.getElementById("logradouro").value = dados.logradouro || "";
    
    const selectEstado = document.getElementById("estado");
    for (const opt of selectEstado.options) {
      if (opt.textContent.includes(`(${dados.uf})`)) {
        selectEstado.value = opt.value;
        break;
      }
    }

  } catch (erro) {
    console.error("Erro ao buscar CEP:", erro);
  }
}

async function cadastrarServidor() {
  const nome = document.getElementById("nome").value.trim();
  const fk_empresa = sessionStorage.ID_EMPRESA;
  const fk_tipo = document.getElementById("tipo").value;
  const fk_so = document.getElementById("so").value;
  const logradouro = document.getElementById("logradouro").value.trim();
  let cep = document.getElementById("cep").value.trim();
  cep = RetiraMascara(cep);
  const numero = document.getElementById("numero").value.trim();
  const complemento = document.getElementById("complemento").value.trim();
  const fk_estado = document.getElementById("estado").value;

  // Validação dos campos obrigatórios
  if (!nome || !fk_tipo || !fk_so || !logradouro || !cep || !numero || !fk_estado) {
    alert("Por favor, preencha todos os campos obrigatórios!");
    return;
  }

  if (cep.length !== 8) {
    alert("CEP inválido!");
    return;
  }

  console.log("Dados do servidor:", {
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

    console.log("Status da resposta:", resposta.status); 
    console.log("Resposta completa:", resposta); 

    const resultado = await resposta.json();

    if (resposta.ok) {
      console.log("Servidor cadastrado com sucesso:", resultado);
      alert("Servidor cadastrado com sucesso!\n\nOs componentes (CPU, RAM, Disco) foram criados automaticamente com valores padrão.");
      document.getElementById("formServidor").reset();
    } else {
      console.error("Erro ao cadastrar servidor:", resultado);
      alert("Erro ao cadastrar servidor: " + (resultado.message || "Erro desconhecido"));
    }
  } catch (erro) {
  }
}

function limparFormulario() {
  document.getElementById("formServidor").reset();
}
document.addEventListener('DOMContentLoaded', function() {
  carregarSelects();
});