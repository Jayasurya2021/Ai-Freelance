const cron = require('node-cron');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const Source = require('../models/Source');
const MonitoringLog = require('../models/MonitoringLog');
const SchedulerSettings = require('../models/SchedulerSettings');
const ingestionService = require('../services/ingestionService');

const runForUser = async (userId) => {
    const startTime = new Date();
    let sourcesChecked = 0;
    let opportunitiesFound = 0;
    let duplicatesSkipped = 0;
    
    try {
        const userProfile = await Profile.findById(userId);
        if (!userProfile) return;

        const settings = await SchedulerSettings.findOne({ userId }) || { minimumMatchScore: 70, enableMonitoring: true };
        if (!settings.enableMonitoring) return;

        const sources = await Source.find({ userId, status: 'active' });
        
        for (const source of sources) {
            sourcesChecked++;
            try {
                let result = { ingested: 0, jobs: [] };
                
                if (source.type === 'rss') {
                    result = await ingestionService.ingestRSSFeed(source.url, source.name, 'RSS', userId);
                } else if (source.type === 'url') {
                    const singleResult = await ingestionService.ingestUrl(source.url, source.name, 'Web', userId);
                    if (singleResult.job) result = { ingested: 1, jobs: [singleResult.job] };
                } else if (source.type === 'api') {
                    result = await ingestionService.ingestApi(source.url, source.name, 'API', userId);
                }

                opportunitiesFound += result.ingested || 0;

                for (const job of (result.jobs || [])) {
                    if (job.matchScore >= settings.minimumMatchScore) {
                        await Notification.create({
                            userId: userId,
                            title: '🔥 High Match Job Found!',
                            message: `Match: ${job.matchScore}%\nTitle: ${job.title}\nRecommendation: ${job.recommendation}`,
                            opportunityId: job._id
                        });
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
            opportunitiesFound
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
    console.log('🤖 AI Job Feed Engine Initialized.');
    
    // Check every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('🤖 Job Feed Engine waking up...');
        const activeSettings = await SchedulerSettings.find({ enableMonitoring: true });
        
        for (const setting of activeSettings) {
            const lastLog = await MonitoringLog.findOne({ userId: setting.userId, status: 'success' }).sort({ startTime: -1 });
            if (lastLog) {
                const diffMinutes = (new Date() - new Date(lastLog.startTime)) / (1000 * 60);
                if (diffMinutes < (setting.intervalMinutes || 30)) {
                    continue; 
                }
            }
            await runForUser(setting.userId);
        }
        console.log('🤖 Job Feed Engine finished scan.');
    });
};

module.exports = { startAgent, runForUser };
