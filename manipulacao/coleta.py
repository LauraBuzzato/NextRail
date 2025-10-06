from datetime import datetime
import psutil as ps
import pandas as pd
import time
import os
from psutil._common import bytes2human
import platform
import hashlib

DATA_PATH = 'data/'
CSV_PATH = 'data/machine_data.csv'

while True:
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

    time.sleep(10)