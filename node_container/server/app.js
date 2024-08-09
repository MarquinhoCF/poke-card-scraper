const express = require('express');

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'Seja Bem-Vindo(a) ao mundo Docker!',
    version: '1.0.0',
  });
});

app.listen(port);
console.log('Aplicação executando na porta ', port);