const Opportunity = require('../models/Opportunity');
const Profile = require('../models/Profile');
const ingestionService = require('../services/ingestionService');
const aiService = require('../services/aiService');

// Fetch feed with pagination and optional semantic search
exports.getOpportunities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Base query (we will add vector search here later if a query is provided)
        const query = {};

        const opportunities = await Opportunity.find(query)
            .sort({ matchScore: -1 })
            .skip(skip)
            .limit(limit)
            // exclude the embedding array to save bandwidth
            .select('-embedding');

        const total = await Opportunity.countDocuments(query);

        res.status(200).json({
            opportunities,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Fetch opportunities error:", error);
        res.status(500).json({ message: 'Server error fetching opportunities' });
    }
};

// Manually trigger an RSS ingestion (for testing/demo)
exports.triggerIngestion = async (req, res) => {
    try {
        const { feedUrl, sourceName, platform, userId } = req.body;
        if (!feedUrl || !userId) {
            return res.status(400).json({ message: 'Missing feedUrl or userId' });
        }

        // Fire and forget (or await if we want to block)
        // For now, let's await it so we know when it's done for the demo
        const result = await ingestionService.ingestRSSFeed(feedUrl, sourceName, platform, userId);
        
        res.status(200).json({ message: 'Ingestion complete', result });
    } catch (error) {
        console.error("Ingestion trigger error:", error);
        res.status(500).json({ message: 'Server error during ingestion' });
    }
};

// Manually trigger a URL ingestion
exports.triggerUrlIngestion = async (req, res) => {
    try {
        const { url, sourceName, platform, userId } = req.body;
        if (!url || !userId) {
            return res.status(400).json({ message: 'Missing url or userId' });
        }

        const result = await ingestionService.ingestUrl(url, sourceName, platform, userId);
        
        res.status(200).json({ message: 'URL Ingestion complete', result });
    } catch (error) {
        console.error("URL Ingestion trigger error:", error);
        res.status(500).json({ message: 'Server error during URL ingestion' });
    }
};

// Toggle the saved status of an opportunity
exports.toggleSave = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        
        opportunity.saved = !opportunity.saved;
        await opportunity.save();
        
        res.status(200).json({ message: 'Saved status toggled', saved: opportunity.saved });
    } catch (error) {
        console.error('Toggle save error:', error);
        res.status(500).json({ message: 'Server error while toggling save' });
    }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todaysCount, highMatchCount, savedCount, appliedCount, ignoredCount] = await Promise.all([
            Opportunity.countDocuments({ createdAt: { $gte: today } }),
            Opportunity.countDocuments({ matchScore: { $gte: 70 } }), // Generic threshold
            Opportunity.countDocuments({ saved: true }),
            Opportunity.countDocuments({ status: 'Applied' }),
            Opportunity.countDocuments({ status: 'Ignored' })
        ]);

        res.status(200).json({
            todaysCount,
            highMatchCount,
            savedCount,
            appliedCount,
            ignoredCount
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// Generate Proposal
exports.generateProposal = async (req, res) => {
    try {
        const { userId } = req.body;
        const opportunity = await Opportunity.findById(req.params.id);
        const userProfile = await Profile.findById(userId);

        if (!opportunity || !userProfile) {
            return res.status(404).json({ message: 'Opportunity or Profile not found' });
        }

        const proposal = await aiService.generateProposal(opportunity, userProfile);
        res.status(200).json({ proposal });
    } catch (error) {
        console.error("Proposal error:", error);
        res.status(500).json({ message: 'Server error generating proposal' });
    }
};

// Update Status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const opportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        
        res.status(200).json({ message: 'Status updated', status: opportunity.status });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};
