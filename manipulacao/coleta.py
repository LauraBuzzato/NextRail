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
import threading

load_dotenv(dotenv_path=".env.dev")

INTERVALO_COLETA = 10

DATA_PATH = 'data/'
CSV_PATH = 'data/machine_data.csv'


def disk_latency_test():
    try:
        path = "/tmp/latencia_test.bin" if platform.system() != "Windows" else "latencia_test.bin"
        data = b"0" * 1024 * 512 

        start = time.time()
        with open(path, "wb") as f:
            f.write(data)
        write_latency = (time.time() - start) * 1000

        start = time.time()
        with open(path, "rb") as f:
            f.read()
        read_latency = (time.time() - start) * 1000

        return (write_latency + read_latency) / 2
    except:
        return None


def memory_latency_test():
    try:
        size = 2_000_000
        arr = [0] * size

        start = time.time()
        total = sum(arr)
        return (time.time() - start) * 1000
    except:
        return None


def thread_switch_latency():
    try:
        switch_times = []

        def worker():
            for _ in range(200):
                start = time.time()
                time.sleep(0)
                switch_times.append((time.time() - start) * 1000)

        t = threading.Thread(target=worker)
        t.start()
        t.join()

        return sum(switch_times) / len(switch_times)
    except:
        return None


def system_latency_media():
    """ Calcula média geral de latência do sistema """
    d = disk_latency_test()
    m = memory_latency_test()
    t = thread_switch_latency()

    valores = [v for v in [d, m, t] if v is not None]

    if not valores:
        return None

    return sum(valores) / len(valores)

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
    
    processos = len(ps.pids())

    def generate_software_machine_id():
        os_info = platform.platform()
        node_name = platform.node()
        processor_info = platform.processor()
        unique_string = os_info + node_name + processor_info
        machine_id = hashlib.sha256(unique_string.encode()).hexdigest()
        return machine_id

    machine_id = generate_software_machine_id()

    latencia_media = system_latency_media()

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
        'disk_avl': [disk_avl],
        'latencia_media_ms': [latencia_media]  
    })

    print(new_row)

    if os.path.exists(DATA_PATH):
        new_row.to_csv(CSV_PATH, mode="a", sep=';', encoding='utf-8', index=False, header=False)
    else:
        os.mkdir(DATA_PATH)
        new_row.to_csv(CSV_PATH, mode="a", sep=';', encoding='utf-8', index=False, header=True)

    fim_ciclo = time.time()
    duracao = fim_ciclo - inicio_ciclo
    if duracao < INTERVALO_COLETA:
        time.sleep(INTERVALO_COLETA - duracao)
