const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    profileMode: { type: String, enum: ['freelance', 'job'], required: true, default: 'freelance' },
    technologies: { type: [String], default: [] },
    companies: { type: [String], default: [] },
    jobTitles: { type: [String], default: [] },
    freelanceCategories: { type: [String], default: [] },
    countries: { type: [String], default: [] },
    remoteOnly: { type: Boolean, default: false },
    minSalary: { type: Number, default: 0 },
    minBudget: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
