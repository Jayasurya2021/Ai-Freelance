const Profile = require('../models/Profile');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findById(req.user.id).select('-password');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        // prevent password update here
        delete updates.password;
        delete updates.email;

        const profile = await Profile.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile updated', profile });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
