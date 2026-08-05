const { OpenAI } = require('openai');

exports.analyze = async (apiKey, modelName, systemPrompt, userPrompt) => {
    if (!apiKey) throw new Error("OpenAI API key is missing");
    
    const openai = new OpenAI({ apiKey });
    
    try {
        const response = await openai.chat.completions.create({
            model: modelName || "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (err) {
        console.error("OpenAI API Error:", err);
        throw err;
    }
};
