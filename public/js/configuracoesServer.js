
var opcao = 0; // 0 = alerta | 1 = script | 2 = sla

function abrirScript() {
    opcao = 1;
    atualizarPagina();
}

function abrirSla() {
    opcao = 2;
    atualizarPagina();
}

function voltarParaAlerta() {
    opcao = 0;
    atualizarPagina();
}



function atualizarPagina() {

    const titulo = document.getElementById('tituloPagina');
    const botoes = document.getElementById('botoesTopo');
    const container = document.getElementById('configuracaoContainer');

    // limpa só o conteúdo de baixo
    container.innerHTML = '';
    container.appendChild(titulo);
    container.appendChild(botoes);

    if (opcao === 0) {
        titulo.innerHTML = "Configurar Parâmetros de Alerta";

        botoes.innerHTML = `
        <div id="botoesTopo" class="botoes-container">  
            <button onclick="abrirScript()" id="botaoScript">Configurar Script</button>
            <button onclick="abrirSla()" id="botaoSla">Configurar SLA</button>
        </div>
        `;

        carregarServidores(0);
    }

    if (opcao === 1) {
        titulo.innerHTML = "Configurar Parâmetros de Script";

        botoes.innerHTML = `
            <div id="botoesTopo" class="botoes-container">  
            <button onclick="voltarParaAlerta()" id="botaoAlerta">Configurar Alertas</button>
            <button onclick="abrirSla()" id="botaoSla">Configurar SLA</button>
            </div>
        `;

        carregarServidores(1);
    }

    if (opcao === 2) {
        titulo.innerHTML = "Configurar Parâmetros de SLA";

        botoes.innerHTML = `
            <div id="botoesTopo" class="botoes-container">  
            <button onclick="abrirScript()" id="botaoScript">Configurar Script</button>
            <button onclick="voltarParaAlerta()" id="botaoAlerta">Configurar Alertas</button>
            </div>
        `;

        carregarServidores(2);
    }
}


function carregarServidores(opcao) {
    console.log('Iniciando carregamento de servidores...');

    fetch('/servidores/listarServidores', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            console.log('Status da resposta:', response.status);
            console.log('URL da resposta:', response.url);

            if (!response.ok) {
                throw new Error('Erro ao carregar servidores: ' + response.status);
            }
            return response.json();
        })
        .then(servidores => {
            console.log('Servidores carregados:', servidores);
            exibirServidores(servidores, opcao);
        })
        .catch(error => {
            console.error('Erro ao carregar servidores:', error);
            const container = document.getElementById('configuracaoContainer');
            const erroDiv = document.createElement('div');
            erroDiv.className = 'sem-servidores';
            erroDiv.innerHTML = `
            <p>Erro ao carregar servidores. Verifique o console.</p>
            <p>URL tentada: /servidores/listarServidores</p>
        `;
            container.appendChild(erroDiv);
        });
}

function exibirServidores(servidores, opcao) {
    const container = document.getElementById('configuracaoContainer');

    const titulo = document.getElementById('tituloPagina');
    const botoesTopo = document.getElementById('botoesTopo');

    // limpar apenas a parte dos servidores
    container.innerHTML = "";

    container.appendChild(titulo);
    container.appendChild(botoesTopo);

    console.log('Todos os servidores:', servidores);

    // Filtra servidores
    const reguladores = servidores.filter(s =>
        s.tipo && s.tipo.toLowerCase().includes('regulador')
    );

    const ctcs = servidores.filter(s =>
        s.tipo && s.tipo.toLowerCase().includes('ctc')
    );

    console.log('Reguladores:', reguladores);
    console.log('CTCs:', ctcs);

    // Exibe reguladores
    if (reguladores.length > 0) {
        reguladores.forEach((servidor, index) => {
            const servidorDiv = criarContainerServidor(servidor, index + 1, 'Regulador', opcao);
            container.appendChild(servidorDiv);
        });
    }

    // Exibe CTCs
    if (ctcs.length > 0) {
        ctcs.forEach((servidor, index) => {
            const servidorDiv = criarContainerServidor(servidor, index + 1, 'CTC', opcao);
            container.appendChild(servidorDiv);
        });
    }

    // Se não houver servidores, exibe mensagem
    if (servidores.length === 0) {
        const mensagem = document.createElement('div');
        mensagem.className = 'sem-servidores';
        mensagem.innerHTML = `
            <p>Nenhum servidor cadastrado.</p>
            <a href="cadastroServidor.html" class="botao">Cadastrar Primeiro Servidor</a>
        `;
        container.appendChild(mensagem);
    }
}

function criarContainerServidor(servidor, numero, tipo, opcao) {
    if (opcao == 0) {

        const div = document.createElement('div');
        div.className = 'container_servidor';
        div.id = `servidor-${servidor.id}`;

        div.innerHTML = `
        <div class="linha_titulo">
            <div class="titulo_servidor">
                <h2>${servidor.nome}</h2>
                <span class="tipo_servidor">${servidor.tipo}</span>
                </div>
            <button class="botao" onclick="salvarConfiguracao(${servidor.id})">Salvar</button>
            </div>
        <div class="linha_servidor">
        <div class="alerta_componente">
                CPU:
                <div class="titulo_select">
                <label>Baixo:</label>
                    <select name="cpu_min_${servidor.id}" id="cpu_min_${servidor.id}" class="select_alerta">
                        ${gerarOpcoesPercentual()}
                    </select>
                    </div>
                    <div class="titulo_select">
                    <label>Médio:</label>
                    <select name="cpu_alr_${servidor.id}" id="cpu_alr_${servidor.id}">
                        ${gerarOpcoesPercentual()}
                        </select>
                        </div>
                        <div class="titulo_select">
                    <label>Alto:</label>
                    <select name="cpu_max_${servidor.id}" id="cpu_max_${servidor.id}">
                        ${gerarOpcoesPercentual()}
                    </select>
                    </div>
            </div>
            
            <div class="alerta_componente">
                RAM: 
                <div class="titulo_select">
                    <label>Baixo:</label>
                    <select name="ram_min_${servidor.id}" id="ram_min_${servidor.id}">
                    ${gerarOpcoesPercentual()}
                    </select>
                    </div>
                <div class="titulo_select">
                <label>Médio:</label>
                <select name="ram_alr_${servidor.id}" id="ram_alr_${servidor.id}">
                ${gerarOpcoesPercentual()}
                </select>
                </div>
                <div class="titulo_select">
                <label>Alto:</label>
                <select name="ram_max_${servidor.id}" id="ram_max_${servidor.id}">
                ${gerarOpcoesPercentual()}
                </select>
                </div>
                </div>
            
                <div class="alerta_componente">
                Disco: 
                <div class="titulo_select">
                    <label>Baixo:</label>
                    <select name="disco_min_${servidor.id}" id="disco_min_${servidor.id}">
                    ${gerarOpcoesPercentual()}
                    </select>
                </div>
                <div class="titulo_select">
                    <label>Médio:</label>
                    <select name="disco_alr_${servidor.id}" id="disco_alr_${servidor.id}">
                        ${gerarOpcoesPercentual()}
                        </select>
                </div>
                <div class="titulo_select">
                    <label>Alto:</label>
                    <select name="disco_max_${servidor.id}" id="disco_max_${servidor.id}">
                    ${gerarOpcoesPercentual()}
                    </select>
                    </div>
            </div>
            </div>
            `;

        // Carrega as configurações existentes após criar o container
        setTimeout(() => {
            carregarConfiguracoesServidor(servidor.id);
        }, 100);

        return div;
    }
    else if (opcao == 1) {
        const div = document.createElement('div');
        div.className = 'container_servidor_script';
        div.id = `servidor-${servidor.id}`;

        div.innerHTML = `
        <div class="linha_titulo_script">
            <div class="titulo_servidor_script">
                <h2>${servidor.nome}</h2>
                <span class="tipo_servidor">${servidor.tipo}</span>
            </div>
            <button class="botao_script" onclick="salvarConfiguracaoScript(${servidor.id})">Salvar</button>
        </div>
        <div class="linha_servidor_script">
            <div class="alerta_componente_script">
                <div class="titulo_select_script">
                    <label>Intervalo de leitura do script em segundos:</label>
                    <input type="number" id="intervalo_${servidor.id}">
                </div>
            </div>

            <div class="alerta_componente_script">
                <div class="titulo_select_script">
                    <label>Número de leituras consecutivas para a ocorrência de um alerta:</label>
                    <input type="number" id="leituras_consecutivas_${servidor.id}">
                </div>
            </div>
        </div>
    `;

        // Carrega as configurações existentes após criar o container
        setTimeout(() => {
            carregarScriptServidor(servidor.id);
        }, 100);

        return div;
    }






    else if (opcao == 2) { // CONFIGURAÇÃO DE SLA 
        const div = document.createElement('div');
        div.className = 'container_servidor';
        div.id = `servidor-sla-${servidor.id}`;

        div.style.cssText = "height: auto; min-height: 250px; align-items: center; justify-content: center;";

        div.innerHTML = `
        <div class="linha_titulo" style="width: 100%; margin-bottom: 30px;">
            <div class="titulo_servidor">
                <h2>${servidor.nome}</h2>
                <span class="tipo_servidor">${servidor.tipo}</span>
            </div>
            <button class="botao" onclick="salvarConfiguracaoSla(${servidor.id})">Salvar SLA</button>
        </div>
        
        <div class="linha_servidor" style="flex-direction: column; height: auto; width: 100%; gap: 10px; align-items: center;">
            
            <strong style="color: #ffe066; font-size: 1.3rem; margin-bottom: 20px;">Tempo Limite de Resolução (Minutos)</strong>

            <div style="display: flex; width: 90%; justify-content: space-around; gap: 20px;">
                
                <div class="titulo_select" style="flex: 1;">
                    <label style="color: #ffe066; margin-bottom: 10px; font-size: 1.3rem;">Baixo:</label>
                    <input type="number" id="sla_min_${servidor.id}" placeholder="min" style="text-align: center;">
                </div>

                <div class="titulo_select" style="flex: 1;">
                    <label style="color: #ffe066; margin-bottom: 10px; font-size: 1.3rem;">Médio:</label>
                    <input type="number" id="sla_alr_${servidor.id}" placeholder="min" style="text-align: center;">
                </div>

                <div class="titulo_select" style="flex: 1;">
                    <label style="color: #ffe066; margin-bottom: 10px; font-size: 1.3rem;">Alto:</label>
                    <input type="number" id="sla_max_${servidor.id}" placeholder="min" style="text-align: center;">
                </div>

            </div>
            <p style="color: #aaa; margin-top: 20px; font-size: 0.9rem;"> O tempo definido será aplicado a todos os componentes (CPU, RAM e Disco).</p>
        </div>
        `;

        setTimeout(() => {
            carregarConfiguracoesSla(servidor.id);
        }, 100);

        return div;
    }
}

function salvarConfiguracaoScript(servidorId) {
    const config = {
        servidorId: servidorId,
        configuracoes: {
            intervalo: parseInt(document.getElementById(`intervalo_${servidorId}`).value),
            leitura: parseInt(document.getElementById(`leituras_consecutivas_${servidorId}`).value)
        }
    };

    console.log(config)

    if (config.configuracoes.intervalo == null || config.configuracoes.intervalo == null
        || config.configuracoes.intervalo <= 0 || config.configuracoes.leitura <= 0) {
        alert('Deu erro ao salvar as configurações.')
        return;
    }

    console.log('Salvando configuração para servidor', servidorId, ':', config);

    fetch('/servidores/atualizarConfiguracaoScript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Todas as configurações salvas com sucesso!', data);
                alert(' Configurações salvas com sucesso!');
            } else {
                console.error('Erro ao salvar configurações:', data);
                alert(+ data.message);
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            alert('Erro de conexão ao salvar configurações.');
        });
}

function gerarOpcoesPercentual() {
    let options = '';
    for (let i = 5; i <= 100; i += 5) {
        options += `<option value="${i}">${i}%</option>`;
    }
    return options;
}

function salvarConfiguracao(servidorId) {
    const config = {
        servidorId: servidorId,
        configuracoes: {
            cpu: {
                baixo: document.getElementById(`cpu_min_${servidorId}`).value,
                medio: document.getElementById(`cpu_alr_${servidorId}`).value,
                alto: document.getElementById(`cpu_max_${servidorId}`).value
            },
            ram: {
                baixo: document.getElementById(`ram_min_${servidorId}`).value,
                medio: document.getElementById(`ram_alr_${servidorId}`).value,
                alto: document.getElementById(`ram_max_${servidorId}`).value
            },
            disco: {
                baixo: document.getElementById(`disco_min_${servidorId}`).value,
                medio: document.getElementById(`disco_alr_${servidorId}`).value,
                alto: document.getElementById(`disco_max_${servidorId}`).value
            }
        }
    };

    console.log('Salvando configuração para servidor', servidorId, ':', config);


    if (!validarOrdemFrontend(config.configuracoes)) {
        return;
    }

    fetch('/servidores/atualizarConfiguracaoAlerta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Todas as configurações salvas com sucesso!', data);
                alert(' Configurações salvas com sucesso!');
            } else {
                console.error('Erro ao salvar configurações:', data);
                alert(+ data.message);
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            alert('Erro de conexão ao salvar configurações.');
        });
}

function validarOrdemFrontend(configuracoes) {
    const validarComponente = (baixo, medio, alto, nomeComponente) => {
        if (parseInt(baixo) >= parseInt(medio)) {
            alert(`${nomeComponente}: Valor BAIXO (${baixo}%) deve ser MENOR que MÉDIO (${medio}%)`);
            return false;
        }
        if (parseInt(medio) >= parseInt(alto)) {
            alert(`${nomeComponente}: Valor MÉDIO (${medio}%) deve ser MENOR que ALTO (${alto}%)`);
            return false;
        }
        if (parseInt(baixo) >= parseInt(alto)) {
            alert(`${nomeComponente}: Valor BAIXO (${baixo}%) deve ser MENOR que ALTO (${alto}%)`);
            return false;
        }
        return true;
    };

    if (!validarComponente(configuracoes.cpu.baixo, configuracoes.cpu.medio, configuracoes.cpu.alto, 'CPU')) return false;
    if (!validarComponente(configuracoes.ram.baixo, configuracoes.ram.medio, configuracoes.ram.alto, 'RAM')) return false;
    if (!validarComponente(configuracoes.disco.baixo, configuracoes.disco.medio, configuracoes.disco.alto, 'Disco')) return false;

    return true;
}

function salvarMetrica(servidorId, componente, gravidade, valor) {
    return fetch('/servidores/atualizarConfiguracaoAlerta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            servidorId: servidorId,
            componente: componente,
            gravidade: gravidade,
            valor: valor
        })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }
            return data;
        });
}

function carregarConfiguracoesServidor(servidorId) {
    fetch(`/servidores/configuracoes/${servidorId}`)
        .then(response => response.json())
        .then(configuracoes => {
            console.log('Configurações carregadas para servidor', servidorId, ':', configuracoes);
            preencherSelects(servidorId, configuracoes);
        })
        .catch(error => {
            console.error('Erro ao carregar configurações:', error);
        });
}

function preencherSelects(servidorId, configuracoes) {
    const configPorComponente = {};
    configuracoes.forEach(config => {
        if (!configPorComponente[config.componente]) {
            configPorComponente[config.componente] = {};
        }
        configPorComponente[config.componente][config.gravidade_id] = config.valor;
    });

    preencherSelectComponente(servidorId, 'CPU', configPorComponente['Cpu']);
    preencherSelectComponente(servidorId, 'Memória RAM', configPorComponente['Ram']);
    preencherSelectComponente(servidorId, 'Disco Rígido', configPorComponente['Disco']);
}

function preencherSelectComponente(servidorId, componente, valores) {
    if (!valores) return;

    console.log(`Preenchendo selects para ${componente} do servidor ${servidorId}:`, valores);
    const mapeamento = {
        1: 'min',  // baixo
        2: 'alr',  // medio  
        3: 'max'   // alto
    };

    Object.keys(valores).forEach(gravidade => {
        const sufixo = mapeamento[gravidade];

        let selectId;
        if (componente === 'CPU') {
            selectId = `cpu_${sufixo}_${servidorId}`;
        } else if (componente === 'Memória RAM') {
            selectId = `ram_${sufixo}_${servidorId}`;
        } else if (componente === 'Disco Rígido') {
            selectId = `disco_${sufixo}_${servidorId}`;
        }

        const selectElement = document.getElementById(selectId);

        if (selectElement) {
            selectElement.value = valores[gravidade];
            console.log(` Preenchendo ${selectId} com valor:`, valores[gravidade]);
        } else {
            console.warn(`Select não encontrado: ${selectId}`);

            const allSelects = document.querySelectorAll('select');
            const availableIds = Array.from(allSelects).map(select => select.id).filter(id => id.includes(servidorId));
            console.log(`Selects disponíveis para servidor ${servidorId}:`, availableIds);
        }
    });
}

function carregarScriptServidor(servidorId) {
    fetch(`/servidores/script/${servidorId}`)
        .then(response => response.json())
        .then(configuracoes => {
            console.log('Configurações carregadas para servidor', servidorId, ':', configuracoes);
            preencherInputs(servidorId, configuracoes);
        })
        .catch(error => {
            console.error('Erro ao carregar configurações:', error);
        });
}

function preencherInputs(servidorId, configuracoes) {
    document.getElementById(`intervalo_${servidorId}`).value = configuracoes[0].intervalo
    document.getElementById(`leituras_consecutivas_${servidorId}`).value = configuracoes[0].leituras
}



function carregarConfiguracoesSla(servidorId) {
    fetch(`/servidores/configuracoes/${servidorId}`)
        .then(response => response.json())
        .then(configuracoes => {
            console.log('Carregando SLA:', configuracoes);

            const configBaixo = configuracoes.find(c => c.gravidade_id == 1);
            const configMedio = configuracoes.find(c => c.gravidade_id == 2);
            const configAlto = configuracoes.find(c => c.gravidade_id == 3);

            const inputBaixo = document.getElementById(`sla_min_${servidorId}`);
            const inputMedio = document.getElementById(`sla_alr_${servidorId}`);
            const inputAlto = document.getElementById(`sla_max_${servidorId}`);

            //Baixo
            if (inputBaixo) {
                if (configBaixo && configBaixo.sla) {
                    inputBaixo.value = configBaixo.sla;
                } else {
                    inputBaixo.value = 0;
                }
            }

            //Médio
            if (inputMedio) {
                if (configMedio && configMedio.sla) {
                    inputMedio.value = configMedio.sla;
                } else {
                    inputMedio.value = 0;
                }
            }

            //Alto
            if (inputAlto) {
                if (configAlto && configAlto.sla) {
                    inputAlto.value = configAlto.sla;
                } else {
                    inputAlto.value = 0;
                }
            }

        })
        .catch(erro => console.error("Erro ao carregar SLA:", erro));
}

function salvarConfiguracaoSla(servidorId) {
    const dadosSla = {
        servidorId: servidorId,
        baixo: document.getElementById(`sla_min_${servidorId}`).value,
        medio: document.getElementById(`sla_alr_${servidorId}`).value,
        alto: document.getElementById(`sla_max_${servidorId}`).value
    };

    console.log("Enviando SLA Global para salvar:", dadosSla);

    fetch('/servidores/atualizarSla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosSla)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('SLA atualizado com sucesso para todos os componentes!');
            } else {
                alert('Erro: ' + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Erro ao salvar SLA.');
        });
}