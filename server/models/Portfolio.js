const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    profileMode: { type: String, enum: ['freelance', 'job'], required: true, default: 'freelance' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    category: { type: String, default: 'General' },
    difficulty: { type: String, default: 'Medium' },
    projectType: { type: String, default: 'Personal' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
