import psutil
import pandas as pd
import datetime
import time
import os


lista_captura = []
contagem = 0

def metricas():

 
 conversor_gigabyte = 1024**3
 ram = psutil.virtual_memory()
 sensor = psutil.sensors_temperatures()
 swap = psutil.swap_memory()
 time_now = datetime.datetime.now()
 hour = time_now.strftime("%d/%m/%y %H:%M:%S")

#RAM
 ram_total = round(float(ram.total)/conversor_gigabyte,2)
 ram_livre = round(float((ram.free)/conversor_gigabyte),2)
 ram_usando = round(float((ram.used)/conversor_gigabyte),2)
# SWAP
 memoria_swap_total = round(swap.total/conversor_gigabyte, 2)
 memoria_swap_usando = round(swap.used/conversor_gigabyte, 2)
 memoria_swap_livre =round(swap.free/conversor_gigabyte, 2)

# CPU
 cpu_core = psutil.cpu_count(logical=False)
 cpu_core_logical = psutil.cpu_count()
 cpu_porcentagem_all = psutil.cpu_percent(interval= 0.1)
 cpu_hotspot = sensor['coretemp'][0].critical
 cpu_temperature_atual = sensor["coretemp"][0].current
 
 #DISCO
 disc = psutil.disk_usage("/")
 disc_total = round(disc.total/conversor_gigabyte)
 disc_usando = round(disc.used/conversor_gigabyte)
 disc_livre = round(disc.free/conversor_gigabyte)
 disc_porcentagem_usando = disc.percent
 disc_temp_atual = sensor["nvme"][0].current
 disc_hotspot = sensor['nvme'][0].critical
 
 

 ## lista de dados capturados sla se vamos usar isso 
 captura ={
    "CPU":{
        "Uso": cpu_porcentagem_all, 
        "Temperatura": cpu_temperature_atual,
        "Hotspot": cpu_hotspot},
    "RAM": {
       "Total":ram_total,
       "Uso":ram_usando,
       "livre":ram_livre},
    "SWAP":{
       "Total":memoria_swap_total,
       "Uso":memoria_swap_usando,
       "livre":memoria_swap_livre},
    "Disco":{
       "Total": disc_total,
       "Uso": disc_usando,
       "Livre": disc_livre,
       "Porcentagem de Uso": disc_porcentagem_usando,
       "Temperature": disc_temp_atual,
       "Hotspot": disc_hotspot},
    "Data": hour}
 lista_captura.append(captura)
 
 salvar_csv(captura)
 

## Print para acompanhar a  captura 
 print(
 f"======================= CAPTURA: {contagem}° ==========================\n"
 f"CPU:\n"
 f"  Cores: {cpu_core}\n"
 f"  Virtual Core: {cpu_core_logical}\n"
 f"  Percent Using: {cpu_porcentagem_all} %\n"
 f"  Temperature:{cpu_temperature_atual} °C\n"
 f"  CPU hotspot: {cpu_hotspot} °C\n"
 f"RAM:\n"
 f"  Total: {ram_total} GiB\n "
 f"  Used: {ram_usando} GiB\n "
 f"  Free: {ram_livre} GiB\n\n "
 f"SWAP:\n"
 f"  Total: {memoria_swap_total} GiB\n "
 f"  Used: {memoria_swap_usando} GiB\n "
 f"  Free: {memoria_swap_livre} GiB\n\n "
 f"Disc:\n"
 f"  Total: {disc_total} GiB\n "
 f"  Used: {disc_usando} GiB\n "
 f"  Free: {disc_livre} GiB\n "
 f"  Porcent Using: {disc_porcentagem_usando}% \n"
 f"  Temperature:{disc_temp_atual} °C\n"
 f"  Hotspot: {disc_hotspot} °C\n"
 f"  dttime Captura: {hour}\n")
 
## aqui crio o CSV 

def salvar_csv(captura):
    df = pd.json_normalize([captura])  # transforma o dict em 1 linha
    df.to_csv(
         
        "captura.csv",
        sep=";",
        mode="a",  # append
        header=not os.path.exists("captura.csv"),  # só escreve cabeçalho 1x
        encoding="utf-8")

# Criando loop usei threading pq a biblioteca diz funcionar em segundo plano sla se vai ser interessante 

intervalo_segundos = 3
while True:
    
    contagem += 1
    os.system("clear")
    metricas()    
    time.sleep(intervalo_segundos)