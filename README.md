# Pokemon TCG Scraper

Este é o repositório para o projeto da disciplina de Sistemas Distribuídos. O projeto consiste em um sistema que realiza um web scrap dos dados de cartas de Pokemon TCG para compor um dataset, realizar data cleaning, gerar gráficos e notificar os usuários.

## Estudo Dirigido: Sistema de Notificação e Análise de Dados

## GCC129 – Sistemas Distribuídos - 2024/1

### Requisitos do Sistema

1. Scrape usando Bash para download – 10pts

   - O sistema deve permitir o download de dados usando scripts Bash para realizar scraping.

2. Data cleaning usando Python – 20pts

   - O sistema deve realizar a limpeza de dados utilizando scripts em Python.

3. Enviar dataset para servidor Node – 20pts

   - O sistema deve criar um dataset em Python.

   - O sistema deve enviar o dataset criado para um servidor Node.

4. Exibir gráficos no servidor Node – 30pts

   - O sistema deve exibir gráficos gerados a partir do dataset no servidor Node.

5. Enviar notificação para cliente para evento cadastrado – 20pts

   - O sistema deve permitir que o cliente cadastre um evento através de um formulário POST no caminho `/notify` do servidor.

   - O sistema deve enviar uma notificação por email, SMS ou telegram ao cliente após o cadastro do evento.

6. Bônus: Uso de IA – 10pts

   - Qualquer módulo do trabalho que utilize IA receberá pontos adicionais.

 

### Entrega dos Conteineres Docker

1. Container com Módulo Python

   - Este container deve incluir todos os scripts e dependências necessárias para realizar o scraping e a limpeza de dados.

2. Container com Módulo Node.js Server

   - Este container deve incluir o servidor Node.js com a capacidade de receber o dataset, exibir gráficos e enviar notificações.