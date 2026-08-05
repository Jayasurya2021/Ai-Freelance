const Source = require('../models/Source');

exports.getSources = async (req, res) => {
    try {
        const sources = await Source.find({ userId: req.user.id });
        res.json(sources);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.addSource = async (req, res) => {
    const { name, type, url, intervalMinutes } = req.body;
    try {
        const source = new Source({
            userId: req.user.id,
            name, type, url, intervalMinutes
        });
        await source.save();
        res.status(201).json(source);
    } catch (err) {
        res.status(500).json({ message: "Failed to add source", error: err.message });
    }
};

exports.updateSource = async (req, res) => {
    try {
        const source = await Source.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!source) return res.status(404).json({ message: "Source not found" });
        res.json(source);
    } catch (err) {
        res.status(500).json({ message: "Failed to update source", error: err.message });
    }
};

exports.deleteSource = async (req, res) => {
    try {
        await Source.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: "Source deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete source", error: err.message });
    }
};
