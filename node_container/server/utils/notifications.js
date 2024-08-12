const formatPhoneNumber = require('./format');
const transport = require('../config/smtp');
const client = require('../config/twilio');
const { createNotificationText, createNotificationHtml } = require('./messages');
require('dotenv').config({ path: './server/.env' });

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
        html: notificationText
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
    if (submissionData.notificationsMethods.includes('E-mail')) {
        const notificationHtml = createNotificationHtml(submissionData, filteredResults, timestamp);
        console.log('Texto da notificação:', notificationHtml);
        // sendEmail(submissionData, notificationHtml);
    }
    if (submissionData.notificationsMethods.includes('SMS')) {
        const notificationText = createNotificationText(submissionData, filteredResults, timestamp);
        console.log('Texto da notificação:', notificationText);
        // sendSMS(submissionData, notificationText);
    }
}

module.exports = sendNotification;