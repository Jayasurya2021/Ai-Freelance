const htmlParser = require('./htmlParser');

// The AI Content Extractor is a hybrid: it fetches HTML, but could theoretically 
// use a small LLM call to find the main content div before passing it down.
// For now, it delegates to HTML parser but we stub it out for future AI-specific parsing logic.
exports.parse = async (url) => {
    try {
        console.log(`Using AI Content Parser for ${url}`);
        // In the future: call a quick Gemini prompt here to extract just the job post text 
        // from a messy DOM.
        return await htmlParser.parse(url);
    } catch (error) {
        throw new Error(`AI Parsing Error: ${error.message}`);
    }
};
