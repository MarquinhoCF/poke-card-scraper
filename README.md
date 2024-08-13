# Pokémon TCG Scraper

## Descrição do Projeto

Este repositório implementa um **Sistema de Notificações e Análise de Dados** para o projeto GCC129 – Sistemas Distribuídos - 2024/1. O sistema realiza a extração de dados do TCG Player, processa e limpa os dados com Python e os disponibiliza em um servidor Node.js. Além disso, inclui funcionalidades de notificação para o cliente e utiliza inteligência artificial como um bônus.

Acesso ao formulário de Notificação: [link](http://localhost:8000/form/)
Acesso ao dashboard: [link](http://localhost:8000/dashboard/)

1. **Extração de Dados com Bash [X]**
   - **Descrição:** Scripts Bash para extração de dados do TCG Player.
   - **Problema Encontrado:** Impossível realizar a extração da página, pois os dados não carregados de forma convencional.
   - **Solução:** Realizar a extração de dados por `Python` `Selenium`, Google Chrome e Chrome Driver. Mais detalhes no `python_container/scrape_with_bash/README.md`. O HTML de 118 páginas do site TCG Player é realizado e o envio dessas páginas é feita por requisição HTTP.  O script está agendado para rodar a cada 1 hora.

2. **Limpeza de Dados com Python [X]**
   - **Descrição:** Scripts Python para limpeza e preparação dos dados extraídos.
   - **Solução:** Criei um Servidor `Python Flask` para lidar com processo de limpeza de dados utilizando a biblioteca `BeautifulSoup`. Após a extração feita pelo `Selenium`, o script usa o `BeautifulSoup` para analisar e extrair informações relevantes do HTML salvo no diretório `dirty_data`.

3. **Envio de Conjunto de Dados para o Servidor Node [X]**
   - **Descrição:** Criação e envio de um conjunto de dados para um servidor Node.js.
   - **Solução:** Desenvolvido um servidor Python para extrair dados dos produtos TCG, salvar como json e enviar para um endpoint do servidor Node.js (`http://node_server_pokemon_tcg:3000/api/storeData`).

4. **Exibição de Gráficos no Servidor Node [X]**
   - **Descrição:** Geração e exibição de gráficos a partir dos dados.
   - **Solução:** Implementado um endpoint `/dashboard` para servir o `dashboard.html` do diretório `public/dashboard`. O arquivo HTML inclui um dropdown `<select>` para seleção de produtos TCG e um elemento `<canvas>` para exibição de gráficos usando o Chart.js. O endpoint `/products` lista os produtos TCG disponíveis e o `/chartData/:productKey` fornece dados para o produto selecionado. Os gráficos são atualizados em tempo real com base na seleção do produto.

5. **Notificações para Clientes [X]**
   - **Descrição:** Registro de eventos do cliente e notificações.
   - **Solução:**
     - **Notificações por Email:** Utiliza o `nodemailer` com credenciais SMTP configuradas para enviar emails. As notificações incluem detalhes do usuário e texto personalizado.
     - **Notificações por SMS:** Utiliza o pacote `twilio` com a API do Twilio para enviar mensagens SMS. As notificações são enviadas para o número de telefone do usuário.

6. **Uso de IA (Bônus) [X]**
   - **Descrição:** Implementação de módulos de inteligência artificial.
   - **Solução:** Utiliza a API Gemini para gerar textos de notificações personalizados. Uma função (`generatePersonalizedText`) envia um prompt para a API, incluindo detalhes do usuário e resultados filtrados, e recebe uma mensagem personalizada para aumentar o engajamento.

## Estrutura do Projeto

- **Scrip Python [X]:** Script extração de dados.
- **Módulo Python [X]:** Servidor Flask para limpeza de dados.
- **Módulo Servidor Node.js [X]:** Servidor Node.js para receber dados, exibir gráficos e gerenciar notificações.

## Requisitos

- Python (versão mais recente)
- Docker

## Instalação

Para o correto funcionamento do sistema, é necessário que o Google Chrome esteja instalado em seu computador. Além disso, você precisa instalar uma versão do Chrome Driver compatível com a versão do Google Chrome que está usando. 

Para verificar a versão do seu Google Chrome:
1. Abra o Chrome.
2. Clique no ícone de 3 pontinhos no canto superior direito.
3. Vá para "Definições" e depois para "Sobre o Chrome".
4. Verifique a versão instalada.

Se a sua versão do Chrome for 127.0.6533.100, faça o download do Chrome Driver 127 através deste [link](https://googlechromelabs.github.io/chrome-for-testing/) de acordo com o sistema operacional da sua máquina. Mova o arquivo executável do Chrome Driver para o diretório `scrape/chromedriver` e atualize o caminho do Service na variável `service` no arquivo `scrape/scrape.py` na linha 26.

### Executando o Sistema

1. Abra um terminal e navegue até o diretório `scrape`. Crie e ative o ambiente virtual do Python, além de instalar as depedências necessárias:

   ```bash
   cd scrape
   python -m venv venv
   Set-ExecutionPolicy Unrestricted -Scope Process
   .\venv\Scripts\activate
   python -m pip install -r requirements.txt
   ```

2. Execute `scrape.py`:

   ```bash
   python scrape.py
   ```

3. Abra outro terminal e navegue até o diretório `node_container` para construir a imagem Docker do servidor Node.js:
   ```bash
   cd node_container
   docker build -t pokemon-tcg-scraper-node-server .
   ```

3. Volte para o diretório raiz e navegue até `python_container` para construir a imagem Docker do servidor Python:
   ```bash
   cd ..
   cd python_container
   docker build -t data-cleaning-server-python .
   ```

4. Crie uma rede Docker:
   ```bash
   docker network create my_network
   ```

5. Inicie o container do servidor Node.js:
   ```bash
   docker run -it --name node_server_pokemon_tcg --network my_network -p 8000:3000 pokemon-tcg-scraper-node-server
   ```

6. Abra outro terminal e inicie o container do servidor Python. É de extrema importância que utilize o parâmetro `-v` para criar um bind entre as pastas `dirty_data` do container e da sua máquina, coloque o caminho para o diretório `dirty_data` a direita de `:`. Exemplo (se seu SO for Windows e o seu projeto estiver na raiz do disco C): `C:/poke-card-scraper/scrape/dirty_data`.
   ```bash
   docker run -it -p 6000:5001 -v C:/poke-card-scraper/scrape/dirty_data:/app/server/dirty_data --network my_network --name data-cleaning-server data-cleaning-server-python
   ```