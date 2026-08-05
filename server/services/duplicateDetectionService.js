const Opportunity = require('../models/Opportunity');
// Optional: import aiProvider for strict semantic matching if title/company are very similar
// const aiProvider = require('./aiProvider');

exports.isDuplicate = async (url, title, content) => {
    if (!url) return false;
    
    // 1. Exact URL match
    let existing = await Opportunity.findOne({ originalUrl: url });
    if (existing) return true;
    
    // 2. Normalized Title & Company match (Heuristic Semantic)
    // If we have an opportunity with the exact same title in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    existing = await Opportunity.findOne({ 
        title: title, 
        createdAt: { $gte: sevenDaysAgo } 
    });
    
    if (existing) {
        // If titles match exactly within a week, it's highly likely a duplicate cross-posted
        return true;
    }
    
    return false;
};
