import os
import shutil
from app.config.env import STORE_DATA_ENDPOINT, DIRTY_DATA_DIR, PROCESSED_DATA_DIR
from .html_extraction import extract_data_from_html
from .file_handling import save_data
from .statistics import get_statistics
from .network import send_data_to_endpoint_in_chunks

def process_html_files(timestamp):
    dir_path = os.path.join(DIRTY_DATA_DIR, timestamp)
    all_data = []
    
    if not os.path.isdir(dir_path):
        print(f"Pasta com timestamp '{timestamp}' não encontrada.")
        return False
    
    for file_name in os.listdir(dir_path):
        if file_name.endswith('.html'):
            print(f"Processando arquivo: {file_name}")
            file_path = os.path.join(dir_path, file_name)
            data = extract_data_from_html(file_path)
            all_data.extend(data)
    
    dataToSend = remove_duplicates(all_data)
    output_file = os.path.join(PROCESSED_DATA_DIR, f'{timestamp}.json')
    save_data(dataToSend, filename=output_file)
    get_statistics(dataToSend)
    send_data_to_endpoint_in_chunks(dataToSend, timestamp, STORE_DATA_ENDPOINT)
    shutil.rmtree(dir_path)
    return True

def remove_duplicates(data):
    unique_items = []
    seen = set()

    for item in data:
        # Cria uma chave única baseada nos valores de title, set e rarity
        unique_key = (item.get('title'), item.get('set'), item.get('rarity'))

        # Se a chave não foi vista antes, adicione o item ao array único
        if unique_key not in seen:
            unique_items.append(item)
            seen.add(unique_key)

    return unique_items
