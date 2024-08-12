const cron = require('node-cron');
const fs = require('fs-extra');
const { submitsPath } = require('../config/env');
const { filterProducts } = require('../utils/fileUtils');

// Função para carregar a fila de submissões do arquivo
const loadSubmissionQueue = () => {
  if (fs.existsSync(submitsPath)) {
    const submissionData = fs.readFileSync(submitsPath, 'utf8');
    return JSON.parse(submissionData);
  }
  return [];
};

let submissionQueue = loadSubmissionQueue();

cron.schedule('*/1 * * * *', () => {
  console.log('Executando tarefa cron a cada 1 minuto');

  // Recarrega a fila de submissões antes de processar
  submissionQueue = loadSubmissionQueue();

  submissionQueue.forEach((submissionData, index) => {
    const criteria = {
      title: submissionData.title,
      set: submissionData.set,
      rarity: submissionData.rarity,
      condition: submissionData.condition,
      price: submissionData.price,
    };

    filterProducts(criteria)
      .then((filteredResults) => {
        console.log(`Produtos filtrados para a requisição de teste ${index + 1}:`, filteredResults);
      })
      .catch((err) => {
        console.error(`Erro ao filtrar produtos para a requisição de teste ${index + 1}:`, err);
      });
  });
});
