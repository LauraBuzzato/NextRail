function direcionaDash(nomeServidor, id) {
    localStorage.ID_SERVIDOR = id
    localStorage.NOME_SERVIDOR = nomeServidor
    console.log(id);
    
    if (id >= 1) {
            window.location = "./dashboard.html"
    } else {
        window.location = "./selecionarServidor.html"
    }

}

let corescards = []

async function listarServidor() {
    try {
        const [alertas, servidores] = await Promise.all([
            fetch('/servidores/listarAlertas', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json()),
            fetch('/servidores/selecionarServidores', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA
                })
            }).then(res => res.json())
        ])
        let listaServidores = '';
        let totalEmAlerta = 0

        console.log(servidores);
        console.log(alertas);

        for (let i = 0; i < servidores.length; i++) {
            let servidor = servidores[i];
            let status = '<p>Sem Alertas</p>';
            let statusCor = 'green';
            let statusDesc = '';
            let corCPU = 'green';
            let corRAM = 'green';
            let corDISCO = 'green';

            let cpuAlertas = 0;
            let ramAlertas = 0;
            let discoAlertas = 0;

            for (let j = 0; j < alertas.length; j++) {
                let alerta = alertas[j]
                if (alerta.servidor == servidor.servidor && alerta.status != 'Fechado') {
                    status = '<p>Componentes em alerta:</p>';


                    if (alerta.gravidade == "Alto") {
                        statusCor = 'red';
                    } else if (alerta.gravidade == "Médio" && statusCor != 'red') {
                        statusCor = 'darkorange';
                    } else if (alerta.gravidade == "Baixo" && statusCor != 'red' && statusCor != 'darkorange') {
                        statusCor = 'yellow';
                    }

                    if (alerta.componente == 'Cpu') {
                        cpuAlertas++;
                        console.log(alerta.componente);
                        console.log(alerta.gravidade);


                        if (alerta.gravidade == "Alto") {
                            corCPU = 'red';
                        } else if (alerta.gravidade == "Médio") {
                            corCPU = 'darkorange';
                        } else if (alerta.gravidade == "Baixo") {
                            corCPU = 'yellow';
                        }
                    } else if (alerta.componente == 'Ram') {
                        ramAlertas++;
                        if (alerta.gravidade == "Alto") {
                            corRAM = 'red';
                        } else if (alerta.gravidade == "Médio" && corRAM != 'red') {
                            corRAM = 'darkorange';
                        } else if (alerta.gravidade == "Baixo" && corRAM != 'red' && corRAM != 'darkorange') {
                            corCPU = 'yellow';
                        }
                    } else if (alerta.componente == 'Disco') {
                        discoAlertas++;
                        if (alerta.gravidade == "Alto") {
                            corDISCO = 'red';
                        } else if (alerta.gravidade == "Médio" && corDISCO != 'red') {
                            corDISCO = 'darkorange';
                        } else if (alerta.gravidade == "Baixo" && corDISCO != 'red' && corDISCO != 'darkorange') {
                            corDISCO = 'yellow';
                        }
                    }
                }
            }


            //Novo
            if (status != '<p>Sem Alertas</p>') {

                let textoCpu = 'alertas';
                let textoRam = 'alertas';
                let textoDisco = 'alertas';


                if (cpuAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Cpu </b><div class="circulo1"><svg width="30px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corCPU}></circle></div> </g></svg></div></div>`

                }
                if (ramAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Ram  </b><div class="circulo2"><svg width="30px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corRAM}></circle></div> </g></svg></div></div>`
                }
                if (discoAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Disco </b><div class="circulo3"><svg width="20px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corDISCO}></circle></div> </g></svg></div></div>`
                }
            }

            if (statusCor != 'green') {
                totalEmAlerta++
            }
            servidorNome = servidor.servidor
            corescards.push({ servidorNome, statusCor })


            if (servidor.complemento == null) {
                listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}', '${servidor.id}')">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        ${status}
                        ${statusDesc}
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro}, ${servidor.numero}</div>
                    </div>
                </div>
            `;
            } else {
                listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}', '${servidor.id}')">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        ${status}
                        ${statusDesc}
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro}, ${servidor.numero} - ${servidor.complemento}</div>
                    </div>
                </div>
            `;
            }

        }
        const linha_serv = document.getElementById("linha_card_serv");
        linha_serv.innerHTML = listaServidores;
        const numero_quantidade = document.getElementById("numQtd");
        if (totalEmAlerta == 0) {
            numero_quantidade.innerHTML = `<h1 style="color: green;">${totalEmAlerta}</h1>`
        } else {
            numero_quantidade.innerHTML = `<h1 style="color: red;">${totalEmAlerta}</h1>`
        }
    } catch (erro) {
        console.error("Erro ao buscar servidores:", erro);
    };
}

async function contarAlertas() {
    try {
        const [qtdAlertas] = await Promise.all([
            fetch('/servidores/contarAlertas', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA
                })
            }).then(res => res.json())
        ]);

        if (qtdAlertas[0].totalAlerta == 0) {
            numAlertas.innerHTML = `<h1 style="color: green;">${qtdAlertas[0].totalAlerta}</h1>`
        } else {
            numAlertas.innerHTML = `<h1 style="color: red;">${qtdAlertas[0].totalAlerta}</h1>`
        }


    } catch (erro) {
        console.error("Erro ao carregar gráficos:", erro);
    }
}

let grafico;



async function carregarGraficos() {
    try {
        const [alertas, servidores, top3] = await Promise.all([
            fetch('/servidores/listarAlertas', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json()),
            fetch('/servidores/selecionarServidores', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json()),
            fetch('/servidores/listartop3', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json())
        ]);

        const corescards = [];

        for (let i = 0; i < servidores.length; i++) {
            const servidor = servidores[i];
            let statusCor = 'green';

            for (let j = 0; j < alertas.length; j++) {
                const alerta = alertas[j];
                if (alerta.servidor === servidor.servidor && alerta.status !== 'Fechado') {
                    if (alerta.gravidade === "Alto") {
                        statusCor = 'red';
                        break;
                    } else if (alerta.gravidade === "Médio") {
                        statusCor = 'darkorange';
                    } else if (alerta.gravidade === "Baixo" && statusCor !== 'darkorange') {
                        statusCor = 'yellow';
                    }
                }
            }

            corescards.push({
                servidorNome: servidor.servidor,
                statusCor
            });
        }

        let nomes = [];
        const quantidades = [];
        const coresGraficos = [];

        for (let i = 0; i < top3.length; i++) {
            const servidorTop = top3[i];
            nomes.push(servidorTop.nome);
            quantidades.push(servidorTop.totalAlerta);

            let corEncontrada = '#555';
            for (let j = 0; j < corescards.length; j++) {
                if (corescards[j].servidorNome === servidorTop.nome) {
                    corEncontrada = corescards[j].statusCor;
                    break;
                }
            }
            coresGraficos.push(corEncontrada);
        }

        const ctx = document.getElementById('topservidoresalertas');
        const container = ctx.parentElement;


        if (grafico) {
            grafico.destroy();
            grafico = null;
        }


        const msgExistente = container.querySelector('.msg-sem-servidores');
        if (msgExistente) msgExistente.remove();


        if (nomes.length === 0) {
            const msg = document.createElement('h1');
            msg.textContent = 'Sem servidores com alertas';
            msg.classList.add('msg-sem-servidores');
            msg.style.textAlign = 'center';
            msg.style.fontSize = '2.0rem';
            msg.style.color = 'green';
            msg.style.marginTop = '-130px';
            container.appendChild(msg);
            return;
        }


        grafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: nomes,
                datasets: [{
                    label: 'Alertas Registrados',
                    data: quantidades,
                    backgroundColor: coresGraficos,
                    borderColor: coresGraficos,
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.parsed.y} alertas`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade alertas',
                            color: '#fff',
                            font: { size: 22 }
                        },
                        ticks: {
                            color: '#fff',
                            font: { size: 18 }
                        },
                        grid: { color: '#333' }
                    },
                    x: {
                        ticks: {
                            color: '#fff',
                            font: { size: 18 }
                        }
                    }
                }
            }
        });

    } catch (erro) {
        console.error("Erro ao carregar gráficos:", erro);
    }
}





async function listarServidorEspecifico(estado) {
    try {
        const [alertas, servidores] = await Promise.all([
            fetch('/servidores/listarAlertas', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json()),
            fetch('/servidores/selecionarServidores', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA
                })
            }).then(res => res.json())
        ])
        let listaServidores = '';

        console.log(servidores);
        console.log(alertas);

        for (let i = 0; i < servidores.length; i++) {
            let servidor = servidores[i];
            let status = '<p>Sem Alertas</p>';
            let statusCor = 'green';
            let statusDesc = '';
            let corCPU = 'green';
            let corRAM = 'green';
            let corDISCO = 'green';

            let cpuAlertas = 0;
            let ramAlertas = 0;
            let discoAlertas = 0;

            for (let j = 0; j < alertas.length; j++) {
                let alerta = alertas[j]
                if (alerta.servidor == servidor.servidor && alerta.status != 'Fechado') {
                    status = '<p>Componentes em alerta:</p>';


                    if (alerta.gravidade == "Alto") {
                        statusCor = 'red';
                    } else if (alerta.gravidade == "Médio" && statusCor != 'red') {
                        statusCor = 'darkorange';
                    } else if (alerta.gravidade == "Baixo" && statusCor != 'red' && statusCor != 'darkorange') {
                        statusCor = 'yellow';
                    }

                    if (alerta.componente == 'Cpu') {
                        cpuAlertas++;
                        console.log(alerta.componente);
                        console.log(alerta.gravidade);


                        if (alerta.gravidade == "Alto") {
                            corCPU = 'red';
                        } else if (alerta.gravidade == "Médio") {
                            corCPU = 'darkorange';
                        } else if (alerta.gravidade == "Baixo") {
                            corCPU = 'yellow';
                        }
                    } else if (alerta.componente == 'Ram') {
                        ramAlertas++;
                        if (alerta.gravidade == "Alto") {
                            corRAM = 'red';
                        } else if (alerta.gravidade == "Médio" && corRAM != 'red') {
                            corRAM = 'darkorange';
                        } else if (alerta.gravidade == "Baixo" && corRAM != 'red' && corRAM != 'darkorange') {
                            corCPU = 'yellow';
                        }
                    } else if (alerta.componente == 'Disco') {
                        discoAlertas++;
                        if (alerta.gravidade == "Alto") {
                            corDISCO = 'red';
                        } else if (alerta.gravidade == "Médio" && corDISCO != 'red') {
                            corDISCO = 'darkorange';
                        } else if (alerta.gravidade == "Baixo" && corDISCO != 'red' && corDISCO != 'darkorange') {
                            corDISCO = 'yellow';
                        }
                    }
                }
            }



            if (status != '<p>Sem Alertas</p>') {

                let textoCpu = 'alertas';
                let textoRam = 'alertas';
                let textoDisco = 'alertas';


                if (cpuAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Cpu </b><div class="circulo1"><svg width="30px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corCPU}></circle></div> </g></svg></div></div>`

                }
                if (ramAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Ram  </b><div class="circulo2"><svg width="30px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corRAM}></circle></div> </g></svg></div></div>`
                }
                if (discoAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Disco </b><div class="circulo3"><svg width="20px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corDISCO}></circle></div> </g></svg></div></div>`
                }
            }

            if (estado == statusCor) {
                if (servidor.complemento == null) {
                    listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}', '${servidor.id}')">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        ${status}
                        ${statusDesc}
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro}, ${servidor.numero}</div>
                    </div>
                </div>
            `;
                } else {
                    listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}', '${servidor.id}')">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        ${status}
                        ${statusDesc}
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro}, ${servidor.numero} - ${servidor.complemento}</div>
                    </div>
                </div>
            `;
                }
            }



        }
        const linha_serv = document.getElementById("linha_card_serv");
        linha_serv.innerHTML = listaServidores;
        const traco = document.getElementById("mostrarTodosTraco");
        mostrarTodos.innerHTML = `<p>Mostrar todos</p>`
        traco.style.display = "block"

    } catch (erro) {
        console.error("Erro ao buscar servidores:", erro);
    };
}

async function listarServidorTodos() {
    try {
        const [alertas, servidores] = await Promise.all([
            fetch('/servidores/listarAlertas', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idempresa: sessionStorage.ID_EMPRESA })
            }).then(res => res.json()),
            fetch('/servidores/selecionarServidores', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idempresa: sessionStorage.ID_EMPRESA
                })
            }).then(res => res.json())
        ])
        let listaServidores = '';

        console.log(servidores);
        console.log(alertas);

        for (let i = 0; i < servidores.length; i++) {
            let servidor = servidores[i];
            let status = '<p>Sem Alertas</p>';
            let statusCor = 'green';
            let statusDesc = '';
            let corCPU = 'green';
            let corRAM = 'green';
            let corDISCO = 'green';

            let cpuAlertas = 0;
            let ramAlertas = 0;
            let discoAlertas = 0;

            for (let j = 0; j < alertas.length; j++) {
                let alerta = alertas[j]
                if (alerta.servidor == servidor.servidor && alerta.status != 'Fechado') {
                    status = '<p>Componentes em alerta:</p>';


                    if (alerta.gravidade == "Alto") {
                        statusCor = 'red';
                    } else if (alerta.gravidade == "Médio" && statusCor != 'red') {
                        statusCor = 'darkorange';
                    } else if (alerta.gravidade == "Baixo" && statusCor != 'red' && statusCor != 'darkorange') {
                        statusCor = 'yellow';
                    }

                    if (alerta.componente == 'Cpu') {
                        cpuAlertas++;
                        console.log(alerta.componente);
                        console.log(alerta.gravidade);


                        if (alerta.gravidade == "Alto") {
                            corCPU = 'red';
                        } else if (alerta.gravidade == "Médio") {
                            corCPU = 'darkorange';
                        } else if (alerta.gravidade == "Baixo") {
                            corCPU = 'yellow';
                        }
                    } else if (alerta.componente == 'Ram') {
                        ramAlertas++;
                        if (alerta.gravidade == "Alto") {
                            corRAM = 'red';
                        } else if (alerta.gravidade == "Médio" && corRAM != 'red') {
                            corRAM = 'darkorange';
                        } else if (alerta.gravidade == "Baixo" && corRAM != 'red' && corRAM != 'darkorange') {
                            corCPU = 'yellow';
                        }
                    } else if (alerta.componente == 'Disco') {
                        discoAlertas++;
                        if (alerta.gravidade == "Alto") {
                            corDISCO = 'red';
                        } else if (alerta.gravidade == "Médio" && corDISCO != 'red') {
                            corDISCO = 'darkorange';
                        } else if (alerta.gravidade == "Baixo" && corDISCO != 'red' && corDISCO != 'darkorange') {
                            corDISCO = 'yellow';
                        }
                    }
                }
            }


            //Novo
            if (status != '<p>Sem Alertas</p>') {

                let textoCpu = 'alertas';
                let textoRam = 'alertas';
                let textoDisco = 'alertas';


                if (cpuAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Cpu </b><div class="circulo1"><svg width="30px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corCPU}></circle></div> </g></svg></div></div>`

                }
                if (ramAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Ram  </b><div class="circulo2"><svg width="30px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corRAM}></circle></div> </g></svg></div></div>`
                }
                if (discoAlertas >= 1) {
                    statusDesc += `<div class="carac_alerta"><div><b>Disco </b><div class="circulo3"><svg width="20px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="8" cy="8" r="8" fill=${corDISCO}></circle></div> </g></svg></div></div>`
                }
            }


            if (servidor.complemento == null) {
                listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}', '${servidor.id}')">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        ${status}
                        ${statusDesc}
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro}, ${servidor.numero}</div>
                    </div>
                </div>
            `;
            } else {
                listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}', '${servidor.id}')">
                    <h3>${servidor.servidor}</h3>
                    <div class="carac_servidor">
                        ${status}
                        ${statusDesc}
                    </div>
                    <div class="carac_servidor">
                        <p>Tipo:</p>
                        <div>${servidor.tipo}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>SO:</p>
                        <div>${servidor.so}</div>
                    </div>
                    <div class="carac_servidor">
                        <p>Endereço:</p>
                        <div>${servidor.estado} - ${servidor.logradouro}, ${servidor.numero} - ${servidor.complemento}</div>
                    </div>
                </div>
            `;
            }

        }
        const linha_serv = document.getElementById("linha_card_serv");
        linha_serv.innerHTML = listaServidores;
        const traco = document.getElementById("mostrarTodosTraco");
        mostrarTodos.innerHTML = ``
        traco.style.display = "none"
    } catch (erro) {
        console.error("Erro ao buscar servidores:", erro);
    };
}