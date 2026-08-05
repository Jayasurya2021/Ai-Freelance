const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    // Core details
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    profileMode: { type: String, enum: ['freelance', 'job'], required: true, default: 'freelance' },
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
    
    // AI Analysis (Phase 3+ additions)
    aiSummary: { type: String, default: '' },
    recommendationLevel: { type: String, default: '' },
    recommendationReason: { type: String, default: '' },
    aiConfidenceScore: { type: String, default: '' }, // Very High, High, Medium, Low
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    estimatedProbabilityOfSuccess: { type: Number, default: 0 },
    
    // AI Asset Recommendations (Phase 6 additions)
    recommendedResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    recommendedPortfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
    
    // Semantic Search Embedding
    embedding: { type: [Number], default: [] },
    
    // Status
    status: { type: String, enum: ['new', 'saved', 'applied', 'ignored', 'won', 'lost', 'interviewing', 'rejected'], default: 'new' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
