const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');

// Multer config for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload and Parse Resume
router.post('/upload', upload.single('resumeFile'), resumeController.uploadResume);

// Check ATS Score
router.post('/check-ats', resumeController.checkAts);

// Generate Tailored Resume
router.post('/generate-tailored', resumeController.generateTailoredResume);

module.exports = router;
