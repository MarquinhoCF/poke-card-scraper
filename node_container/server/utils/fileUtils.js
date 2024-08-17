const fs = require('fs-extra');
const path = require('path');
const { dataDir, submitsPath } = require('../config/env');

exports.saveSubmission = (formData) => {
  return fs.ensureDir(path.dirname(submitsPath))
    .then(() => fs.pathExists(submitsPath))
    .then((exists) => exists ? fs.readJson(submitsPath) : [])
    .then((submits) => {
      // Verifica se já existe um registro com o mesmo nome de usuário e (email ou telefone)
      // Se existir ele atualiza os dados, caso contrário adiciona um novo registro
      const existingIndex = submits.findIndex(submit => 
        submit.userName === formData.userName 
        && ((submit.email !== "" && submit.email === formData.email)
        || (submit.phone !== "" && submit.phone === formData.phone))
      );

      let msg;
      if (existingIndex !== -1) {
        // Substitui o registro existente pelo novo formData
        submits[existingIndex] = formData;
        msg = 'Critérios para notificação atualizados com sucesso!';
      } else {
        // Adiciona o novo registro se não existir um duplicado
        submits.push(formData);
        msg = 'Critérios para notificação recebidos com sucesso!';
      }

      fs.writeJson(submitsPath, submits, { spaces: 2 })

      return msg;
    });
};

exports.updateHistory = (newData, timestamp) => {
  const historyFilePath = path.join(dataDir, 'history.json');

  if (!Array.isArray(newData)) {
    throw new Error('Formato de dados inválido. Esperado um array de objetos.');
  }

  let existingData = {};
  if (fs.existsSync(historyFilePath)) {
    try {
      const fileData = fs.readFileSync(historyFilePath, 'utf8');
      existingData = JSON.parse(fileData);
    } catch (err) {
      console.error('Erro ao ler o arquivo history.json:', err);
      throw new Error('Erro ao ler o arquivo history.json.');
    }
  }

  // Atualiza ou adiciona novos dados para cada produto
  newData.forEach((productData, index) => {
    try {
      const productTitle = productData.title;
      const productSet = productData.set;
      const productRarity = productData.rarity;
      const productMarketPrice = productData.market_price;

      let productKey = `${productTitle}, ${productSet}`;
      if (productRarity) {
        productKey += `, ${productRarity}`;
      }

      if (existingData[productKey]) {
        existingData[productKey].market_prices.push(productMarketPrice);
        existingData[productKey].timestamps.push(timestamp);
      } else {
        existingData[productKey] = {
          market_prices: [productMarketPrice],
          timestamps: [timestamp]
        };
      }
    } catch (err) {
      console.error(`Erro ao processar o item ${index}:`, err);
    }
  });

  // Salva os dados atualizados no arquivo JSON
  fs.writeFile(historyFilePath, JSON.stringify(existingData, null, 2), err => {
    if (err) {
      console.error('Erro ao salvar dados no JSON:', err);
      throw new Error('Erro ao salvar dados.');
    }
  });
}

// Salva o array completo em um novo arquivo JSON
exports.saveData = (newData, timestamp) => {
  const dataFilePath = path.join(dataDir, 'data.json');

  const completeData = {
    timestamp,
    data: newData
  };

  fs.writeFileSync(dataFilePath, JSON.stringify(completeData, null, 2), err => {
    if (err) {
      console.error('Erro ao salvar o array completo no JSON:', err);
      return res.status(500).send('Erro ao salvar o array completo.');
    }
  });
}

exports.readHistoryData = () => {
  const historyFilePath = path.join(dataDir, 'history.json');

  return fs.pathExists(historyFilePath)
  .then((exists) => {
    if (!exists) {
      throw new Error('O arquivo history.json não foi encontrado.');
    }
    return fs.readJson(historyFilePath);
  })
  .catch((err) => {
    console.error('Erro ao acessar o arquivo history.json:', err.message);
    throw err;
  });
};

exports.readData = () => {
  const dataFilePath = path.join(dataDir, 'data.json');

  return fs.pathExists(dataFilePath)
  .then((exists) => {
    if (!exists) {
      throw new Error('O arquivo data.json não foi encontrado.');
    }
    return fs.readJson(dataFilePath);
  })
  .catch((err) => {
    console.error('Erro ao acessar o arquivo data.json:', err.message);
    throw err;
  });
};

// Função para carregar a fila de submissões do arquivo
exports.loadSubmissionQueue = () => {
  if (fs.existsSync(submitsPath)) {
    const submissionData = fs.readFileSync(submitsPath, 'utf8');
    return JSON.parse(submissionData);
  }
  return [];
};

exports.getLatestTimestamp = () => {
  const dataFilePath = path.join(dataDir, 'data.json');

  if (fs.existsSync(dataFilePath)) {
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const jsonData = JSON.parse(fileData);
    return jsonData.timestamp;
  } else {
    throw new Error('O último timestamp não pode ser encontrado porque o arquivo data.json não foi encontrado.');
  }
}

exports.filterProducts = (criteria) => {
  // Caminho para o arquivo JSON contendo os produtos
  const dataFilePath = path.join(dataDir, 'data.json');
  
  // Função para aplicar os critérios de filtragem
  const applyFilters = (product, criteria) => {
    let matches = true;

    if (criteria.title) {
      matches = matches && product.title.toLowerCase().includes(criteria.title.toLowerCase());
    }
    if (criteria.set) {
      matches = matches && product.set.toLowerCase() === criteria.set.toLowerCase();
    }
    if (criteria.rarity) {
      matches = matches && product.rarity != null && product.rarity.toLowerCase() === criteria.rarity.toLowerCase();
    }
    if (criteria.condition) {
      matches = matches && product.top_listings.some(listing => 
        listing.condition.toLowerCase() === criteria.condition.toLowerCase()
      );
    }
    if (criteria.price) {
      matches = matches && parseFloat(product.market_price) <= criteria.price;
    }

    return matches;
  };

  // Lê o arquivo JSON e filtra os produtos com base nos critérios fornecidos
  return fs.readJson(dataFilePath)
    .then((products) => {
      return products.data.filter(product => applyFilters(product, criteria));
    });
};