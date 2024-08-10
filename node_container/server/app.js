const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Variável para armazenar os chunks recebidos
const receivedChunks = {};

const submitsPath = path.join(__dirname, '..', 'submit', 'submits.json');

// Middleware para analisar JSON
app.use(bodyParser.json({ limit: '50mb' }));

// Servir arquivos estáticos da pasta 'public'
const dataDir = path.join(__dirname, '..', 'data');
app.use(express.static(path.join(__dirname, '..' , 'public')));

// Garantir que o diretório 'data' exista
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Endpoint para receber dados e salvar no CSV
app.post('/storeData', (req, res) => {
  const { timestamp, data_chunk, chunk_index, total_chunks } = req.body;
    
  if (!timestamp || data_chunk === undefined || chunk_index === undefined || total_chunks === undefined) {
      return res.status(400).send('Dados incompletos');
  }

  if (!receivedChunks[timestamp]) {
      receivedChunks[timestamp] = [];
  }
  
  receivedChunks[timestamp][chunk_index] = JSON.parse(data_chunk);

  // Verificar se todos os chunks foram recebidos
  if (receivedChunks[timestamp].length === total_chunks) {
    // Unir os chunks e processar os dados
    const completeData = receivedChunks[timestamp].flat();
    delete receivedChunks[timestamp]; // Limpar após processamento

    // Processar dados completos
    console.log('Dados completos recebidos:', completeData);

    const jsonHistoryFilePath = path.join(dataDir, 'history.json');
    const jsonDataFilePath = path.join(dataDir, 'data.json');

    if (!Array.isArray(completeData)) {
      return res.status(400).send('Formato de dados inválido. Esperado um array de objetos.');
    }

    // Leitura e atualização do arquivo JSON
    let existingData = {};
    if (fs.existsSync(jsonHistoryFilePath)) {
      const fileData = fs.readFileSync(jsonHistoryFilePath);
      existingData = JSON.parse(fileData);
    }

    // Atualiza ou adiciona novos dados para cada jogador
    completeData.forEach(cardData => {
      const cardTitle = cardData.title;
      const cardSet = cardData.set;
      const cardRarity = cardData.rarity;
      const cardMarketPrice = cardData.market_price;

      cardKey = cardTitle + ', ' + cardSet + ', ' + cardRarity;
      if (existingData[cardKey]) {
        existingData[cardKey].prices.push(cardMarketPrice);
        existingData[cardKey].receivedAt.push(timestamp);
      } else {
        existingData[cardKey] = {
          prices: [cardMarketPrice],
          receivedAt: [timestamp]
        };
      }
    });

    // Salva os dados atualizados no arquivo JSON
    fs.writeFile(jsonHistoryFilePath, JSON.stringify(existingData, null, 2), err => {
      if (err) {
        console.error('Erro ao salvar dados no JSON:', err);
        return res.status(500).send('Erro ao salvar dados.');
      }
    });

    // Salva o array completo em um novo arquivo JSON
    fs.writeFileSync(jsonDataFilePath, JSON.stringify(completeData, null, 2), err => {
      if (err) {
        console.error('Erro ao salvar o array completo no JSON:', err);
        return res.status(500).send('Erro ao salvar o array completo.');
      }
    });

    res.send('Dados recebidos com sucesso');
  } else {
    res.send('Chunk recebido com sucesso');
  }
  
});





app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'form', 'index.html'));
});

app.post('/notify', async (req, res) => {
  const formData = req.body;

  console.log('Dados do formulário recebidos:', formData);

  if (!formData) {
    return res.status(400).json({ message: 'Erro ao receber formulário' });
  }

  try {
    // Verifica se o diretório existe, se não, cria
    await fs.ensureDir(path.dirname(submitsPath));
    
    // Verifica se o arquivo existe
    let submits = [];
    if (await fs.pathExists(submitsPath)) {
      // Lê o conteúdo do arquivo existente
      const data = await fs.readFile(submitsPath, 'utf8');
      submits = JSON.parse(data);
    }

    // Verifica se já existe um registro com o mesmo username, email e phone
    const isDuplicate = submits.some(submit =>
      submit.userName === formData.userName && submit.email === formData.email && submit.phone === formData.phone
    );

    if (isDuplicate) {
      return res.status(400).json({ message: 'Registro já existente. Tente utilizar outro nome de usuário, email ou número de telefone.' });
    }

    // Adiciona o novo dado ao array de submits
    submits.push(formData);

    // Salva o array atualizado de submits no arquivo
    await fs.writeJson(submitsPath, submits, { spaces: 2 });

    return res.status(200).json({ message: 'Formulário recebido com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar dados:', err);
    return res.status(500).json({ message: 'Erro ao salvar dados.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});