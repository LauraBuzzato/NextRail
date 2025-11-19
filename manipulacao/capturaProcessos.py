import psutil
from dotenv import load_dotenv
from datetime import datetime, timedelta
import csv
import time
import os
import pandas as pd
#pip install mysql-connector-python
import mysql.connector
import boto3


load_dotenv(dotenv_path=".env.dev")


BUCKET_NAME = "bucket-teste-python"
S3_KEY = "nomeProcessosUso.csv"


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
       print("Arquivo baixado do S3.")
   except Exception as e:
       print("Arquivo não existe no S3, criando novo.")
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
           ContentType='text/csv',
           ACL='public-read'
       )
   print("Arquivo enviado ao S3 com ACL pública.")


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


machine_id = 1


select = conexao.cursor()


query = "SELECT nome FROM servidor WHERE id = %s"
select.execute(query, (machine_id,))


resultadoNome = select.fetchone()


select.close()
conexao.close()


header = ["id", "servidor", "timestamp", "NOME", "USO_MEMORIA (MB)"]
file_name = "nomeProcessosUso.csv"



nomeServidor = resultadoNome[0]
INTERVALO_COLETA = 90


while True:
    inicio_ciclo = time.time()


    download_csv_from_s3(BUCKET_NAME, S3_KEY, file_name)


    arquivoAntigo = None
    if os.path.exists(file_name):
        arquivoAntigo = pd.read_csv(file_name, sep=';', encoding='utf-8')


    data = []
    timestamp = datetime.now()

    for proc in psutil.process_iter(['name', 'memory_info']):
        try:
            info = proc.info["memory_info"]
            if info is None:
                continue

            process_name = proc.info["name"]
            memory_usage_mb = info.rss / (1024 * 1024)

            data.append([
                machine_id,
                nomeServidor,
                timestamp,
                process_name,
                f"{memory_usage_mb:.1f}"
            ])
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    novoArquivo = pd.DataFrame(data, columns=header)


    if arquivoAntigo is not None:
        arquivoFinal = pd.concat([arquivoAntigo, novoArquivo], ignore_index=True)
    else:
        arquivoFinal = novoArquivo


    arquivoFinal.to_csv(file_name, sep=';', encoding='utf-8', index=False)

    upload_csv_to_s3(BUCKET_NAME, S3_KEY, file_name)

    delete_local_file(file_name)

    print(f"\nArquivo '{file_name}' atualizado e enviado!")
    print(f"Total de {len(data)} novos processos registrados.")

    fim_ciclo = time.time()
    duracao = fim_ciclo - inicio_ciclo
    if duracao < INTERVALO_COLETA:
        time.sleep(INTERVALO_COLETA - duracao)
