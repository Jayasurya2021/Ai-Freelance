const axios = require('axios');

exports.parse = async (url) => {
    try {
        const { data } = await axios.get(url);
        // Expecting an array of objects from custom APIs, 
        // fallback to wrapping object in array
        const items = Array.isArray(data) ? data : (data.items || [data]);
        
        return items.map(item => ({
            title: item.title || item.name || 'API Opportunity',
            content: item.description || item.content || JSON.stringify(item),
            originalUrl: item.url || item.link || url,
            publishedDate: item.publishedAt || item.createdAt ? new Date(item.publishedAt || item.createdAt) : new Date(),
            company: item.company || 'Unknown'
        }));
    } catch (error) {
        throw new Error(`API Parsing Error: ${error.message}`);
    }
};
