const express = require('express');
const path = require('path');
const multer = require('multer');

const upload = multer(); // para lidar com form-data
const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '..' , 'public')));

app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'form', 'index.html'));
});

app.post('/notify', upload.none(), (req, res) => {
  const formData = req.body;

  console.log('Dados do formulário recebidos:', formData);

  if (!formData) {
    return res.status(400).json({ message: 'Erro ao receber formulário' });
  } else {
    return res.status(200).json({ message: 'Formulário recebido com sucesso' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});