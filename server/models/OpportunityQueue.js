const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    url: { type: String, required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastError: { type: String, default: '' },
    processingStartTime: { type: Date },
    processingEndTime: { type: Date }
}, {
    timestamps: true
});

// Index for fast polling
queueSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('OpportunityQueue', queueSchema);
