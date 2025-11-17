import psutil
import csv
import time
import os
import pandas as pd

header = ["NOME", "USO_MEMORIA (MB)"]
file_name = "nomeProcessosUso.csv"

DATA_PATH = 'data/'
CSV_PATH = DATA_PATH + file_name

time.sleep(0.1)

data = []

for proc in psutil.process_iter(['name', 'memory_info']):
    try:
        process_name = proc.info["name"]
        memory_usage_mb = proc.info["memory_info"].rss / (1024 * 1024)
        data.append([process_name, f"{memory_usage_mb:.1f}"])
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        continue


if not os.path.exists(DATA_PATH):
    os.makedirs(DATA_PATH)


df = pd.DataFrame(data, columns=header)


if os.path.exists(CSV_PATH):
    df.to_csv(CSV_PATH, mode="a", sep=';', encoding='utf-8', index=False, header=False)
else:
    df.to_csv(CSV_PATH, mode="w", sep=';', encoding='utf-8', index=False, header=True)

print(f"\nArquivo '{file_name}' criado/atualizado com sucesso!")
print(f"Total de {len(data)} processos registrados.")
