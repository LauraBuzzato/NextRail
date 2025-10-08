#pip install python-dotenv
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import psutil as ps
import pandas as pd
import time
import os
from psutil._common import bytes2human
import platform
import hashlib
#pip install slack_sdk
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
#pip install requests
import requests 
from requests.auth import HTTPBasicAuth

load_dotenv(dotenv_path=".env.dev")

INTERVALO_COLETA = 10

DATA_PATH = 'data/'
CSV_PATH = 'data/machine_data.csv'
SLACK_TOKEN = os.getenv("SLACK_TOKEN")
JIRA_URL = os.getenv("JIRA_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_TOKEN = os.getenv("JIRA_TOKEN")
PROJETO_KEY = os.getenv("PROJETO_KEY")
ISSUE_TYPE = os.getenv("ISSUE_TYPE")


CLIENTE = WebClient(token=SLACK_TOKEN)

jira_url = JIRA_URL
jira_email = JIRA_EMAIL
jira_token = JIRA_TOKEN
projeto_key = PROJETO_KEY
issue_type = ISSUE_TYPE

ultimoAlertaJira = None
ultimoAlerta = None

while True:
    inicio_ciclo = time.time()
    
    cpu_percent = ps.cpu_percent(interval=0.1, percpu=False)

    mem = ps.virtual_memory()
    mem_percent = mem.percent
    mem_avl = bytes2human(mem.available)
    
    disk = ps.disk_usage('/')
    disk_percent = disk.percent
    disk_avl = bytes2human(disk.free)

    timestamp = datetime.now()

    current_hour = timestamp.hour

    validaPico = False

    if current_hour >= 6 and current_hour < 14:
        validaPico = True
    elif current_hour >= 15 and current_hour < 20:
        validaPico = True
    else:
        validaPico = False
    
    # Tive que fazer minhas alterações devido ao meus sistema operacional Linux
    #Esse comando faz com que pegue todos os processos do meu computador
    processos = len(ps.pids())

    def generate_software_machine_id():
        os_info = platform.platform()
        node_name = platform.node()
        processor_info = platform.processor()
        unique_string = os_info + node_name + processor_info
        machine_id = hashlib.sha256(unique_string.encode()).hexdigest()
        return machine_id

    machine_id = generate_software_machine_id()

    new_row = pd.DataFrame({
        'id': [machine_id],
        'servidor': [platform.node()],
        'timestamp': [timestamp],
        'horario_de_pico': [validaPico],
        'cpu_percent': [cpu_percent],
        'memory_percent': [mem_percent],
        'memory_available': [mem_avl],
        'processos_ativos': [processos],
        'disk_percent': [disk_percent],
        'disk_avl': [disk_avl]
    })

    print(new_row)

    if os.path.exists(DATA_PATH):
        new_row.to_csv(CSV_PATH, mode="a", sep=';', encoding='utf-8', index=False, header=False)
    else:
        os.mkdir(DATA_PATH)
        new_row.to_csv(CSV_PATH, mode="a", sep=';', encoding='utf-8', index=False, header=True)


    # --- ALERTAS ---
    if cpu_percent > 25 or mem_percent > 25 or disk_percent > 25: #aqui vai pegar os parâmetros do BD
        
        alerta = (
            f"⚠️ Alerta de uso elevado detectado!\n"
            f"ID servidor: {machine_id}\n"
            f"Servidor: {platform.node()}\n"
            f"Horário: {timestamp}\n"
            f"Horário de Pico: {validaPico}\n"
            f"CPU: {cpu_percent}%\n"
            f"RAM: {mem_percent}%\n"
            f"RAM Disponível: {mem_avl}\n"
            f"Disco: {disk_percent}%"
            f"Disco Disponível: {disk_avl}\n"
            f"Processos Ativos: {processos}\n"
            
        )

        if not ultimoAlerta or (timestamp - ultimoAlerta) >= timedelta(minutes=15):
            
            # Slack
            
            try:
                CLIENTE.chat_postMessage(channel="#alertas", text=alerta)
                print("Alerta enviado para o Slack.")
            except SlackApiError as e:
                print("Erro ao enviar alerta:", e.response["error"])

            ultimoAlerta = timestamp
        
        if not ultimoAlertaJira or (timestamp - ultimoAlertaJira) >= timedelta(hours=1):
            # Jira
            

            dados = {
                "fields": {
                    "project": {"key": projeto_key},
                    "summary": f"Alerta Máquina {platform.node()} - Uso elevado ({timestamp.strftime('%Y-%m-%d %H:%M:%S')})",
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {"type": "text", "text": alerta}
                                ]
                            }
                        ]
                    },
                    "issuetype": {"name": issue_type}
                }
            }

            try:
                response = requests.post(
                    jira_url,
                    json=dados,
                    auth=HTTPBasicAuth(jira_email, jira_token),
                    headers={"Accept": "application/json", "Content-Type": "application/json"},
                )
                if response.status_code == 201:
                    print(f"Chamado criado no Jira: {response.json()['key']}")
                else:
                    print(f"Erro ao criar chamado: {response.status_code} - {response.text}")
            except Exception as e:
                print("Erro ao conectar com Jira:", str(e))
            ultimoAlertaJira = timestamp

    fim_ciclo = time.time()
    duracao = fim_ciclo - inicio_ciclo
    if duracao < INTERVALO_COLETA:
        time.sleep(INTERVALO_COLETA - duracao)
