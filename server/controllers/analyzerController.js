const collectorService = require('../services/collectorService');
const matchingService = require('../services/matchingService');
const Profile = require('../models/Profile');

exports.analyzeUrl = async (req, res) => {
    const { url } = req.body;
    
    if (!url) return res.status(400).json({ message: "URL is required" });

    try {
        // 1. Extract content
        const extracted = await collectorService.extractFromUrl(url);
        
        // 2. Fetch User Profile
        const userProfile = await Profile.findById(req.user.id);
        if (!userProfile) return res.status(404).json({ message: "User profile not found" });

        // 3. AI Analysis & Matching
        const analysis = await matchingService.analyzeAndMatch(req.user.id, extracted.content, userProfile);
        
        // 4. Send back combined data
        res.json({
            originalUrl: url,
            title: extracted.title,
            company: 'Unknown (Extracted from URL)',
            ...analysis
        });
        
    } catch (err) {
        console.error("Analyze URL Error:", err);
        res.status(500).json({ message: "Failed to analyze URL", error: err.message });
    }
};
