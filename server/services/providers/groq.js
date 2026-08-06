const { OpenAI } = require('openai');

exports.analyze = async (apiKey, modelName, systemPrompt, userPrompt) => {
    if (!apiKey) throw new Error("Groq API key is missing");
    
    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1"
    });

    try {
        const response = await client.chat.completions.create({
            model: modelName || "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const responseText = response.choices[0].message.content;
        return JSON.parse(responseText);
    } catch (err) {
        console.error("Groq API Error:", err);
        throw err;
    }
};
