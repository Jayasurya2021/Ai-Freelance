const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/source-health', authMiddleware, analyticsController.getSourceHealth);
router.get('/skill-gap', authMiddleware, analyticsController.getSkillGap);
router.get('/daily-brief', authMiddleware, analyticsController.getDailyBrief);
router.post('/learning/feedback', authMiddleware, analyticsController.recordLearningFeedback);
router.get('/profile-completeness', authMiddleware, analyticsController.getProfileCompleteness);
router.get('/search-performance', authMiddleware, analyticsController.getSearchPerformance);
router.get('/insights', authMiddleware, analyticsController.generateInsights);

module.exports = router;
