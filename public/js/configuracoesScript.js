function carregarServidores() {
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
        exibirServidores(servidores);
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

function exibirServidores(servidores) {
    const container = document.getElementById('configuracaoContainer');
    
    // Remove o conteúdo existente, mantendo apenas o título
    const titulo = container.querySelector('h1');
    container.innerHTML = '';
    container.appendChild(titulo);

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
            const servidorDiv = criarContainerServidor(servidor, index + 1, 'Regulador');
            container.appendChild(servidorDiv);
        });
    }

    // Exibe CTCs
    if (ctcs.length > 0) {
        ctcs.forEach((servidor, index) => {
            const servidorDiv = criarContainerServidor(servidor, index + 1, 'CTC');
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

function criarContainerServidor(servidor, numero, tipo) {
    const div = document.createElement('div');
    div.className = 'container_servidor_script';
    div.id = `servidor-${servidor.id}`;
    
    div.innerHTML = `
        <div class="linha_titulo_script">
            <div class="titulo_servidor_script">
                <h2>${servidor.nome}</h2>
                <span class="tipo_servidor">${servidor.tipo}</span>
            </div>
            <button class="botao_script" onclick="salvarConfiguracao(${servidor.id})">Salvar</button>
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
    /*setTimeout(() => {
        carregarConfiguracoesServidor(servidor.id);
    }, 100);*/
    
    return div;
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
            intervalo: parseInt(document.getElementById(`intervalo_${servidorId}`).value),
            leitura: parseInt(document.getElementById(`leituras_consecutivas_${servidorId}`).value)
        }
    };

    console.log(config)

    if (config.configuracoes.intervalo == null || config.configuracoes.intervalo == null
        || config.configuracoes.intervalo <= 0 || config.configuracoes.leitura <= 0){
            console.log('Deu erro ao salvar as configurações.')
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
            alert( + data.message); 
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