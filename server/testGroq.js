require('dotenv').config();
const aiService = require('./services/aiService');
const mongoose = require('mongoose');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await aiService.extractProfileFromResume("Senior React developer with 5 years experience. Skills: React, Node.", null);
        console.log(result);
        process.exit(0);
    } catch(e) {
        console.error("FAILED:", e.message);
        process.exit(1);
    }
}
test();
