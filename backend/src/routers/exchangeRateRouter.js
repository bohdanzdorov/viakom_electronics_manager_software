const express = require('express');
const exchangeRateController = require('../controllers/exchangeRateController');

const router = express.Router();

router.get('/', exchangeRateController.getExchangeRate);

module.exports = router;