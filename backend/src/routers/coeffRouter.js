const express = require('express');
const coeffController = require('../controllers/coeffController');

const router = express.Router();

router.get('/', coeffController.getCoefficients);
router.post('/', coeffController.updateCoefficients);

module.exports = router;