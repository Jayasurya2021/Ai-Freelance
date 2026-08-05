const axios = require('axios');
const cheerio = require('cheerio');

exports.parse = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        $('script, style, nav, footer, header, noscript, iframe').remove();
        
        return [{
            title: $('title').text().trim() || 'Imported HTML Opportunity',
            content: $('body').text().replace(/\s+/g, ' ').trim(),
            originalUrl: url,
            publishedDate: new Date(),
            company: 'Unknown'
        }];
    } catch (error) {
        throw new Error(`HTML Parsing Error: ${error.message}`);
    }
};
