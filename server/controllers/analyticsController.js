const Source = require('../models/Source');
const Opportunity = require('../models/Opportunity');
const OpportunityQueue = require('../models/OpportunityQueue');
const MonitoringLog = require('../models/MonitoringLog');

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
