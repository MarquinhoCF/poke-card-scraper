const { formatPhoneNumber } = require('./format');
const transport = require('../config/smtp');
const client = require('../config/twilio');
const { createNotificationText, createNotificationHtml, generatePersonalizedText } = require('./messages');
require('dotenv').config({ path: './server/.env' });

// Função para enviar e-mail
function sendEmail(submissionData, notificationText) {
    if (!submissionData.email || submissionData.email.trim() === '') {
        console.log('Erro: Endereço de e-mail não definido ou vazio.');
        throw new Error('Endereço de e-mail não definido ou vazio.');
    }

    const contentEmail = {
        from: `Pokemon TCG Scraper <${process.env.EMAIL_USER}>`,
        to: submissionData.email,
        subject: 'Notificação de Produtos Pokemon TCG',
        text: notificationText
    };

    transport.sendMail(contentEmail)
        .then(() => console.log('E-mail enviado:', contentEmail))
        .catch(error => console.log('Erro ao enviar e-mail:', error));
}

// Função para enviar SMS
function sendSMS(submissionData, notificationText) {
    if (!submissionData.phone || submissionData.phone.trim() === '') {
        console.log('Erro: Número de telefone não definido ou vazio.');
        throw new Error('Número de telefone não definido ou vazio.');
    }

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
async function sendNotification(submissionData, filteredResults, timestamp) {
    try {
        // Ordena os resultados filtrados por preço de mercado de forma crescente
        const ordnedResults = filteredResults.sort((a, b) => a.market_price - b.market_price);

        // Gera o texto personalizado da notificação
        const notificationText = await generatePersonalizedText(submissionData, ordnedResults, timestamp);

        if (submissionData.notificationsMethods.includes('E-mail')) {
            //sendEmail(submissionData, notificationText);
        }
        if (submissionData.notificationsMethods.includes('SMS')) {
            // sendSMS(submissionData, notificationText);
        }
    } catch (error) {
        console.error('Erro ao gerar texto da notificação:', error);
    }
}

module.exports = sendNotification;