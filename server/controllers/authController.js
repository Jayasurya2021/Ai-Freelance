const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check if user already exists
        const existingProfile = await Profile.findOne({ email });
        if (existingProfile) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new profile
        const newProfile = new Profile({
            name,
            email,
            password: hashedPassword
        });

        await newProfile.save();

        // Generate JWT
        const token = jwt.sign(
            { id: newProfile._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            profile: {
                id: newProfile._id,
                name: newProfile.name,
                email: newProfile.email,
                experience: newProfile.experience,
                skills: newProfile.skills
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Find user by email
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, profile.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: profile._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            profile: {
                id: profile._id,
                name: profile.name,
                email: profile.email,
                experience: profile.experience,
                skills: profile.skills
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        
        let profile = await Profile.findOne({ email });
        
        if (!profile) {
            // Create a new user if they don't exist
            profile = new Profile({
                name,
                email,
                // We don't have a password for google users, but schema might require it or we just generate a random one
                // Assuming password is not strictly required if we adjust schema or we can just set a dummy one
                password: await bcrypt.hash(googleId + process.env.JWT_SECRET, 10)
            });
            await profile.save();
        }
        
        // Generate JWT
        const token = jwt.sign(
            { id: profile._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.status(200).json({
            message: 'Logged in with Google successfully',
            token,
            profile: {
                id: profile._id,
                name: profile.name,
                email: profile.email,
                experience: profile.experience,
                skills: profile.skills
            }
        });
    } catch (error) {
        console.error('Google Login error:', error);
        res.status(500).json({ message: 'Server error during Google login' });
    }
};
