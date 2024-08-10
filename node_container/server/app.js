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

// Endpoint para receber dados e salvar no arquivo JSON
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
    completeData.forEach(productData => {
      const productTitle = productData.title;
      const productSet = productData.set;
      const productRarity = productData.rarity;
      const productMarketPrice = productData.market_price;

      productKey = productTitle + ', ' + productSet;
      if (productKey)
        productKey += ', ' + productRarity;

      if (existingData[productKey]) {
        existingData[productKey].market_prices.push(productMarketPrice);
        existingData[productKey].timestamps.push(timestamp);
      } else {
        // Se for a primeira vez que estamos adicionando esta carta, criamos uma nova entrada com um UUID
        existingData[productKey] = {
          market_prices: [productMarketPrice],
          timestamps: [timestamp]
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

// Endpoint para obter a lista de jogadores
app.get('/products', (req, res) => {
  fs.readFile(path.join(dataDir, 'history.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler dados:', err);
      return res.status(500).send('Erro ao ler dados.');
    }

    let pokemonTCGData;
    try {
      pokemonTCGData = JSON.parse(data);
    } catch (parseErr) {
      console.error('Erro ao parsear JSON:', parseErr);
      return res.status(500).send('Erro ao parsear dados.');
    }

    const productKeys = Object.keys(pokemonTCGData)

    if (!pokemonTCGData || productKeys.length === 0) {
      return res.status(404).send('Nenhum dado encontrado.');
    }

    res.status(200).json(productKeys);
  });
});

// Endpoint para fornecer dados do gráfico de um jogador específico
app.get('/chartData/:productKey', (req, res) => {
  const productKey = decodeURIComponent(req.params.productKey);

  console.log('Obtendo dados do gráfico para:', productKey);

  fs.readFile(path.join(dataDir, 'history.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler dados' });
    }

    const historyData = JSON.parse(data);

    if (!historyData[productKey]) {
      return res.status(404).json({ message: 'Jogador não encontrado' });
    }

    const productHistoryData = historyData[productKey];
    console.log(productHistoryData)
    const chartData = productHistoryData.market_prices.map((price, index) => ({
      price: price,
      time: productHistoryData.timestamps[index]
    }));

    res.json(chartData);
  });
});

app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'form', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard', 'index.html'));
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