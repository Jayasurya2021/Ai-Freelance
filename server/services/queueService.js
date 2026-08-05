const OpportunityQueue = require('../models/OpportunityQueue');
const collectorService = require('./collectorService');
const duplicateDetectionService = require('./duplicateDetectionService');
const matchingService = require('./matchingService');
const Opportunity = require('../models/Opportunity');
const Profile = require('../models/Profile');
const emailService = require('./emailService');
const telegramService = require('./telegramService');

const processJob = async (job) => {
    job.status = 'processing';
    job.processingStartTime = new Date();
    job.attempts += 1;
    await job.save();

    try {
        const userProfile = await Profile.findById(job.userId);
        if (!userProfile) throw new Error("User profile not found");

        // 1. Extract content based on URL
        // In a full implementation, the Source plugin system would select the exact parser here
        const extracted = await collectorService.extractFromUrl(job.url);

        // 2. AI Duplicate Detection (Semantic)
        const isDuplicate = await duplicateDetectionService.isDuplicate(extracted.originalUrl, extracted.title, extracted.content);
        if (isDuplicate) {
            job.status = 'completed';
            job.processingEndTime = new Date();
            await job.save();
            return; // Exit early, it's a duplicate
        }

        // 3. AI Analysis & Matching
        const analysis = await matchingService.analyzeAndMatch(job.userId, extracted.content, userProfile);

        // 4. Save Opportunity
        const opportunity = new Opportunity({
            title: extracted.title,
            description: extracted.content.substring(0, 500) + '...',
            sourceName: 'Background Queue',
            originalUrl: extracted.originalUrl,
            platform: 'Queue',
            ...analysis
        });
        await opportunity.save();

        // 5. Send Notifications (Graceful)
        if (opportunity.matchScore >= (userProfile.notificationThreshold || 70)) {
            const message = `🔥 High Match Opportunity Found!\nMatch: ${opportunity.matchScore}%\nTitle: ${opportunity.title}\nRecommendation: ${opportunity.recommendationLevel}`;
            await telegramService.sendMessage(job.userId, message);
            await emailService.sendEmail(userProfile.email, 'High Match Opportunity', message);
        }

        job.status = 'completed';
        job.processingEndTime = new Date();
        await job.save();
    } catch (error) {
        job.lastError = error.message;
        job.status = job.attempts >= job.maxAttempts ? 'failed' : 'pending';
        job.processingEndTime = new Date();
        await job.save();
        console.error(`Job failed: ${job._id}`, error.message);
    }
};

const pollQueue = async () => {
    try {
        // Find one pending job
        const job = await OpportunityQueue.findOne({ status: 'pending' }).sort({ createdAt: 1 });
        if (job) {
            await processJob(job);
        }
    } catch (error) {
        console.error("Queue Polling Error:", error);
    }
};

// Start the polling loop (runs every 5 seconds)
let intervalId;
exports.startPolling = () => {
    if (intervalId) return;
    console.log("🚀 Starting MongoDB Opportunity Queue Polling...");
    intervalId = setInterval(pollQueue, 5000);
};

exports.stopPolling = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

exports.addJob = async (userId, url, sourceId = null) => {
    const job = new OpportunityQueue({ userId, url, sourceId });
    await job.save();
    return job;
};
