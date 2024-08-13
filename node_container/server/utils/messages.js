const { formatTimestamp, translateCondition, translateRarity } = require('./format');
const model = require('../config/gemini_model');

async function generatePersonalizedText(submissionData, filteredResults, timestamp) {
    let prompt = `Você trabalha numa empresa de Extração de Dados de Produtos de Pokemon Trading Card Game. 
        Você foi encarregado de criar uma mensagem personalizada para um usuário chamado ${submissionData.userName} 
        que deseja receber notificações sobre produtos que correspondem aos critérios de busca que ele enviou.\n`;

    prompt += `Evite utilizar **** para deixar a mensagem em negrito.\n`;

    prompt += `Se algum dado não estiver disponível com "N/A", não mencione sobre o dado. 
        Exemplo: Raridade: "N/A" -->     \n`;

    prompt += `Seja bastante amigável, use uma linguagem informal, use emojis e faça trocadilhos com Pokemon.\n`;

    prompt += `Inclua uma saudação inicial amigável ao usuário (mencione o nome dele) e informe que uma raspagem de 
        dados foi realizada no site TCG Player.\n`;

    prompt += `Aqui estão os detalhes:\n`;

    prompt += `A última raspagem de dados no site TCG Player foi realizada às ${formatTimestamp(timestamp)}. 
        Inclua na mensagem quando foi realizada a última raspagem.\n`;

    if (filteredResults.length > 0) {
        if (filteredResults.length > 5) {
            prompt += "Aqui estão os 5 produtos mais baratos que correspondem aos critérios de busca:\n\n";
            for (let i = 0; i < 5; i++) {
                prompt += `Título: ${filteredResults[i].title}\n` +
                    `Coleção: ${filteredResults[i].set}\n` +
                    `Raridade: ${filteredResults[i].rarity || 'N/A'}\n` +
                    `Número: ${filteredResults[i].number || 'N/A'}\n` +
                    `Preço de Mercado: $${filteredResults[i].market_price}\n` +
                    `URL do produto na loja: ${filteredResults[i].product_url}\n`;
    
                if (filteredResults[i].top_listings.length > 0) {
                    prompt += 'Lista do Vendedores:\n';
                    filteredResults[i].top_listings.forEach(listing => {
                        prompt += ` - Vendedor: ${listing.seller}\n` +
                            `   Condição: ${listing.condition}\n` +
                            `   Preço (dólares): $${listing.price}\n` +
                            `   Frete (nos US): $${listing.shipping}\n`;
                    });
                } else {
                    prompt += 'Produto fora de estoque\n';
                }
        
                prompt += '\n';
            }
            prompt += `e mais outros ${filteredResults.length - 5} produtos ...\n`;
        } else {
            filteredResults.forEach(product => {
                prompt += `Título: ${product.title}\n` +
                    `Coleção: ${product.set}\n` +
                    `Raridade: ${product.rarity || 'N/A'}\n` +
                    `Número: ${product.number || 'N/A'}\n` +
                    `Preço de Mercado: $${product.market_price}\n` +
                    `URL do produto na loja: ${product.product_url}\n`;
    
                if (product.top_listings.length > 0) {
                    prompt += 'Lista do Vendedores:\n';
                    product.top_listings.forEach(listing => {
                        prompt += ` - Vendedor: ${listing.seller}\n` +
                            `   Condição: ${listing.condition}\n` +
                            `   Preço (dólares): $${listing.price}\n` +
                            `   Frete (nos US): $${listing.shipping}\n`;
                    });
                } else {
                    prompt += 'Produto fora de estoque\n';
                }
        
                prompt += '\n';
            });
        }
    } else {
        prompt += 'Não foi encontrado nenhum produto TCG que corresponde aos critérios.\n';
    }

    prompt += 'Inclua uma saudação amigável e mencione que uma nova lista será enviada em 24 horas. O nome do aplicativo é Pokemon TCG Scraper.';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return text;
}

function getHtmlFromProduct(product) {
    let productHtml = `
        <div class="product-details">
            <h2>Detalhes do Produto</h2>
            <p><strong>Título:</strong> ${product.title}</p>
            <p><strong>Coleção:</strong> ${product.set}</p>`;
    
    let rarity = product.rarity;
    if (rarity)
        productHtml += `<p><strong>Raridade:</strong> ${translateRarity(rarity)}</p>`;
    
    let number = product.number;
    if (number)
        productHtml += `<p><strong>Número:</strong> ${number}</p>`;
    
    productHtml += `
            <p><strong>Preço de Mercado (dólares):</strong> $${product.market_price}</p>
            <p><strong>Link para o produto da loja:</strong> <a href="${product.product_url}">Clique aqui</a></p>
        </div>`;

    if (product.top_listings.length > 0) {
        productHtml += `
        <div class="seller-details">
            <h2>Informações sobre os vendedores disponíveis</h2>`;
        product.top_listings.forEach((listing, index) => {
            productHtml += `
            <p><strong>Vendedor ${index + 1}:</strong></p>
            <p>Nome do vendedor: ${listing.seller}</p>
            <p>Condição do produto: ${translateCondition(listing.condition)}</p>
            <p>Preço (dólares): $${listing.price}</p>
            <p>Preço do frete (US): $${listing.shipping}</p>`;
        });
        productHtml += `</div>`;
    } else {
        productHtml += `<p>Não existem vendedores disponíveis no momento.</p>`;
    }

    return productHtml;
}

function createNotificationHtml(submissionData, filteredResults, timestamp) {
    let notificationHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Raspagem de Dados - Pokemon TCG Scraper</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 80%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #0A7090;
                font-size: 22px;
            }
            p {
                margin-bottom: 20px;
            }
            .product-details, .seller-details {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .product-details h2, .seller-details h2 {
                font-size: 18px;
                margin-bottom: 10px;
            }
            .product-details p, .seller-details p {
                margin: 5px 0;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Olá ${submissionData.userName},</h1>
            <p>Foi realizada uma raspagem de dados no site TCG Player às ${formatTimestamp(timestamp)}.</p>
            <p>O Pokemon TCG Scraper encontrou produtos que correspondem aos critérios de busca que você enviou:</p>`;
    
    if (filteredResults.length > 0) {
        filteredResults.sort((a, b) => parseFloat(a.market_price) - parseFloat(b.market_price));
        if (filteredResults.length > 5) {
            notificationHtml += `<p>Aqui estão os 5 produtos mais baratos que correspondem aos critérios de busca:</p>`;
            for (let i = 0; i < 5; i++) {
                notificationHtml += getHtmlFromProduct(filteredResults[i]);
            }
            notificationHtml += `<p>e mais outros ${filteredResults.length - 5} ...</p>`;
        } else {
            filteredResults.forEach(product => {
                notificationHtml += getHtmlFromProduct(product);
            });
        }
    } else {
        notificationHtml += '<p>Infelizmente, o Pokemon TCG Scraper não encontrou produtos que correspondem aos critérios de busca que você enviou.</p>';
    }

    notificationHtml += `
            <p>Em 24 horas, uma nova lista será enviada.</p>
            <p>Atenciosamente,<br>Equipe de Notificações do Pokemon TCG Scraper</p>
            <div class="footer">
                <p>&copy; 2024 Pokemon TCG Scraper. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>`;
    
    return notificationHtml;
}

function getTextFromProduct(product) {
    let productText = `Título: ${product.title}\n`;
    productText += `Coleção: ${product.set}\n`;

    let rarity = product.rarity;
    if (rarity)
        productText += `Raridade: ${translateRarity(rarity)}\n`;

    let number = product.number;
    if (number)
        productText += `Número: ${number}\n`;

    productText += `Preço de Mercado (dólares): $${product.market_price}\n`;
    productText += `Link para o produto da loja: ${product.product_url}\n`;
    
    // Exiba todas informações de listagem de topo
    if (product.top_listings.length > 0) {
        productText += `Informações sobre os vendedores disponíveis:\n`;
        product.top_listings.forEach((listing, index) => {
            productText += `Vendedor ${index + 1}:\n`;
            productText += `   -> Nome do vendedor: ${listing.seller}\n`;
            productText += `   -> Condição do produto: ${translateCondition(listing.condition)}\n`;
            productText += `   -> Preço (dólares): $${listing.price}\n`;
            productText += `   -> Preço do frete (dólares): $${listing.shipping}\n\n`;
        });
    } else {
        productText += `Não existe vendedores disponíveis no momento\n\n`;
    }

    productText += '\n';

    return productText;
}

// Função para criar o texto da notificação
function createNotificationText(submissionData, filteredResults, timestamp) {
    let notificationText = `Olá ${submissionData.userName},\n\n`;
    notificationText += `Foi realizado uma raspagem de dados no site TCG Player às ${formatTimestamp(timestamp)}\n`;

    if (filteredResults.length > 0) {
        notificationText += `O Pokemon TCG Scraper encontrou produtos que correspondem aos critérios de busca que você enviou:\n\n`;
        // Ordene os resultados por preço de forma com que fique do menor para o maior
        filteredResults.sort((a, b) => parseFloat(a.market_price) - parseFloat(b.market_price));
        
        if (filteredResults.length > 5) {
            notificationText += `Aqui estão os 5 produtos mais baratos que correspondem aos critérios de busca:\n\n`;
            for (let i = 0; i < 5; i++) {
                notificationText += getTextFromProduct(filteredResults[i]);
            }
            notificationText += `e mais outros ${filteredResults.length - 5} ...\n\n`;
        } else {
            filteredResults.forEach(product => {
                notificationText += getTextFromProduct(product);
            });
        }
    } else {
        notificationText += 'Infelizmente o Pokemon TCG Scraper não encontrou produtos que correspondem aos critérios de busca que você enviou.s\n';
    }
    
    notificationText += `\nEm 24 horas, uma nova lista será enviada.\n`;
    notificationText += `Atenciosamente,\nEquipe de Notificações do Pokemon TCG Scraper`;
    
    return notificationText;
}

module.exports = {
    generatePersonalizedText,
    createNotificationHtml,
    createNotificationText
}