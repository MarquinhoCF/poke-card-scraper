import os
import re
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
from datetime import datetime

# ------------------- DEFINIÇÃO DAS URLS -------------------
url_python_server = "http://localhost:5001/cleanData"
url_to_scrape = 'https://www.tcgplayer.com/search/pokemon/product?view=list&productLineName=pokemon&setName=sv-scarlet-and-violet-151|swsh01-sword-and-shield-base-set|sm-base-set|xy-base-set|legendary-collection|xy-evolutions&page=1&inStock=true&Language=English'

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

# Salva o HTML da página em um arquivo.
def save_html(html_content, folder_path, page_num):
    try:
        filename = os.path.join(folder_path, f'page {page_num}.html')
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"HTML salvo em {filename}")
    except Exception as e:
        print(f"Erro ao salvar o HTML: {e}")

def notify_server(timestamp):
    headers = {'Content-Type': 'application/json'}
    data = {"timestamp": timestamp}
    try:
        response = requests.post(url_python_server, json=data, headers=headers)
        response.raise_for_status()
        print("Notificação enviada com sucesso!")
    except requests.exceptions.RequestException as e:
        print(f"Erro ao enviar notificação: {e}")

# Função principal para capturar o HTML da página.
def job():
    print("Iniciando a captura do HTML...")
    driver = init_driver()  # Inicializa o driver

    try:
        # Cria uma pasta com base na data e hora atual
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        folder_path = os.path.join('dirty_data', timestamp)
        os.makedirs(folder_path, exist_ok=True)

        driver.get(url_to_scrape)
        time.sleep(10)  # Aguardar a página carregar completamente

        num_pages = get_page_count(driver)

        for page in range(1, num_pages + 1):
            print(f"Extraindo dados da página {page} de {num_pages} páginas...")
            driver.get(re.sub(r'page=\d+', f'page={page}', url_to_scrape))
            time.sleep(5)  # Aguardar a página carregar completamente

            # Captura o HTML da página
            html_content = driver.page_source
            save_html(html_content, folder_path, page)

    finally:
        driver.quit()
        notify_server(timestamp)  # Envia notificação após o job ser concluído

# ---------------- AGENDAMENTO DE TAREFAS ----------------
while True:
    job()
    time.sleep(3600)
