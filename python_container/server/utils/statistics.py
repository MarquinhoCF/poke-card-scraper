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