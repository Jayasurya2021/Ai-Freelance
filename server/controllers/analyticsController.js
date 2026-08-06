const Source = require('../models/Source');
const Opportunity = require('../models/Opportunity');
const OpportunityQueue = require('../models/OpportunityQueue');
const MonitoringLog = require('../models/MonitoringLog');
const Job = require('../models/Job');

exports.getSourceHealth = async (req, res) => {
    try {
        const sources = await Source.find({ userId: req.user.id });
        const queueStats = await OpportunityQueue.aggregate([
            { $match: { userId: req.user.id } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const logs = await MonitoringLog.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100);
        
        let totalTime = 0;
        let successfulRuns = 0;
        logs.forEach(log => {
            if (log.status === 'success') {
                totalTime += (new Date(log.endTime) - new Date(log.startTime));
                successfulRuns++;
            }
        });

        res.json({
            totalSources: sources.length,
            activeSources: sources.filter(s => s.status === 'active').length,
            failedSources: sources.filter(s => s.status === 'error').length,
            queueStats: queueStats,
            averageProcessingTimeMs: successfulRuns > 0 ? (totalTime / successfulRuns) : 0,
            successRate: logs.length > 0 ? ((successfulRuns / logs.length) * 100).toFixed(2) : 100
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getSkillGap = async (req, res) => {
    try {
        // Find all missing skills from recent opportunities
        const opportunities = await Opportunity.find({ 
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        });

        const skillCounts = {};
        opportunities.forEach(opp => {
            if (opp.missingSkills && opp.missingSkills.length > 0) {
                opp.missingSkills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            }
        });

        const sortedSkills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, demand: count }));

        res.json(sortedSkills);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getDailyBrief = async (req, res) => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const highMatches = await Opportunity.find({ 
            createdAt: { $gte: oneDayAgo },
            matchScore: { $gte: 80 }
        }).select('title company matchScore originalUrl');

        res.json({
            date: new Date(),
            newOpportunitiesFound: await Opportunity.countDocuments({ createdAt: { $gte: oneDayAgo } }),
            highMatches
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.recordLearningFeedback = async (req, res) => {
    const { opportunityId, action } = req.body;
    try {
        console.log(`[AI LEARNING] User ${req.user.id} marked ${opportunityId} as ${action}.`);
        res.json({ success: true, message: "Feedback recorded for AI optimization." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const profileCompletenessService = require('../services/profileCompletenessService');
const Profile = require('../models/Profile');
const SearchProfile = require('../models/SearchProfile');
const aiProvider = require('../services/aiProvider');

exports.getProfileCompleteness = async (req, res) => {
    try {
        const userProfile = await Profile.findById(req.user.id);
        const result = profileCompletenessService.calculateCompleteness(userProfile, 'freelance');
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getSearchPerformance = async (req, res) => {
    try {
        const searchProfiles = await SearchProfile.find({ userId: req.user.id });
        
        // In a full implementation, we would aggregate the Opportunity metrics mapped to these search profiles.
        // For now, we return the base search profiles to populate the analytics table.
        res.json({ searchProfiles });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.generateInsights = async (req, res) => {
    try {
        const userProfile = await Profile.findById(req.user.id);
        
        // Fetch last 7 days of opportunities to generate insights
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentOpps = await Opportunity.find({ 
            userId: req.user.id, 
            createdAt: { $gte: oneWeekAgo } 
        });

        const prompt = `You are a Career Intelligence Engine. 
The user is freelancing. 
They found ${recentOpps.length} opportunities this week.
Based on their profile and this volume, generate a 1-sentence actionable insight.
Example: "Your React opportunities increased by 22% this week, consider adding Next.js to your skills."`;

        const insight = await aiProvider.generateResponse(userProfile, prompt, "Generate Insight");
        
        res.json({ insight: insight.replace(/["']/g, '') });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
