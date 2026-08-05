const mongoose = require('mongoose');

const monitoringLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['success', 'error', 'partial_success'], required: true },
    sourcesChecked: { type: Number, default: 0 },
    opportunitiesFound: { type: Number, default: 0 },
    duplicatesSkipped: { type: Number, default: 0 },
    notificationsSent: { type: Number, default: 0 },
    aiProcessingTimeMs: { type: Number, default: 0 },
    errorDetails: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('MonitoringLog', monitoringLogSchema);
