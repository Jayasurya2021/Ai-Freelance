const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false, unique: true, sparse: true },
    // Freelance Profile Details
    skills: { type: [String], default: [] },
    experience: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    preferredBudget: { type: Number, default: 0 },
    preferredCountries: { type: [String], default: [] },
    preferredIndustries: { type: [String], default: [] },
    preferredProjectTypes: { type: [String], default: [] },
    preferredTechnologies: { type: [String], default: [] },
    proposalTemplate: { type: String, default: '' },
    careerGoals: { type: [String], default: [] },
    resumeText: { type: String, default: '' },
    
    // Global Settings
    notificationThreshold: { type: Number, default: 70 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
