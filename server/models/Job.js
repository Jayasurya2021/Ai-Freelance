const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    // Core details
    title: { type: String, required: true },
    company: { type: String, default: 'Unknown' },
    location: { type: String, default: 'Not specified' },
    employmentType: { type: String, default: 'Not specified' },
    salary: { type: String, default: 'Not specified' },
    experience: { type: String, default: 'Not specified' },
    description: { type: String, required: true },
    
    // Source Transparency
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' }, // If it came from a source
    sourceName: { type: String, required: true }, // e.g. "Upwork RSS", "Startup Community", "Manual Paste"
    originalUrl: { type: String, default: '' },
    postedDate: { type: Date, default: Date.now },
    platform: { type: String, default: 'Public Web' },
    
    // AI Extracted Details
    skills: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    atsKeywords: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    
    // AI Analysis (Embedded for performance)
    matchScore: { type: Number, default: 0 }, // 0 - 100
    recommendation: { type: String, enum: ['Apply', 'Maybe', 'Skip'], default: 'Maybe' },
    recommendationReason: { type: String, default: '' },
    missingSkills: { type: [String], default: [] },
    learningSuggestions: { type: [String], default: [] },
    resumeSuggestions: { type: [String], default: [] },
    coverLetterSummary: { type: String, default: '' },
    aiSummary: { type: String, default: '' },
    
    // Semantic Search Embedding
    embedding: { type: [Number], default: [] },
    
    // Status & User Ownership
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    status: { type: String, enum: ['new', 'saved', 'hidden', 'applied', 'interviewing', 'rejected'], default: 'new' }
}, {
    timestamps: true
});

// Indexes for common queries
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, matchScore: -1 });
jobSchema.index({ userId: 1, createdAt: -1 });
// Sparse index for originalUrl to enforce uniqueness per user if the url exists
jobSchema.index({ userId: 1, originalUrl: 1 }, { unique: true, partialFilterExpression: { originalUrl: { $gt: "" } } });

module.exports = mongoose.model('Job', jobSchema);
