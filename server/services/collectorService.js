const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const parser = new Parser();

exports.extractFromUrl = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        
        // Remove unnecessary tags
        $('script, style, nav, footer, header, noscript, iframe').remove();
        const title = $('title').text().trim();
        const textContent = $('body').text().replace(/\s+/g, ' ').trim();
        
        return {
            title: title || 'Extracted URL',
            content: textContent,
            originalUrl: url
        };
    } catch (error) {
        console.error(`Error extracting from URL ${url}:`, error.message);
        throw new Error("Unable to extract content from this URL.");
    }
};

exports.extractFromRss = async (feedUrl) => {
    try {
        const feed = await parser.parseURL(feedUrl);
        return feed.items.map(item => ({
            title: item.title,
            content: item.contentSnippet || item.content,
            originalUrl: item.link,
            publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            company: item.creator || 'Unknown'
        }));
    } catch (error) {
        console.error(`Error extracting from RSS ${feedUrl}:`, error.message);
        throw new Error("Unable to extract content from this RSS feed.");
    }
};

exports.extractFromApi = async (apiUrl) => {
    try {
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });
        
        // Handle cases where data is not an array directly (e.g. data.jobs, data.results)
        let items = Array.isArray(data) ? data : (data.jobs || data.results || data.data || []);
        
        if (!Array.isArray(items)) {
             // If we still can't find an array, try treating the whole object as one item if it has title/description
             if (data.title || data.name) {
                 items = [data];
             } else {
                 items = [];
             }
        }

        return items.map(item => ({
            title: item.title || item.name || item.position || 'API Job',
            content: JSON.stringify(item), // Serialize the whole object so AI can extract the fields later
            originalUrl: item.url || item.link || apiUrl,
            company: item.company || 'Unknown'
        }));
    } catch (error) {
        console.error(`Error extracting from API ${apiUrl}:`, error.message);
        throw new Error("Unable to extract content from this API.");
    }
};
