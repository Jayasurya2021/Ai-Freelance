const Opportunity = require('../models/Opportunity');

exports.isDuplicate = async (url) => {
    if (!url) return false;
    
    // Exact URL match
    const existing = await Opportunity.findOne({ originalUrl: url });
    if (existing) {
        return true;
    }
    
    // We could add more complex similarity detection here (e.g. comparing titles from same company)
    // For now, exact URL is the strongest indicator of a duplicate
    
    return false;
};
