const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: { type: [String], default: [] },
    experience: { type: String, default: '' },
    resumeLink: { type: String, default: '' },
    githubLink: { type: String, default: '' },
    portfolioLink: { type: String, default: '' },
    linkedinLink: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    preferredCountries: { type: [String], default: [] },
    preferredProjectTypes: { type: [String], default: [] },
    preferredBudget: { type: Number, default: 0 },
    preferredTechStack: { type: [String], default: [] },
    rssFeeds: { type: [String], default: [] },
    resumeText: { type: String, default: '' },
    portfolioProjects: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String, default: '' }
    }],
    notificationThreshold: { type: Number, default: 70 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
