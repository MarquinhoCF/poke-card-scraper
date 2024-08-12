const { formatTimestamp, formatPhoneNumber } = require('./format');
const transport = require('../config/smtp');
const client = require('../config/twilio');
require('dotenv').config({ path: './server/.env' });

function getTextFromProduct(product) {
    let productText = `Título: ${product.title}\n`;
    productText += `Set: ${product.set}\n`;

    let rarity = product.rarity;
    if (rarity)
        productText += `Raridade: ${rarity}\n`;

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
            productText += `   -> Condição do produto: ${listing.condition}\n`;
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
    // notificationText += `Se você deseja cancelar a inscrição, responda a esta mensagem com a palavra "Cancelar".\n\n`;
    notificationText += `Atenciosamente,\nEquipe de Notificações do Pokemon TCG Scraper`;
    
    return notificationText;
}

// Função para enviar e-mail
function sendEmail(submissionData, notificationText) {
    if (!submissionData.email || submissionData.email.trim() === '') {
        console.log('Erro: Endereço de e-mail não definido ou vazio.');
        return;
    }

    const contentEmail = {
        from: `Pokemon TCG Scraper <${process.env.EMAIL_USER}>`,
        to: submissionData.email,
        subject: 'Notificação de Produtos Pokemon TCG Encontrados',
        text: notificationText
    };

    transport.sendMail(contentEmail)
        .then(() => console.log('E-mail enviado:', contentEmail))
        .catch(error => console.log('Erro ao enviar e-mail:', error));
}

// Função para enviar SMS
function sendSMS(submissionData, notificationText) {
    let phoneNumber = formatPhoneNumber(submissionData.phone);
    
    console.log('Enviando SMS para:', phoneNumber);

    client.messages.create({
        body: notificationText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
    })
    .then(message => console.log('SMS enviado:', message.sid))
    .catch(error => console.log('Erro ao enviar SMS:', error));
}

// Função principal para enviar notificações
function sendNotification(submissionData, filteredResults, timestamp) {
    const notificationText = createNotificationText(submissionData, filteredResults, timestamp);

    // if (submissionData.notificationsMethods.includes('E-mail')) {
    //     sendEmail(submissionData, notificationText);
    // }
    if (submissionData.notificationsMethods.includes('SMS')) {
        sendSMS(submissionData, notificationText);
    }
}

module.exports = sendNotification;