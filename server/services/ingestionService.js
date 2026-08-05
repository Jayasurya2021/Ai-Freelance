const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const aiService = require('./aiService');
const Opportunity = require('../models/Opportunity');
const Profile = require('../models/Profile');

const parser = new Parser();

/**
 * Fetches and processes an RSS feed for opportunities.
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
        const newOpportunities = [];

        for (const item of feed.items) {
            // Check if it already exists to avoid duplicates
            const existing = await Opportunity.findOne({ originalUrl: item.link });
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
            const opportunity = new Opportunity({
                userId: userId,
                profileMode: userProfile.activeProfileMode || 'freelance',
                title: item.title,
                description: item.contentSnippet || item.content || 'No description available.',
                sourceName,
                originalUrl: item.link,
                publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                company: item.creator || 'Unknown',
                platform,
                
                ...analysis, // Spread the AI JSON (matchScore, missingSkills, etc)
                embedding
            });

            await opportunity.save();
            newOpportunities.push(opportunity);
            ingestedCount++;
            
            // Artificial delay to prevent hitting Gemini rate limits on bulk ingests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return { success: true, ingested: ingestedCount, opportunities: newOpportunities };
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

        const opportunity = new Opportunity({
            userId: userId,
            profileMode: userProfile.activeProfileMode || 'freelance',
            title: $('title').text() || 'Imported Opportunity',
            description: textToAnalyze.substring(0, 500) + '...', // Store a snippet
            sourceName,
            originalUrl: url,
            publishedDate: new Date(),
            platform,
            ...analysis,
            embedding
        });

        await opportunity.save();
        return { success: true, opportunity };

    } catch (error) {
        console.error("URL Ingestion Error:", error);
        throw error;
    }
};
