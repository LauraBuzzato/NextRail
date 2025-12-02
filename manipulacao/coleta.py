#pip install python-dotenv
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, date
import psutil as ps
import pandas as pd
import time
import os
from psutil._common import bytes2human
import platform
import hashlib
import threading
#pip install mysql-connector-python
import mysql.connector
import boto3

def get_daily_s3_key():
    today = date.today().strftime("%Y-%m-%d")
    return f"machine_data_{today}.csv"

load_dotenv(dotenv_path=".env.dev")

BUCKET_NAME = "nextrail-raw-log"


s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_DEFAULT_REGION")
)

def download_csv_from_s3(bucket, key, local_path):
    try:
        s3.download_file(bucket, key, local_path)
        print(f"Arquivo {key} baixado do S3.")
    except Exception:
        print(f"Arquivo {key} não existe. Criando novo arquivo diário.")
        df = pd.DataFrame(columns=[
            'id', 'servidor', 'timestamp', 'horario_de_pico',
            'cpu_percent', 'memory_percent', 'memory_available',
            'processos_ativos', 'disk_percent', 'disk_avl', 'latencia_media_ms'
        ])
        df.to_csv(local_path, sep=';', index=False, encoding='utf-8')

def upload_csv_to_s3(bucket, key, local_path):
    with open(local_path, "rb") as f:
        s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=f,
            ContentType='text/csv'
        )
    print("Arquivo enviado ao S3.")

def delete_local_file(path):
    if os.path.exists(path):
        os.remove(path)
        print("Arquivo local apagado.")





conexao = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_DATABASE"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT")
        )

# def generate_software_machine_id():
      #  os_info = platform.platform()
      #  node_name = platform.node()
      #  processor_info = platform.processor()
      #  unique_string = os_info + node_name + processor_info
      #  machine_id = hashlib.sha256(unique_string.encode()).hexdigest()
      #  return machine_id

machine_id = 1

select = conexao.cursor(buffered=True)
select2 = conexao.cursor(buffered=True)
query = "SELECT intervalo FROM leitura_script ls INNER JOIN servidor ser on ls.fk_servidor = ser.id WHERE ser.id = %s"
select.execute(query, (machine_id,))

resultado = select.fetchone()

query2 = "SELECT nome FROM servidor WHERE id = %s"
select2.execute(query2, (machine_id,))

resultadoNome = select2.fetchone()

select2.close()
select.close()
conexao.close()

INTERVALO_COLETA = resultado[0]
nomeServidor = resultadoNome[0]



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

    S3_KEY = get_daily_s3_key()
    LOCAL_CSV = "temp_machine_data.csv"
    
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

    

    

    latencia_media = system_latency_media()

    new_row = pd.DataFrame({
        'id': [machine_id],
        'servidor': [nomeServidor],
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

    LOCAL_CSV = "temp_machine_data.csv"

    download_csv_from_s3(BUCKET_NAME, S3_KEY, LOCAL_CSV)

    new_row.to_csv(LOCAL_CSV, mode="a", sep=';', encoding='utf-8', index=False, header=False)

    upload_csv_to_s3(BUCKET_NAME, S3_KEY, LOCAL_CSV)

    delete_local_file(LOCAL_CSV)

    fim_ciclo = time.time()
    duracao = fim_ciclo - inicio_ciclo
    if duracao < INTERVALO_COLETA:
        time.sleep(INTERVALO_COLETA - duracao)

