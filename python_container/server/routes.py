from flask import Blueprint, request, jsonify
import os
import json
from dotenv import load_dotenv
from .utils.data_processing import process_html_files, send_data_to_endpoint_in_chunks

main_bp = Blueprint('main', __name__)

# Carrega as variáveis do arquivo .env
load_dotenv()
url_node_server = os.getenv('URL_NODE_SERVER')

@main_bp.route('/cleanData', methods=['POST'])
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

@main_bp.route('/sendData2NodeServer', methods=['POST'])
def send_data_to_node_server():
    data = request.get_json()
    if not data or 'timestamp' not in data:
        return jsonify({'error': 'Timestamp não fornecido'}), 400

    timestamp = data.get('timestamp')
    json_file_path = f'./data/{timestamp}.json'
    
    if not os.path.isfile(json_file_path):
        return jsonify({'error': f'Arquivo JSON com timestamp {timestamp} não encontrado.'}), 404

    try:
        with open(json_file_path, 'r') as file:
            data = json.load(file)
    except json.JSONDecodeError:
        return jsonify({'error': 'Erro ao decodificar o JSON.'}), 500
    
    send_data_to_endpoint_in_chunks(data, timestamp, url_node_server)
    return jsonify({'message': 'Dados enviados com sucesso'}), 200
