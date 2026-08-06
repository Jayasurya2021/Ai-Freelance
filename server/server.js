const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const aiAgent = require('./cron/aiAgent');

dotenv.config();

// Environment Variable Validation
const requiredEnvVars = ['JWT_SECRET', 'ENCRYPTION_KEY', 'MONGO_URI', 'GOOGLE_CLIENT_ID'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
    console.error(`CRITICAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please configure them in server/.env before starting the server.');
    process.exit(1);
}

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
};

// Trigger nodemon restart

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'LeadFlow AI Personal Backend is running' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiSettingsRoutes = require('./routes/aiSettingsRoutes');
const analyzerRoutes = require('./routes/analyzerRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const resumeRoutes = require('./routes/resume.js');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings/ai', aiSettingsRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resume', resumeRoutes);

// Connect to MongoDB
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log('MONGO_URI is not defined. Server running without DB connection for now.');
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully');
        
        // Start the background automated scraper
        aiAgent.startAgent();
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();
