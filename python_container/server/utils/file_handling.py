import json

def save_data(data, filename):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Dados salvos em {filename}")
    except Exception as e:
        print(f"Erro ao salvar os dados em JSON: {e}")