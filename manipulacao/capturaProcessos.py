import psutil
import csv
import time
import os

header = ["NOME", "USO_MEMORIA (MB)"]
data = []
file_name = "nomeProcessosUso.csv"
DATA_PATH = "data/"

if not os.path.exists(DATA_PATH):
    os.mkdir(DATA_PATH)

full_path = os.path.join(DATA_PATH, file_name)


print("Coletando dados de uso memória... Aguarde um instante.")
time.sleep(0.1)

for proc in psutil.process_iter(['name', 'memory_info']):
        process_name = proc.info['name']
        
        memory_usage_mb = proc.info['memory_info'].rss / (1024 * 1024)
        
        data.append([process_name, f"{memory_usage_mb:.1f}"])


with open(file_name, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)

    writer.writerow(header)

    writer.writerows(data)

print(f"\nArquivo com o nome de {file_name} criado com sucesso!")
print(f"Total de {len(data)} processos registrados.")



