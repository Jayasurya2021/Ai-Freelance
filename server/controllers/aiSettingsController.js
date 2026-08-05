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
            geminiModel: settings.geminiModel,
            openaiModel: settings.openaiModel,
            hasGeminiKey: !!settings.geminiKey,
            hasOpenaiKey: !!settings.openaiKey
        };
        res.json(safeSettings);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.saveSettings = async (req, res) => {
    const { provider, geminiKey, openaiKey, geminiModel, openaiModel } = req.body;
    
    try {
        let settings = await AISettings.findOne({ userId: req.user.id });
        if (!settings) {
            settings = new AISettings({ userId: req.user.id });
        }
        
        if (provider) settings.provider = provider;
        if (geminiModel) settings.geminiModel = geminiModel;
        if (openaiModel) settings.openaiModel = openaiModel;
        
        // Only update keys if new ones were provided
        if (geminiKey) settings.geminiKey = cryptoService.encrypt(geminiKey);
        if (openaiKey) settings.openaiKey = cryptoService.encrypt(openaiKey);
        
        await settings.save();
        res.json({ message: "Settings saved successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.testConnection = async (req, res) => {
    const { provider, apiKey, modelName } = req.body;
    try {
        const result = await aiProvider.testConnection(provider, apiKey, modelName);
        if (result.status === 'error') {
            return res.status(400).json({ message: "Connection Failed", details: result.message });
        }
        res.json({ message: "Connected successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Test failed", details: err.message });
    }
};
