const cron = require('node-cron');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const ingestionService = require('../services/ingestionService');

const startAgent = () => {
    console.log('🤖 AI Background Agent Initialized.');
    
    // Run every 1 hour
    cron.schedule('0 * * * *', async () => {
        console.log('🤖 AI Agent waking up to scout for opportunities...');
        try {
            // Find all configured users (who have skills set)
            const profiles = await Profile.find({ $expr: { $gt: [{ $size: "$skills" }, 0] } });
            
            console.log(`🤖 Found ${profiles.length} active profiles to scout for.`);
            
            for (const profile of profiles) {
                if (!profile.rssFeeds || profile.rssFeeds.length === 0) continue;

                console.log(`🤖 Scouting for ${profile.name} using ${profile.rssFeeds.length} custom feeds...`);
                
                for (const feedUrl of profile.rssFeeds) {
                    try {
                        const result = await ingestionService.ingestRSSFeed(feedUrl, "Custom RSS", "RSS Feed", profile._id);
                        console.log(`🤖 Scouted ${result.ingested} new opportunities for ${profile.name} from ${feedUrl}`);

                        // Check for high matches and notify
                        if (result.opportunities) {
                            for (const op of result.opportunities) {
                                const threshold = profile.notificationThreshold || 70;
                                if (op.matchScore >= threshold) {
                                    await Notification.create({
                                        userId: profile._id,
                                        title: '🔥 New High Match Opportunity',
                                        message: `Match: ${op.matchScore}%\nTechnology: ${op.requiredSkills.slice(0, 3).join(', ')}\nBudget: ${op.budget}\nRecommended Portfolio: ${op.portfolioRecommendation || 'None'}`,
                                        opportunityId: op._id
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`🤖 Error fetching feed ${feedUrl} for ${profile.name}:`, err.message);
                    }
                }
            }
            
            console.log('🤖 AI Agent scouting completed. Going back to sleep.');
        } catch (error) {
            console.error('🤖 AI Agent encountered a fatal error during scouting:', error);
        }
    });
};

module.exports = { startAgent };
