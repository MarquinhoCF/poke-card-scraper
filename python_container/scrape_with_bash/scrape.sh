#!/bin/bash

# ------------------- DEFINIÇÃO DAS URLS -------------------
url_to_scrape='https://www.tcgplayer.com/search/pokemon/product?view=list&productLineName=pokemon&setName=sv-scarlet-and-violet-151|swsh01-sword-and-shield-base-set|sm-base-set|xy-base-set|legendary-collection|xy-evolutions&page=1&inStock=true&Language=English'

# Cria uma pasta com base na data e hora atual
timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
folder_path="dirty_data/$timestamp"
mkdir -p "$folder_path"

# Função para salvar o HTML em um arquivo
save_html() {
    local html_content="$1"
    local page_num="$2"
    local filename="$folder_path/page${page_num}.html"
    
    echo "$html_content" > "$filename"
    echo "HTML salvo em $filename"
}

job() {
    echo "Iniciando a captura do HTML..."

    local num_pages=118

    # Loop por cada página e salva o HTML
    for page in $(seq 1 $num_pages); do
        echo "Extraindo dados da página $page de $num_pages páginas..."
        page_url=$(echo "$url_to_scrape" | sed "s/page=\d\+/page=$page/")
        html_content=$(curl -s "$page_url")
        save_html "$html_content" "$page"
    done
}

job
