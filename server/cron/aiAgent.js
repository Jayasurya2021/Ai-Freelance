const cron = require('node-cron');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const Opportunity = require('../models/Opportunity');
const Source = require('../models/Source');
const MonitoringLog = require('../models/MonitoringLog');
const SchedulerSettings = require('../models/SchedulerSettings');
const collectorService = require('../services/collectorService');
const duplicateDetectionService = require('../services/duplicateDetectionService');
const matchingService = require('../services/matchingService');
const discoveryService = require('../services/discoveryService');

const runForUser = async (userId) => {
    const startTime = new Date();
    let sourcesChecked = 0;
    let opportunitiesFound = 0;
    let duplicatesSkipped = 0;
    let notificationsSent = 0;
    
    try {
        const userProfile = await Profile.findById(userId);
        if (!userProfile) return;

        const settings = await SchedulerSettings.findOne({ userId }) || { minimumMatchScore: 70, enableMonitoring: true };
        if (!settings.enableMonitoring) return;

        // Trigger Phase 4 AI Discovery Engine to proactively find new URLs and dump them into the Queue
        await discoveryService.runDiscovery(userId, userProfile);

        // Standard Phase 2 Monitoring Engine logic continues...
        const sources = await Source.find({ userId, status: 'active' });
        
        for (const source of sources) {
            sourcesChecked++;
            try {
                let extractedItems = [];
                if (source.type === 'rss') {
                    extractedItems = await collectorService.extractFromRss(source.url);
                } else if (source.type === 'url') {
                    extractedItems = [await collectorService.extractFromUrl(source.url)];
                }

                for (const item of extractedItems) {
                    const isDuplicate = await duplicateDetectionService.isDuplicate(item.originalUrl);
                    if (isDuplicate) {
                        duplicatesSkipped++;
                        continue;
                    }

                    const analysis = await matchingService.analyzeAndMatch(userId, item.content, userProfile);
                    
                    const opportunity = new Opportunity({
                        title: item.title,
                        description: item.content.substring(0, 500) + '...',
                        sourceName: source.name,
                        originalUrl: item.originalUrl,
                        publishedDate: item.publishedDate,
                        company: item.company,
                        platform: source.type,
                        ...analysis
                    });

                    await opportunity.save();
                    opportunitiesFound++;

                    if (opportunity.matchScore >= settings.minimumMatchScore) {
                        await Notification.create({
                            userId: userId,
                            title: '🔥 High Match Opportunity Found!',
                            message: `Match: ${opportunity.matchScore}%\nTitle: ${opportunity.title}\nRecommendation: ${opportunity.recommendationLevel}`,
                            opportunityId: opportunity._id
                        });
                        notificationsSent++;
                    }
                }
                
                source.lastChecked = new Date();
                source.lastSuccess = new Date();
                await source.save();
                
            } catch (err) {
                console.error(`Error processing source ${source.name}:`, err.message);
                source.errorCount++;
                source.lastError = err.message;
                await source.save();
            }
        }
        
        await MonitoringLog.create({
            userId,
            startTime,
            endTime: new Date(),
            status: 'success',
            sourcesChecked,
            opportunitiesFound,
            duplicatesSkipped,
            notificationsSent
        });
        
    } catch (error) {
        console.error(`Monitoring run failed for user ${userId}:`, error);
        await MonitoringLog.create({
            userId,
            startTime,
            endTime: new Date(),
            status: 'error',
            errorDetails: error.message
        });
    }
};

const startAgent = () => {
    console.log('🤖 Advanced Monitoring Engine Initialized.');
    
    // Check every hour (simplified for demo, in production we might check per-user intervals)
    cron.schedule('0 * * * *', async () => {
        console.log('🤖 Monitoring Engine waking up...');
        const activeSettings = await SchedulerSettings.find({ enableMonitoring: true });
        
        for (const setting of activeSettings) {
            await runForUser(setting.userId);
        }
        console.log('🤖 Monitoring Engine finished scan.');
    });
};

module.exports = { startAgent, runForUser };
