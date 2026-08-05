const mongoose = require('mongoose');

const searchProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    profileMode: { type: String, enum: ['freelance', 'job'], required: true },
    name: { type: String, required: true }, // e.g., "React Developer", "Ecommerce"
    keywords: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    jobTitles: { type: [String], default: [] },
    countries: { type: [String], default: [] },
    remotePreference: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 1 }, // 1 = High, 2 = Medium, 3 = Low
    scheduleInterval: { type: String, default: '1 Hour' } // e.g. "15 Minutes", "1 Hour"
}, {
    timestamps: true
});

module.exports = mongoose.model('SearchProfile', searchProfileSchema);
