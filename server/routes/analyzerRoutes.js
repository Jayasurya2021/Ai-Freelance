const express = require('express');
const router = express.Router();
const analyzerController = require('../controllers/analyzerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/url', authMiddleware, analyzerController.analyzeUrl);

module.exports = router;
