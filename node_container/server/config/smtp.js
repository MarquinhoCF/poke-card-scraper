const nodeMailer = require('nodemailer');
require('dotenv').config({ path: './server/.env' });

const transport = nodeMailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = transport;