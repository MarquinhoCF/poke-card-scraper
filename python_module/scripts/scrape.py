from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import json
import re

# ---------------- CONFIGURAÇÕES ----------------
# Caminho do arquivo onde o JSON será salvo
output_file = './data/pokemon_tcg_data.json'
# URL para raspar
url = 'https://www.tcgplayer.com/search/pokemon/product?view=list&productLineName=pokemon&setName=sv-scarlet-and-violet-151|swsh01-sword-and-shield-base-set|sm-base-set|xy-base-set|legendary-collection|xy-evolutions&page=1&inStock=true&Language=English'

# ---------------- CONFIGURAÇÕES DO SELENIUM ----------------
# Configurar as opções do Chrome
options = Options()
options.add_argument("--start-maximized")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

# Desativar a detecção de WebDriver
options.add_experimental_option('excludeSwitches', ['enable-automation'])
options.add_experimental_option('useAutomationExtension', False)

# Definir o caminho para o ChromeDriver
service = Service('./chromedriver/chromedriver_v127.exe')

# ---------------- FUNÇÕES DE UTILIDADE ----------------

# Inicializa o WebDriver com as configurações especificadas.
def init_driver():
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """
    })
    return driver

# Obtém o número de páginas disponíveis na pesquisa.
def get_page_count(driver):
    try:
        pagination = driver.find_element(By.CSS_SELECTOR, ".tcg-pagination__pages")
        page_links = pagination.find_elements(By.TAG_NAME, "a")
        return int(page_links[-1].text)
    except Exception as e:
        print(f"Erro ao obter o número de páginas: {e}")
        return 1  # Default para 1 página se não conseguir determinar

# Extrai texto de um elemento, dado um seletor.
def extract_text(element, class_name, by=By.CLASS_NAME):
    try:
        el = element.find_element(by, class_name)
        return el.text
    except Exception as e:
        print(f"Erro ao extrair texto de '{class_name}' por '{by}': {e}")
        return None
# Extrai o título do produto."""
def extract_title(element):
    return extract_text(element, "product-info__title")

# Extrai informações como 'set', 'rarity' e 'number'."""
def extract_meta(element):
    meta_text = extract_text(element, "product-info__meta")
    if meta_text:
        parts = meta_text.split(", ")
        set_name = parts[1].strip() if len(parts) > 1 else None
        rarity = parts[2].strip() if len(parts) > 2 else None
        number = parts[-1].strip() if "#" in parts[-1] else None
        return set_name, rarity, number
    else:
        return None, None, None

# Extrai o preço de mercado do produto.
def extract_market_price(element):
    price = extract_text(element, "product-info__market-price--value")
    return price.replace('$', '') if price else None

# Extrai a URL do produto.
def extract_product_url(element):
    try:
        link_element = element.find_element(By.TAG_NAME, "a")
        return link_element.get_attribute("href")
    except Exception as e:
        print(f"Erro ao extrair URL do produto: {e}")
        return None

# Extrai as listagens de vendedores principais do produto.
def extract_top_listings(element):
    top_listings = []
    try:
        listings = element.find_elements(By.CLASS_NAME, "listing-item__listing-data")
        for listing in listings:
            condition = extract_text(listing, "h3", By.TAG_NAME)
            seller = extract_text(listing, "seller-info__name")
            price = extract_text(listing, "listing-item__listing-data__info__price")
            shipping = extract_text(listing, "shipping-messages__price")
            if shipping:
                shipping = shipping.split(" ")[1].strip()
            top_listings.append({
                "condition": condition,
                "seller": seller,
                "price": price.replace('$', '') if price else None,
                "shipping": shipping.replace('$', '') if shipping else None
            })
    except Exception as e:
        print(f"Erro ao extrair listagens: {e}")
    return top_listings

# Salva os dados em um arquivo JSON formatado.
def save_data(data, filename=output_file):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Dados salvos em {filename}")
    except Exception as e:
        print(f"Erro ao salvar os dados em JSON: {e}")

# Carrega os dados de um arquivo JSON.
def open_json_file(filename=output_file):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

# Gera estatísticas básicas do dataset.
def get_statistics(dataset):
    print("\n\n------------------- Análise estatística dos dados obtidos: -------------------\n")
    # Número total de produtos observados
    total_products = len(dataset)
    print(f"Total de produtos observados: {total_products}")

    # Encontrar o preço de mercado máximo e mínimo
    market_prices = []
    for item in dataset:
        try:
            price = float(item['market_price']) if item['market_price'] else None
            if price is not None:
                market_prices.append(price)
        except ValueError:
            continue

    if market_prices:
        max_market_price = max(market_prices)
        min_market_price = min(market_prices)
        print(f"Preço de mercado máximo: ${max_market_price}")
        print(f"Preço de mercado mínimo: ${min_market_price}")
    else:
        print("Nenhum preço de mercado válido encontrado.")

    # Contagem de ocorrências de "sets"
    set_counts = {}
    for item in dataset:
        set_name = item.get('set', None)
        if set_name:
            set_counts[set_name] = set_counts.get(set_name, 0) + 1

    print("\nOcorrências dos 'sets' observados:")
    for set_name, count in set_counts.items():
        print(f"{set_name}: {count} ocorrência(s)")

    # Contagem de ocorrências de "rarity"
    rarity_counts = {}
    for item in dataset:
        rarity = item.get('rarity', None)
        if rarity:
            rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1

    print("\nOcorrências dos 'rarity' observados:")
    for rarity, count in rarity_counts.items():
        print(f"{rarity}: {count} ocorrência(s)")

    # Contagem de ocorrências de "condition"
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

# ---------------- FUNÇÃO PRINCIPAL DE RASPAGEM ----------------

# Executa a raspagem de dados e salva os resultados em um arquivo JSON.
def job():
    print("Iniciando a raspagem de dados de Pokemon TCG...")
    driver = init_driver()  # Inicializa o driver
    all_data = []

    try:
        driver.get(url)
        time.sleep(10)  # Aguardar a página carregar completamente

        num_pages = get_page_count(driver)

        for page in range(1, num_pages + 1):
            print(f"Extraindo dados da página {page} de {num_pages} páginas...")
            driver.get(re.sub(r'page=\d+', f'page={page}', url))
            time.sleep(5)  # Aguardar a página carregar completamente

            results = driver.find_elements(By.CSS_SELECTOR, ".search-result__content")
            for result in results:
                try:
                    set_name, rarity, number = extract_meta(result)
                    data = {
                        'title': extract_title(result),
                        'set': set_name,
                        'rarity': rarity,
                        'number': number,
                        'market_price': extract_market_price(result),
                        'product_url': extract_product_url(result),
                        'top_listings': extract_top_listings(result)
                    }
                    print(data)
                    all_data.append(data)
                except Exception as e:
                    print(f"Erro ao processar resultado: {e}")

    finally:
        driver.quit()

    save_data(all_data)
    dataset = open_json_file()
    get_statistics(dataset)

# ---------------- AGENDAMENTO DE TAREFAS ----------------
while True:
    job()
    time.sleep(7200)
