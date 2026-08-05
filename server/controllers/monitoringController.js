const MonitoringLog = require('../models/MonitoringLog');
const SchedulerSettings = require('../models/SchedulerSettings');
const aiAgent = require('../cron/aiAgent');

exports.getSettings = async (req, res) => {
    try {
        let settings = await SchedulerSettings.findOne({ userId: req.user.id });
        if (!settings) {
            settings = await SchedulerSettings.create({ userId: req.user.id });
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await SchedulerSettings.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await MonitoringLog.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.triggerManualRun = async (req, res) => {
    try {
        // Trigger a manual run for this user in the background
        aiAgent.runForUser(req.user.id);
        res.json({ message: "Monitoring run started in the background." });
    } catch (err) {
        res.status(500).json({ message: "Failed to trigger run", error: err.message });
    }
};
