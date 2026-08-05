const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['rss', 'url', 'api'], required: true },
    url: { type: String, required: true },
    intervalMinutes: { type: Number, default: 60 },
    status: { type: String, enum: ['active', 'inactive', 'error'], default: 'active' },
    lastChecked: { type: Date },
    lastSuccess: { type: Date },
    errorCount: { type: Number, default: 0 },
    lastError: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Source', sourceSchema);
