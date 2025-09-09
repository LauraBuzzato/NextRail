import psutil
import pandas as pd
import datetime
import time
import os  ## serve para comunicar com SO. EX: "os.mkdir("minhapasta")"


lista_captura = []

def metricas():
    hour = datetime.datetime.now().strftime("%d/%m/%y %H:%M:%S")

    # Usuário 
    usuario = os.getlogin()
 

    # Uso de CPU/RAM/SWAP/Disco
    cpu_porcentagem_all = psutil.cpu_percent(interval=0.1)
    ram = psutil.virtual_memory()
    disc = psutil.disk_usage("/")

    ram_porcentagem = ram.percent
    disc_porcentagem_usando = disc.percent

    # Temperatura
    try:
        sensor = psutil.sensors_temperatures()
    except:
        sensor=None
        
    #Modificar o nome do cpu e disco
    try:
        disc_temp_atual = sensor["nvme"][0].current
        cpu_temp = sensor["coretemp"][0].current
    except:
        cpu_temp=None
        disc_temp_atual=None

    captura = {
        "Usuario": usuario,
        "Data": hour,
        "CPU": {
            "Uso(%)": cpu_porcentagem_all,
            "Temp(°C)": cpu_temp
        },
        "RAM": {"Uso(%)": ram_porcentagem},
        "Disco": {"Uso(%)": disc_porcentagem_usando,
                  "Temp(°C)": disc_temp_atual}
    }

    lista_captura.append(captura)
    salvar_csv(captura)

    print(
        f"Captura em {hour} por {usuario}:\n"
        f"  CPU: {cpu_porcentagem_all}% | Temp: {cpu_temp} °C\n"
        f"  RAM: {ram_porcentagem}%\n"
        f"  Disco: {disc_porcentagem_usando}% | Temp: {disc_temp_atual} °C\n"
    )


def salvar_csv(captura):
    df = pd.json_normalize([captura])
    df.to_csv(
        "captura.csv",
        mode="a",
        header=not os.path.exists("captura.csv"),
        encoding="utf-8",
        index=False
    )


# Loop contínuo
intervalo_segundos = 3
while True:
    metricas()
    time.sleep(intervalo_segundos)