const cron = require('node-cron');
const { filterProducts, getLatestTimestamp, loadSubmissionQueue } = require('../utils/fileUtils');
const sendNotification = require('../utils/notifications');

let submissionQueue = loadSubmissionQueue();

// Tarefa cron para processar as notificações
cron.schedule('0 0 * * *', () => {
  console.log('Executando tarefa cron a cada 24 horas');

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
        let timestamp = getLatestTimestamp();
        sendNotification(submissionData, filteredResults, timestamp);
        // console.log(`Produtos filtrados para a requisição de teste ${index + 1}:`, filteredResults);
      })
      .catch((err) => {
        console.error(`Erro ao filtrar produtos para a requisição de teste ${index + 1}:`, err);
      });
  });
});
