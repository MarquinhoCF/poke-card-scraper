const express = require('express');
const submissionController = require('./controllers/submissionController');
const productController = require('./controllers/productController');

const router = express.Router();

// Submission routes
router.post('/storeData', submissionController.storeData);
router.post('/notify', submissionController.notify);

// Product routes
router.get('/products', productController.getProducts);
router.get('/chartData/:productKey', productController.getProductChartData);
router.get('/product/:productKey', productController.getProduct);
router.get('/data/lastTimestamp', productController.getLastTimestamp);

module.exports = router;
