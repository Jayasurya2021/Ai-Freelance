const aiProvider = require('./aiProvider');
const promptService = require('./promptService');

exports.analyzeAndMatch = async (userId, opportunityText, userProfile) => {
    const systemPrompt = promptService.getAnalyzerPrompt();
    const userPrompt = promptService.buildUserContext(opportunityText, userProfile);
    
    // Calls the AI Provider configured by the user
    const analysis = await aiProvider.analyze(userId, systemPrompt, userPrompt);
    
    return analysis;
};
