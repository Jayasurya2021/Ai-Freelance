const AISettings = require('../models/AISettings');
const cryptoService = require('./cryptoService');
const geminiProvider = require('./providers/gemini');
const openaiProvider = require('./providers/openai');

exports.analyze = async (userId, systemPrompt, userPrompt) => {
    // Fetch user settings
    const settings = await AISettings.findOne({ userId });
    
    // Default to environment variables if no user settings are configured
    let provider = process.env.DEFAULT_AI_PROVIDER || 'gemini';
    let apiKey = process.env.GEMINI_API_KEY;
    let modelName = 'gemini-2.5-flash';

    if (settings) {
        provider = settings.provider || provider;
        if (provider === 'gemini') {
            apiKey = cryptoService.decrypt(settings.geminiKey) || process.env.GEMINI_API_KEY;
            modelName = settings.geminiModel || 'gemini-2.5-flash';
        } else if (provider === 'openai') {
            apiKey = cryptoService.decrypt(settings.openaiKey) || process.env.OPENAI_API_KEY;
            modelName = settings.openaiModel || 'gpt-4o';
        }
    } else if (provider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY;
        modelName = 'gpt-4o';
    }

    if (!apiKey) {
        throw new Error(`API key for ${provider} is not configured.`);
    }

    if (provider === 'gemini') {
        return await geminiProvider.analyze(apiKey, modelName, systemPrompt, userPrompt);
    } else if (provider === 'openai') {
        return await openaiProvider.analyze(apiKey, modelName, systemPrompt, userPrompt);
    } else {
        throw new Error(`Unsupported AI Provider: ${provider}`);
    }
};

exports.testConnection = async (provider, apiKey, modelName) => {
    const systemPrompt = "Respond with JSON: {\"status\": \"ok\", \"message\": \"connected\"}";
    const userPrompt = "Test";
    
    try {
        if (provider === 'gemini') {
            return await geminiProvider.analyze(apiKey, modelName, systemPrompt, userPrompt);
        } else if (provider === 'openai') {
            return await openaiProvider.analyze(apiKey, modelName, systemPrompt, userPrompt);
        } else {
            throw new Error(`Unsupported AI Provider: ${provider}`);
        }
    } catch (err) {
        return { status: "error", message: err.message };
    }
};
