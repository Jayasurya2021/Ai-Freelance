const AISettings = require('../models/AISettings');
const cryptoService = require('../services/cryptoService');
const aiProvider = require('../services/aiProvider');

exports.getSettings = async (req, res) => {
    try {
        const settings = await AISettings.findOne({ userId: req.user.id });
        if (!settings) return res.json(null);
        
        // Don't send back the raw or encrypted keys to the frontend!
        // Just send a flag if they exist
        const safeSettings = {
            provider: settings.provider,
            geminiModel: settings.geminiModel === 'gemini-2.5-flash' ? 'gemini-3.5-flash' : settings.geminiModel,
            openaiModel: settings.openaiModel,
            hasGeminiKey: !!settings.geminiKey,
            hasOpenaiKey: !!settings.openaiKey,
            hasGroqKey: !!settings.groqKey
        };
        res.json(safeSettings);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.saveSettings = async (req, res) => {
    const { provider, geminiKey, openaiKey, groqKey, geminiModel, openaiModel } = req.body;
    
    try {
        let settings = await AISettings.findOne({ userId: req.user.id });
        if (!settings) {
            settings = new AISettings({ userId: req.user.id });
        }
        
        if (provider) settings.provider = provider;
        if (geminiModel) {
            settings.geminiModel = geminiModel === 'gemini-2.5-flash' ? 'gemini-3.5-flash' : geminiModel;
        }
        if (openaiModel) settings.openaiModel = openaiModel;
        
        // Only update keys if new ones were provided
        if (geminiKey) settings.geminiKey = cryptoService.encrypt(geminiKey);
        if (openaiKey) settings.openaiKey = cryptoService.encrypt(openaiKey);
        if (groqKey) settings.groqKey = cryptoService.encrypt(groqKey);
        
        await settings.save();
        res.json({ message: "Settings saved successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.testConnection = async (req, res) => {
    let { groqKey, geminiKey } = req.body;
    try {
        const settings = await AISettings.findOne({ userId: req.user.id });
        
        // Use saved keys if not provided in request
        if (!geminiKey && settings?.geminiKey) {
            geminiKey = cryptoService.decrypt(settings.geminiKey);
        }
        if (!groqKey && settings?.groqKey) {
            groqKey = cryptoService.decrypt(settings.groqKey);
        }

        let successMessages = [];
        let errorMessages = [];
        
        // Try Gemini
        if (geminiKey) {
            const geminiResult = await aiProvider.testConnection('gemini', geminiKey, 'gemini-3.5-flash');
            if (geminiResult.status === 'error') {
                errorMessages.push(`Gemini Failed: ${geminiResult.message}`);
            } else {
                successMessages.push("Gemini Connected!");
            }
        }

        // Try Groq
        if (groqKey) {
            const groqResult = await aiProvider.testConnection('groq', groqKey, 'llama-3.1-8b-instant');
            if (groqResult.status === 'error') {
                errorMessages.push(`Groq Failed: ${groqResult.message}`);
            } else {
                successMessages.push("Groq Connected!");
            }
        }

        if (successMessages.length === 0 && errorMessages.length === 0) {
            return res.status(400).json({ message: "No keys provided to test." });
        }
        
        if (errorMessages.length > 0) {
            return res.status(400).json({ message: "Connection Test Failed", details: errorMessages.join(" | ") });
        }

        res.json({ message: successMessages.join(" | ") });
    } catch (err) {
        res.status(500).json({ message: "Test failed", details: err.message });
    }
};
