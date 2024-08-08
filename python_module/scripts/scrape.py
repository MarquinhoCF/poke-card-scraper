from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import requests
import os

# Configurar as opções do Chrome
options = Options()
options.add_argument("--start-maximized")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

# Desativar a detecção de WebDriver
options.add_experimental_option('excludeSwitches', ['enable-automation'])
options.add_experimental_option('useAutomationExtension', False)

# Definir o caminho para o ChromeDriver
service = Service('./python_module/chromedriver/chromedriver_v127.exe')
driver = webdriver.Chrome(service=service, options=options)

# Ajustar as preferências do driver
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
    "source": """
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """
})

# FUNÇÕES DE EXTRAÇÃO DE DADOS
def get_page_count():
    pagination = driver.find_element(By.CSS_SELECTOR, ".tcg-pagination__pages")
    page_links = pagination.find_elements(By.TAG_NAME, "a")
    return int(page_links[-1].text)

def extract_text(element, class_name):
    try:
        el = element.find_element(By.CLASS_NAME, class_name)
        return el.text
    except:
        return None

def extract_title(element):
    return extract_text(element, "product-card__title")

def extract_set(element):
    return extract_text(element, "product-card__set-name__variant")

def extract_market_price(element):
    return extract_text(element, "product-card__market-price--value")

def extract_rarity(element):
    rarity_text = extract_text(element, "product-card__rarity__variant")
    if rarity_text:
        return rarity_text.split("·")[0].strip()
    return None

def extract_number(element):
    rarity_text = extract_text(element, "search-result__rarity")
    if rarity_text:
        parts = rarity_text.split("·")
        return parts[1].strip() if len(parts) > 1 else None
    return None

def extract_img(element):
    img_element = element.find_element(By.TAG_NAME, "img")
    img_url = img_element.get_attribute("src")
    return img_url.replace("/filters:quality(1)", "")

def extract_product_url(element):
    link_element = element.find_element(By.TAG_NAME, "a")
    return link_element.get_attribute("href")

def extract_top_listings(element):
    listings = element.find_elements(By.CLASS_NAME, "listing-item__info")
    top_listings = []
    for listing in listings:
        price = extract_text(listing, "listing-item__price")
        shipping = extract_text(listing, "shipping-messages__price")
        top_listings.append((price, shipping))
    return top_listings

# FUNÇÕES DE SALVAMENTO
def save_img(img_url):
    response = requests.get(img_url)
    filename = os.path.join(image_dir, os.path.basename(img_url))
    with open(filename, 'wb') as file:
        file.write(response.content)
    return img_url

def extract_and_save_img(element):
    img_url = extract_img(element)
    save_img(img_url)
    return img_url

# RASPAGEM E PROCESSAMENTO

url = 'https://www.tcgplayer.com/search/pokemon/product?view=grid&productLineName=pokemon&setName=sv-scarlet-and-violet-151|world-championship-decks&page=1&inStock=true'

all_data = []

driver.get(url)
time.sleep(20)

results = driver.find_elements(By.CSS_SELECTOR, ".search-result__content")

print(results)
for result in results:
    data = {
        'title': extract_title(result),
        'set': extract_set(result),
        'rarity': extract_rarity(result),
        'number': extract_number(result),
        'market_price': extract_market_price(result),
        'product_url': extract_product_url(result),
        'top_listings': extract_top_listings(result)
    }
    all_data.append(data)

print(all_data)


# for page in range(1, get_page_count() + 1):
#     driver.get(f"{url}&page={page}")
#     time.sleep(2)  # Esperar a página carregar

#     results = driver.find_elements(By.CSS_SELECTOR, ".search-result__content")
#     for result in results:
#         data = {
#             'img_url': extract_and_save_img(result),
#             'title': extract_title(result),
#             'set': extract_set(result),
#             'rarity': extract_rarity(result),
#             'number': extract_number(result),
#             'market_price': extract_market_price(result),
#             'product_url': extract_product_url(result),
#             'top_listings': extract_top_listings(result)
#         }
#         all_data.append(data)

driver.quit()

# Processar ou salvar all_data conforme necessário
