const aiProvider = require('./aiProvider');
const SearchProfile = require('../models/SearchProfile');
const OpportunityQueue = require('../models/OpportunityQueue');

exports.expandSearchTerms = async (userProfile, searchProfile) => {
    try {
        const prompt = `You are an AI Search Optimizer.
The user wants to search for opportunities using the following Search Profile:
Name: ${searchProfile.name}
Keywords: ${searchProfile.keywords.join(', ')}

Please semantically expand these keywords into a JSON array of up to 10 highly relevant search queries that are commonly used in the industry for this role/category.
For example, if the input is "React Developer", you might output ["Frontend Engineer", "ReactJS", "SPA Developer", "Next.js Developer"].

Return ONLY a raw JSON array of strings. Do not use markdown wrappers.`;

        // We use generateResponse but expect JSON array back. (Assumes aiProvider handles raw string or we parse it)
        const responseText = await aiProvider.generateResponse(userProfile, prompt, "Expand keywords");
        
        let expanded = [];
        try {
            // Strip markdown if AI accidentally adds it
            const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            expanded = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Failed to parse expanded terms:", responseText);
            // Fallback to original keywords
            expanded = searchProfile.keywords.length > 0 ? searchProfile.keywords : [searchProfile.name];
        }
        
        return expanded;
    } catch (error) {
        console.error("Expand Search Terms Error:", error.message);
        return searchProfile.keywords;
    }
};

exports.runDiscovery = async (userId, userProfile) => {
    console.log(`Starting AI Discovery Engine for user ${userId}...`);
    try {
        // Fetch enabled search profiles for this user
        const searchProfiles = await SearchProfile.find({ userId, enabled: true });

        for (const profile of searchProfiles) {
            console.log(`Processing Search Profile: ${profile.name} (${profile.profileMode})`);
            
            // 1. Semantic AI Expansion
            const expandedQueries = await this.expandSearchTerms(userProfile, profile);
            console.log(`Expanded Queries: ${expandedQueries.join(', ')}`);

            // 2. Discover URLs (Mocking public sources since we lack official APIs)
            // In a real scenario, this would query RSS aggregators, Google Custom Search API, Upwork RSS, etc.
            // using the `expandedQueries`.
            const mockDiscoveredUrls = expandedQueries.map(q => 
                `https://example-jobs.com/search?q=${encodeURIComponent(q)}&mode=${profile.profileMode}&timestamp=${Date.now()}`
            );

            // 3. Drop into Opportunity Queue
            for (const url of mockDiscoveredUrls) {
                // Add to MongoDB Queue. The queueService will handle extraction and semantic duplication checks.
                await OpportunityQueue.create({
                    userId,
                    url,
                    status: 'pending'
                });
            }
        }
        console.log(`AI Discovery Engine completed for user ${userId}.`);
    } catch (error) {
        console.error(`AI Discovery Error for user ${userId}:`, error.message);
    }
};
