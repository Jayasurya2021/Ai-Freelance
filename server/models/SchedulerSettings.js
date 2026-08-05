const mongoose = require('mongoose');

const schedulerSettingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, unique: true },
    intervalMinutes: { type: Number, default: 60 },
    minimumMatchScore: { type: Number, default: 70 },
    enableMonitoring: { type: Boolean, default: true },
    notifyInApp: { type: Boolean, default: true },
    notifyBrowser: { type: Boolean, default: false },
    notifyEmail: { type: Boolean, default: false },
    notifyTelegram: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('SchedulerSettings', schedulerSettingsSchema);
