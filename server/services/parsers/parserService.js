const rssParser = require('./rssParser');
const htmlParser = require('./htmlParser');
const apiParser = require('./apiParser');
const aiParser = require('./aiParser');

exports.parse = async (sourceType, url) => {
    switch (sourceType) {
        case 'rss':
            return await rssParser.parse(url);
        case 'html':
            return await htmlParser.parse(url);
        case 'api':
            return await apiParser.parse(url);
        case 'ai':
            return await aiParser.parse(url);
        default:
            throw new Error(`Unsupported source type: ${sourceType}`);
    }
};
