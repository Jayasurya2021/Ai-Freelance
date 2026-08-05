const express = require('express');
const router = express.Router();
const analyzerController = require('../controllers/analyzerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/url', authMiddleware, analyzerController.analyzeUrl);
router.post('/extension', authMiddleware, analyzerController.analyzeExtension);

module.exports = router;
