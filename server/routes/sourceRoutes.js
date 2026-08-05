const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, sourceController.getSources);
router.post('/', authMiddleware, sourceController.addSource);
router.put('/:id', authMiddleware, sourceController.updateSource);
router.delete('/:id', authMiddleware, sourceController.deleteSource);

module.exports = router;
