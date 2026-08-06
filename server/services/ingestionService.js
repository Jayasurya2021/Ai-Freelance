const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const aiService = require('./aiService');
const Job = require('../models/Job');
const Profile = require('../models/Profile');

const parser = new Parser();

/**
 * Fetches and processes an RSS feed for jobs.
 * @param {string} feedUrl - The RSS URL
 * @param {string} sourceName - Name of the source (e.g., WeWorkRemotely)
 * @param {string} platform - Platform name
 * @param {string} userId - ID of the user to match against
 */
exports.ingestRSSFeed = async (feedUrl, sourceName, platform, userId) => {
    try {
        console.log(`Fetching RSS feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        
        const userProfile = await Profile.findById(userId);
        if (!userProfile) throw new Error("User profile not found for AI matching");

        let ingestedCount = 0;
        const newJobs = [];

        for (const item of feed.items) {
            // Check if it already exists to avoid duplicates per user
            const existing = await Job.findOne({ originalUrl: item.link, userId });
            if (existing) continue;

            const textToAnalyze = `${item.title}\n\n${item.contentSnippet || item.content}`;
            
            // 1. Analyze with Gemini
            let analysis = {};
            try {
                analysis = await aiService.analyzeOpportunity(textToAnalyze, userProfile);
            } catch (err) {
                console.error("Analysis failed for item, skipping...", item.link);
                continue;
            }

            // 2. Generate Semantic Embedding
            const embedding = await aiService.generateEmbedding(textToAnalyze);

            // 3. Save to DB
            const job = new Job({
                userId: userId,
                title: analysis.title || item.title,
                description: item.contentSnippet || item.content || 'No description available.',
                sourceName,
                originalUrl: item.link,
                postedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                platform,
                
                ...analysis, // Spread the AI JSON
                embedding
            });

            await job.save();
            newJobs.push(job);
            ingestedCount++;
            
            // Artificial delay to prevent hitting Gemini rate limits on bulk ingests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return { success: true, ingested: ingestedCount, jobs: newJobs };
    } catch (error) {
        console.error("RSS Ingestion Error:", error);
        throw error;
    }
};

/**
 * Scrapes a single public URL.
 */
exports.ingestUrl = async (url, sourceName, platform, userId) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        // Very basic text extraction, stripping out scripts and styles
        $('script, style, nav, footer, header').remove();
        const textToAnalyze = $('body').text().replace(/\s+/g, ' ').trim();

        const userProfile = await Profile.findById(userId);
        
        const analysis = await aiService.analyzeOpportunity(textToAnalyze, userProfile);
        const embedding = await aiService.generateEmbedding(textToAnalyze);

        const job = new Job({
            userId: userId,
            title: analysis.title || $('title').text() || 'Imported Job',
            description: textToAnalyze.substring(0, 1000) + '...', // Store a snippet
            sourceName,
            originalUrl: url,
            postedDate: new Date(),
            platform,
            ...analysis,
            embedding
        });

        await job.save();
        return { success: true, job };

    } catch (error) {
        console.error("URL Ingestion Error:", error);
        throw error;
    }
};

/**
 * Fetches and processes an API JSON feed for jobs.
 */
exports.ingestApi = async (apiUrl, sourceName, platform, userId) => {
    try {
        console.log(`Fetching API feed: ${apiUrl}`);
        const collectorService = require('./collectorService');
        const items = await collectorService.extractFromApi(apiUrl);
        
        const userProfile = await Profile.findById(userId);
        if (!userProfile) throw new Error("User profile not found for AI matching");

        let ingestedCount = 0;
        const newJobs = [];

        for (const item of items) {
            const existing = await Job.findOne({ originalUrl: item.originalUrl, userId });
            if (existing) continue;

            let analysis = {};
            try {
                analysis = await aiService.analyzeOpportunity(item.content, userProfile);
            } catch (err) {
                console.error("Analysis failed for API item, skipping...", item.originalUrl);
                continue;
            }

            const embedding = await aiService.generateEmbedding(item.content);

            const job = new Job({
                userId: userId,
                title: analysis.title || item.title,
                description: item.content,
                sourceName,
                originalUrl: item.originalUrl,
                postedDate: new Date(),
                platform,
                ...analysis,
                embedding
            });

            await job.save();
            newJobs.push(job);
            ingestedCount++;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return { success: true, ingested: ingestedCount, jobs: newJobs };
    } catch (error) {
        console.error("API Ingestion Error:", error);
        throw error;
    }
};
