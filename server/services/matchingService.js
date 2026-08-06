const aiProvider = require('./aiProvider');
const promptService = require('./promptService');
const Portfolio = require('../models/Portfolio');
const Resume = require('../models/Resume');

exports.analyzeAndMatch = async (userId, opportunityText, userProfile) => {
    try {
        const portfolios = await Portfolio.find({ userId });
        const resumes = await Resume.find({ userId });

        const systemPrompt = promptService.getAnalyzerPrompt();
        const userPrompt = promptService.buildUserContext(opportunityText, userProfile, portfolios, resumes);
    
        // Calls the AI Provider configured by the user
        const analysis = await aiProvider.analyze(userId, systemPrompt, userPrompt);
    
        return analysis;
    } catch (error) {
        throw error;
    }
};
