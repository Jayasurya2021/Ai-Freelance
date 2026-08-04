const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

// GET /api/opportunities
router.get('/', opportunityController.getOpportunities);

// GET /api/opportunities/stats
router.get('/stats', opportunityController.getDashboardStats);

// GET /api/opportunities/kanban
router.get('/kanban', opportunityController.getKanbanBoard);

// POST /api/opportunities/ingest (Admin/Internal use)
router.post('/ingest', opportunityController.triggerIngestion);

// PUT /api/opportunities/:id/save (Toggle save status)
router.put('/:id/save', opportunityController.toggleSave);

// PUT /api/opportunities/:id/status (Update status to Applied, Ignored, etc.)
router.put('/:id/status', opportunityController.updateStatus);

// POST /api/opportunities/:id/proposal (Generate proposal)
router.post('/:id/proposal', opportunityController.generateProposal);

// POST /api/opportunities/ingest-url
router.post('/ingest-url', opportunityController.triggerUrlIngestion);

module.exports = router;
