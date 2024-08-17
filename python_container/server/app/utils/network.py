import requests
import json
import math

def split_data_into_chunks(data, chunk_size):
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
