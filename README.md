# Pokemon TCG Scraper

## Description

This repository implements a **Notification and Data Analysis System** for the GCC129 – Distributed Systems - 2024/1 project. The system performs data scraping from Liga Pokemon, processes and cleans the data with Python, and makes it available on a Node.js server. Additionally, it includes client notification functionalities and utilizes artificial intelligence as a bonus.

## Features

1. **Data Scraping with Bash []**
   - Bash scripts for data scraping from Liga Pokemon.

2. **Data Cleaning with Python []** 
   - Python scripts to clean and prepare the scraped data.

3. **Sending Dataset to Node Server []**
   - Creation and sending of a dataset to a Node.js server.

4. **Displaying Charts on Node Server []**
   - Generation and display of charts from the data.

5. **Client Notifications []**
   - Client event registration via a POST form at the `/notify` path.
   - Sending notifications via email, SMS, or Telegram.

6. **AI Usage (Bonus) []**
   - Implementation of modules with artificial intelligence.

## Project Structure

- **Python Module**: Scripts for scraping and cleaning data.
- **Node.js Server Module**: Node.js server to receive data, display charts, and manage notifications.


Como executar o sistema:

cd scrape
python scrape.py

Abrir outro terminal

cd node_container
docker build -t pokemon-tcg-scraper-node-server .

cd ..

cd python_container
docker build -t data-cleaning-server-python .

docker network create my_network    

docker run -it --name node_server_pokemon_tcg --network my_network -p 8000:3000  --name pokemon-tcg-scraper-server pokemon-tcg-scraper-node-server

Abrir outro terminal

docker run -it -p 6000:5001 -v C:/poke-card-scraper/scrape/dirty_data:/app/server/dirty_data --network my_network --name data-cleaning-server data-cleaning-server-python
