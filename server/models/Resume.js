const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    profileMode: { type: String, enum: ['freelance', 'job'], required: true, default: 'job' },
    title: { type: String, required: true }, // e.g., "React Resume", "Backend Resume"
    content: { type: String, required: true }, // The extracted text or raw content of the resume
    targetedRoles: { type: [String], default: [] },
    isDefault: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
