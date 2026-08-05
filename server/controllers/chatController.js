const aiProvider = require('../services/aiProvider');
const Profile = require('../models/Profile');
const Opportunity = require('../models/Opportunity');

exports.chatWithOpportunity = async (req, res) => {
    const { opportunityId, message } = req.body;
    
    if (!opportunityId || !message) {
        return res.status(400).json({ message: "opportunityId and message are required" });
    }

    try {
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        const userProfile = await Profile.findById(req.user.id);

        const systemPrompt = `You are a personal AI Career Copilot. You are answering a question about a specific opportunity.
        
Opportunity Details:
Title: ${opportunity.title}
Company: ${opportunity.company}
Description: ${opportunity.description}
AI Summary: ${opportunity.aiSummary}
Missing Skills: ${opportunity.missingSkills.join(', ')}

User Profile Highlights:
Skills: ${userProfile.skills.join(', ')}

Please answer the user's question accurately based on this context. Be concise and professional.`;

        const reply = await aiProvider.generateResponse(userProfile, systemPrompt, message);

        res.json({ reply });

    } catch (err) {
        console.error("Chat Error:", err);
        res.status(500).json({ message: "Failed to process chat message", error: err.message });
    }
};
