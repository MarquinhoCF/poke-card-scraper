const { getLatestTimestamp, readData } = require('../utils/fileUtils');

exports.getLastTimestamp = (req, res) => {
    try {
        return res.status(200).json({ timestamp: getLatestTimestamp() });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

exports.getStatistics = (req, res) => {
    readData()
        .then((jsonData) => {
            const statistics = {
                totalProducts: jsonData.data.length,
                maxMarketPrice: null,
                minMarketPrice: null,
                setCounts: {},
                rarityCounts: {},
                conditionCounts: {}
            };

            const marketPrices = jsonData.data
                .map(product => parseFloat(product.market_price))
                .filter(price => !isNaN(price));

            if (marketPrices.length > 0) {
                statistics.maxMarketPrice = Math.max(...marketPrices);
                statistics.minMarketPrice = Math.min(...marketPrices);
            }

            jsonData.data.forEach(product => {
                const setName = product.set;
                if (setName) {
                    statistics.setCounts[setName] = (statistics.setCounts[setName] || 0) + 1;
                }

                const rarity = product.rarity;
                if (rarity) {
                    statistics.rarityCounts[rarity] = (statistics.rarityCounts[rarity] || 0) + 1;
                }

                const topListings = product.top_listings || [];
                topListings.forEach(listing => {
                    const condition = listing.condition;
                    if (condition) {
                        statistics.conditionCounts[condition] = (statistics.conditionCounts[condition] || 0) + 1;
                    }
                });
            });

            return res.status(200).json(statistics);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: "Erro ao calcular as estatísticas." });
        });
}