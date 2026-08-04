const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    // Core details
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Source Transparency
    sourceName: { type: String, required: true }, // e.g. "Upwork RSS", "Startup Community"
    originalUrl: { type: String, required: true, unique: true },
    publishedDate: { type: Date },
    company: { type: String, default: 'Unknown' },
    platform: { type: String, default: 'Public Web' },
    
    // AI Analyzed Fields
    matchScore: { type: Number, default: 0 }, // 0 - 100
    matchReasons: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    
    projectType: { type: String, default: '' },
    industry: { type: String, default: '' },
    requiredSkills: { type: [String], default: [] },
    budget: { type: String, default: 'Not specified' },
    timeline: { type: String, default: 'Not specified' },
    country: { type: String, default: 'Any/Remote' },
    difficulty: { type: String, default: 'Unknown' },
    estimatedHours: { type: String, default: 'Unknown' },
    recommendedPrice: { type: String, default: 'Unknown' },
    scamRisk: { type: String, default: 'Low' },
    urgency: { type: String, default: 'Normal' },
    
    // New AI Recommendations
    aiSummary: { type: String, default: '' },
    recommendationLevel: { type: String, default: 'Skip' }, // Apply Immediately, Good Opportunity, Worth Considering, Low Priority, Skip
    recommendationReason: { type: String, default: '' },
    portfolioRecommendation: { type: String, default: '' },
    
    // Semantic Search Embedding
    embedding: { type: [Number], default: [] },
    
    // User Interaction States
    saved: { type: Boolean, default: false },
    liked: { type: Boolean, default: false },
    applied: { type: Boolean, default: false },
    status: { type: String, default: 'New' } // New, Applied, Interview, Won, Rejected
}, {
    timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
