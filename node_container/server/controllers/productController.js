const { readHistoryData, filterProducts } = require('../utils/fileUtils');

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
