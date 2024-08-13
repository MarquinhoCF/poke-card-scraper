const { readHistoryData, readData } = require('../utils/fileUtils');

exports.getProduct = (req, res) => {
  const productKey = decodeURIComponent(req.params.productKey);

  // Separando a string com base na vírgula
  const [title, set, rarity] = productKey.split(',').map(item => item.trim());

  readData()
    .then((jsonData) => {
      for (const product of jsonData.data) {
        if (product.title === title && product.set === set && (rarity === undefined || product.rarity === rarity)) {
          return res.status(200).json(product);
        }
      }

      return res.status(404).json({ message: 'Produto não encontrado' });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
}

exports.getProducts = (req, res) => {
  readHistoryData()
    .then((historyData) => {
      const productKeys = Object.keys(historyData);
      return res.status(200).json(productKeys)
    })
    .catch((err) => res.status(500).send(err.message));
};

exports.getProductChartData = (req, res) => {
  const productKey = decodeURIComponent(req.params.productKey);
  readHistoryData()
    .then((historyData) => {
      if (!historyData[productKey]) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      const productHistoryData = historyData[productKey];
      const chartData = productHistoryData.market_prices.map((price, index) => ({
        price,
        time: productHistoryData.timestamps[index],
      }));

      res.json(chartData);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.getLastTimestamp = (req, res) => {
  readData()
    .then((jsonData) => {
      if (!jsonData) {
        return res.status(500).json({ message: 'Arquivo data.json não encontrado' });
      }

      return res.status(200).json({ timestamp: jsonData.timestamp });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message })
    });
};