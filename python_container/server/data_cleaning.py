from flask import Flask, request, jsonify
import os
import json
from bs4 import BeautifulSoup
import requests
import math

app = Flask(__name__)

url_node_server = 'http://host.docker.internal:3000/storeData'

# Caminho da pasta onde os HTMLs estão salvos
current_dir = os.path.dirname(__file__)
base_dir = os.path.join(current_dir, '..', 'dirty_data')

# Função para extrair os dados de um arquivo HTML
def extract_data_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')
        
        data = []
        
        results = soup.select(".search-result__content")
        for result in results:
            try:
                title = extract_text(result, ".product-info__title")
                set_name, rarity, number = extract_meta(result)
                market_price = extract_price(result)
                product_url = extract_url(result)
                top_listings = extract_top_listings(result)

                # Ignora produtos sem preço de mercado
                if market_price == None:
                    continue

                data.append({
                    'title': title,
                    'set': set_name,
                    'rarity': rarity,
                    'number': number,
                    'market_price': market_price,
                    'product_url': product_url,
                    'top_listings': top_listings
                })

            except Exception as e:
                print(f"Erro ao processar o HTML: {e}")

        return data

# Funções auxiliares para extração de dados
def extract_text(result, selector):
    element = result.select_one(selector)
    return element.text.strip() if element else None

def extract_meta(result):
    meta_text = extract_text(result, ".product-info__meta")
    if meta_text:
        meta_parts = meta_text.split(", ")
        set_name = meta_parts[1].strip() if len(meta_parts) > 1 else None
        rarity = meta_parts[2].strip() if len(meta_parts) > 2 else None
        number = meta_parts[-1].strip() if "#" in meta_parts[-1] else None
        return set_name, rarity, number
    return None, None, None

def extract_price(result):
    price = extract_text(result, ".product-info__market-price--value")
    return price.replace('$', '').replace(',', '') if price else None

def extract_url(result):
    link = result.select_one("a")
    return "https://www.tcgplayer.com" + link['href'] if link else None

def extract_top_listings(result):
    top_listings = []
    listings = result.select(".listing-item__listing-data")
    for listing in listings:
        condition = extract_text(listing, "h3")
        seller = extract_text(listing, ".seller-info__name")
        price = extract_text(listing, ".listing-item__listing-data__info__price")
        shipping = extract_text(listing, ".shipping-messages__price")
        shipping = shipping.split(" ")[1] if shipping else None
        top_listings.append({
            "condition": condition,
            "seller": seller,
            "price": price.replace('$', '').replace(',', '') if price else None,
            "shipping": shipping.replace('$', '').replace(',', '') if shipping else None
        })
    return top_listings

# Função para salvar dados em um arquivo JSON formatado
def save_data(data, filename):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Dados salvos em {filename}")
    except Exception as e:
        print(f"Erro ao salvar os dados em JSON: {e}")

# Função para calcular e exibir estatísticas dos dados
def get_statistics(dataset):
    print("\n\n------------------- Análise estatística dos dados obtidos: -------------------\n")
    total_products = len(dataset)
    print(f"Total de produtos observados: {total_products}")

    market_prices = [float(item['market_price']) for item in dataset if item['market_price']]
    if market_prices:
        max_market_price = max(market_prices)
        min_market_price = min(market_prices)
        print(f"Preço de mercado máximo: ${max_market_price}")
        print(f"Preço de mercado mínimo: ${min_market_price}")
    else:
        print("Nenhum preço de mercado válido encontrado.")

    set_counts = {}
    for item in dataset:
        set_name = item.get('set', None)
        if set_name:
            set_counts[set_name] = set_counts.get(set_name, 0) + 1

    print("\nOcorrências dos 'sets' observados:")
    for set_name, count in set_counts.items():
        print(f"{set_name}: {count} ocorrência(s)")

    rarity_counts = {}
    for item in dataset:
        rarity = item.get('rarity', None)
        if rarity:
            rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1

    print("\nOcorrências dos 'rarity' observados:")
    for rarity, count in rarity_counts.items():
        print(f"{rarity}: {count} ocorrência(s)")

    condition_counts = {}
    for item in dataset:
        top_listings = item.get('top_listings', [])
        for listing in top_listings:
            condition = listing.get('condition', None)
            if condition:
                condition_counts[condition] = condition_counts.get(condition, 0) + 1

    print("\nOcorrências dos 'condition' observados:")
    for condition, count in condition_counts.items():
        print(f"{condition}: {count} ocorrência(s)")

def split_data_into_chunks(data, chunk_size):
    """Divide os dados em chunks menores baseados no tamanho especificado."""
    total_size = len(json.dumps(data))
    num_chunks = math.ceil(total_size / chunk_size)
    
    chunks = []
    data_str = json.dumps(data)
    
    for i in range(num_chunks):
        start = i * chunk_size
        end = start + chunk_size
        chunk = data_str[start:end]
        chunks.append(chunk)
    
    return chunks

def send_data_to_endpoint_in_chunks(data, timestamp, endpoint, chunk_size=10*1024*1024):
    """Envia os dados em chunks para o endpoint especificado."""
    chunks = split_data_into_chunks(data, chunk_size)
    
    for i, chunk in enumerate(chunks):
        payload = {
            'timestamp': timestamp,
            'data_chunk': chunk,
            'chunk_index': i,
            'total_chunks': len(chunks)
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            print(f'Chunk {i+1}/{len(chunks)} - Status Code: {response.status_code}, Response: {response.text}')
        except requests.RequestException as e:
            print(f'Erro ao enviar chunk {i+1}: {str(e)}')

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

# Função para processar todos os arquivos HTML de uma pasta com base no timestamp
def process_html_files(timestamp):
    dir_path = os.path.join(base_dir, timestamp)
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

# Endpoint para processar dados
@app.route('/cleanData', methods=['POST'])
def clean_data():
    data = request.get_json()
    timestamp = data.get('timestamp')
    
    if not timestamp:
        return jsonify({'error': 'Timestamp não fornecido'}), 400
    
    try:
        process_html_files(timestamp)
        return jsonify({'message': 'Dados processados com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sendData2NodeServer', methods=['POST'])
def send_data_to_node_server():
    data = request.get_json()
    if not data or 'timestamp' not in data:
        return jsonify({'error': 'Timestamp não fornecido'}), 400

    timestamp = data.get('timestamp')
    json_file_path = os.path.join('./data', f'{timestamp}.json')
    
    if not os.path.isfile(json_file_path):
        print(f"Arquivo JSON com timestamp '{timestamp}' não encontrado.")
        return jsonify({'error': f'Arquivo JSON com timestamp {timestamp} não encontrado.'}), 404

    # Ler o conteúdo do arquivo JSON
    try:
        with open(json_file_path, 'r') as file:
            data = json.load(file)
    except json.JSONDecodeError:
        print("Erro ao decodificar o JSON.")
        return jsonify({'error': 'Erro ao decodificar o JSON.'}), 500
    
    send_data_to_endpoint_in_chunks(data, timestamp, url_node_server)
    return jsonify({'message': 'Dados processados com sucesso'}), 200
    
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
