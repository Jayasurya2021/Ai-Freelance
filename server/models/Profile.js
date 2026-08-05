const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Dual Profile Modes
    freelanceProfile: {
        skills: { type: [String], default: [] },
        experience: { type: String, default: '' },
        hourlyRate: { type: Number, default: 0 },
        preferredBudget: { type: Number, default: 0 },
        preferredCountries: { type: [String], default: [] },
        preferredIndustries: { type: [String], default: [] },
        preferredProjectTypes: { type: [String], default: [] },
        preferredTechnologies: { type: [String], default: [] },
        proposalTemplate: { type: String, default: '' },
        careerGoals: { type: [String], default: [] }
    },
    jobProfile: {
        skills: { type: [String], default: [] },
        experience: { type: String, default: '' },
        preferredSalary: { type: Number, default: 0 },
        expectedSalary: { type: Number, default: 0 },
        preferredCountries: { type: [String], default: [] },
        preferredCompanies: { type: [String], default: [] },
        preferredJobTitles: { type: [String], default: [] },
        preferredTechnologies: { type: [String], default: [] },
        preferredEmploymentType: { type: [String], default: ['Full-time'] },
        remotePreference: { type: Boolean, default: true },
        relocation: { type: Boolean, default: false },
        careerGoals: { type: [String], default: [] }
    },
    // Global Settings
    activeProfileMode: { type: String, enum: ['freelance', 'job'], default: 'freelance' },
    notificationThreshold: { type: Number, default: 70 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
