const mongoose = require('mongoose');

const aiSettingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, unique: true },
    provider: { type: String, enum: ['gemini', 'openai'], default: 'gemini' },
    geminiKey: { type: String, default: '' },
    openaiKey: { type: String, default: '' },
    groqKey: { type: String, default: '' },
    geminiModel: { type: String, default: 'gemini-1.5-flash' },
    openaiModel: { type: String, default: 'gpt-4o' }
}, {
    timestamps: true
});

module.exports = mongoose.model('AISettings', aiSettingsSchema);
