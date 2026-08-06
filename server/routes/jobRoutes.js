const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, jobController.getJobs);
router.get('/:id', protect, jobController.getJobDetails);
router.post('/analyze', protect, jobController.analyzeManualJob);
router.post('/:id/save', protect, jobController.toggleSaveJob);
router.post('/:id/hide', protect, jobController.toggleHideJob);

module.exports = router;
