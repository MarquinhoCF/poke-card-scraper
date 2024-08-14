const express = require('express');
const submissionController = require('./controllers/submissionController');
const productController = require('./controllers/productController');
const dataController = require('./controllers/dataController');

const router = express.Router();

// Submission routes
router.post('/storeData', submissionController.storeData);
router.post('/notify', submissionController.notify);

// Product routes
router.get('/products', productController.getProducts);
router.get('/chartData/:productKey', productController.getProductChartData);
router.get('/product/:productKey', productController.getProduct);

// Data routes
router.get('/data/lastTimestamp', dataController.getLastTimestamp);
router.get('/data/statistics', dataController.getStatistics);

module.exports = router;
