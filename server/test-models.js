const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const AISettings = require('./models/AISettings');
const cryptoService = require('./services/cryptoService');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const settings = await AISettings.findOne();
        if (!settings || !settings.geminiKey) {
            console.error('No API key in DB');
            process.exit(1);
        }
        const apiKey = cryptoService.decrypt(settings.geminiKey);
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
        
        process.exit(0);
    } catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}
run();
