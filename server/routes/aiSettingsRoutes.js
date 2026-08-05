const express = require('express');
const router = express.Router();
const aiSettingsController = require('../controllers/aiSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, aiSettingsController.getSettings);
router.post('/', authMiddleware, aiSettingsController.saveSettings);
router.post('/test', authMiddleware, aiSettingsController.testConnection);

module.exports = router;
