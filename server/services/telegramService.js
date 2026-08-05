const TelegramBot = require('node-telegram-bot-api');

let bot = null;

const initBot = () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        return null;
    }
    // polling: false because we just want to send messages for now
    return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
};

exports.sendMessage = async (userId, message) => {
    // In a real app, you would fetch the user's specific Telegram Chat ID from the DB
    // For now, we fallback to a global `.env` chat ID for personal use
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!bot) {
        bot = initBot();
    }

    if (!bot || !chatId) {
        console.warn("Telegram Service Disabled: Token or Chat ID missing in .env");
        return { success: false, message: "Service disabled" };
    }

    try {
        await bot.sendMessage(chatId, message);
        return { success: true };
    } catch (error) {
        console.error("Failed to send Telegram message:", error.message);
        return { success: false, message: error.message };
    }
};
