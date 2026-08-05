const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.analyze = async (apiKey, modelName, systemPrompt, userPrompt) => {
    if (!apiKey) throw new Error("Gemini API key is missing");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-2.5-flash" });

    const fullPrompt = `${systemPrompt}\n\nUser Input:\n${userPrompt}`;
    
    try {
        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();
        
        // Clean JSON formatting if present
        const jsonStr = responseText.replace(/```json\n?/, '').replace(/```/, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        console.error("Gemini API Error:", err);
        throw err;
    }
};
