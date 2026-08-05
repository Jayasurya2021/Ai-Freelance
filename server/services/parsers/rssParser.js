const Parser = require('rss-parser');
const parser = new Parser();

exports.parse = async (url) => {
    try {
        const feed = await parser.parseURL(url);
        return feed.items.map(item => ({
            title: item.title,
            content: item.contentSnippet || item.content,
            originalUrl: item.link,
            publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            company: item.creator || 'Unknown'
        }));
    } catch (error) {
        throw new Error(`RSS Parsing Error: ${error.message}`);
    }
};
