import os
from dotenv import load_dotenv
from .html_extraction import extract_data_from_html
from .file_handling import save_data
from .statistics import get_statistics
from .network import send_data_to_endpoint_in_chunks

# Carrega as variáveis do arquivo .env
load_dotenv()
url_node_server = os.getenv('URL_NODE_SERVER')

def process_html_files(timestamp):
    dir_path = os.path.join(os.path.join(os.path.dirname(__file__), '..', '..', 'dirty_data'), timestamp)
    all_data = []
    
    if not os.path.isdir(dir_path):
        print(f"Pasta com timestamp '{timestamp}' não encontrada.")
        return
    
    for file_name in os.listdir(dir_path):
        if file_name.endswith('.html'):
            print(f"Processando arquivo: {file_name}")
            file_path = os.path.join(dir_path, file_name)
            data = extract_data_from_html(file_path)
            all_data.extend(data)
    
    dataToSend = remove_duplicates(all_data)
    output_file = f'./data/{timestamp}.json'
    save_data(dataToSend, filename=output_file)
    get_statistics(dataToSend)
    send_data_to_endpoint_in_chunks(dataToSend, timestamp, url_node_server)

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
