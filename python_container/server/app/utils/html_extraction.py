from bs4 import BeautifulSoup

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