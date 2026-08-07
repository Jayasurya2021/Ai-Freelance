const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const protect = require('../middleware/authMiddleware');

// GET /api/opportunities
router.get('/', protect, opportunityController.getOpportunities);

// GET /api/opportunities/stats
router.get('/stats', protect, opportunityController.getDashboardStats);

// GET /api/opportunities/kanban
router.get('/kanban', protect, opportunityController.getKanbanBoard);

// POST /api/opportunities/ingest (Admin/Internal use)
router.post('/ingest', protect, opportunityController.triggerIngestion);

// PUT /api/opportunities/:id/save (Toggle save status)
router.put('/:id/save', protect, opportunityController.toggleSave);

// PUT /api/opportunities/:id/status (Update status to Applied, Ignored, etc.)
router.put('/:id/status', protect, opportunityController.updateStatus);

// POST /api/opportunities/:id/proposal (Generate proposal)
router.post('/:id/proposal', protect, opportunityController.generateProposal);

// POST /api/opportunities/ingest-url
router.post('/ingest-url', protect, opportunityController.triggerUrlIngestion);

module.exports = router;
