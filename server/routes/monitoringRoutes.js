const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/settings', authMiddleware, monitoringController.getSettings);
router.post('/settings', authMiddleware, monitoringController.updateSettings);
router.get('/logs', authMiddleware, monitoringController.getLogs);
router.post('/run', authMiddleware, monitoringController.triggerManualRun);

module.exports = router;
