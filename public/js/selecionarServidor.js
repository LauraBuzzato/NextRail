function direcionaDash(nomeServidor) {
    localStorage.NOME_SERVIDOR = nomeServidor
    if (sessionStorage.CARGO_USUARIO == "Analista de infraestrutura") {
        window.location = "./dashboard.html"
    } else {
        window.location = "./dashboard.html"
    }
}

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
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}')">
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
                        <div>${servidor.estado} - ${servidor.logradouro} ${servidor.numero}</div>
                    </div>
                </div>
            `;
            } else {
                listaServidores += `
                <div class="card_servidor" style="border: 10px solid ${statusCor}" onclick="direcionaDash('${servidor.servidor}')">
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
                        <div>${servidor.estado} - ${servidor.logradouro} ${servidor.numero} - ${servidor.complemento}</div>
                    </div>
                </div>
            `;
            }

        }
        const linha_serv = document.getElementById("linha_card_serv");
        linha_serv.innerHTML = listaServidores;
    } catch (erro) {
        console.error("Erro ao buscar servidores:", erro);
    };
}
