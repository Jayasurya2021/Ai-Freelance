const Notification = require('../models/Notification');

// Get all notifications for the current user
exports.getNotifications = async (req, res) => {
    try {
        // In a real app we'd get req.user.id from auth middleware. 
        // For now, assume a userId is passed as query or we fetch all for testing.
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json({ message: 'Marked as read', notification });
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ message: 'Server error marking as read' });
    }
};
