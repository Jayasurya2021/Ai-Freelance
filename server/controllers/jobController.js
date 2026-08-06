const Job = require('../models/Job');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');

// Helper for in-memory cosine similarity calculation
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

exports.getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.q;
        const sourceFilter = req.query.sourceName;
        const statusFilter = req.query.status;
        const recommendationFilter = req.query.recommendation;

        const baseQuery = { userId: req.user.id };
        
        if (sourceFilter && sourceFilter !== 'All Sources') {
            baseQuery.sourceName = sourceFilter;
        }
        if (statusFilter) {
            baseQuery.status = statusFilter;
        } else {
            // By default, don't show hidden jobs in the main feed
            baseQuery.status = { $ne: 'hidden' };
        }
        if (recommendationFilter && recommendationFilter !== 'All') {
            baseQuery.recommendation = recommendationFilter;
        }

        if (searchQuery) {
            // Semantic Search Flow
            const queryEmbedding = await aiService.generateEmbedding(searchQuery);
            const searchBaseQuery = { ...baseQuery, embedding: { $exists: true, $ne: [] } };
            const allJobs = await Job.find(searchBaseQuery);
            
            const scoredJobs = allJobs.map(job => {
                const sim = cosineSimilarity(queryEmbedding, job.embedding);
                return { ...job.toObject(), searchScore: sim };
            }).sort((a, b) => b.searchScore - a.searchScore);
            
            const paginated = scoredJobs.slice(skip, skip + limit);
            paginated.forEach(j => delete j.embedding);
            
            return res.status(200).json({
                jobs: paginated,
                totalPages: Math.ceil(scoredJobs.length / limit),
                currentPage: page
            });
        }

        // Standard Flow
        const jobs = await Job.find(baseQuery)
            .sort({ matchScore: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-embedding'); // exclude embedding

        const total = await Job.countDocuments(baseQuery);

        res.status(200).json({
            jobs,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Fetch jobs error:", error);
        res.status(500).json({ message: 'Server error fetching jobs' });
    }
};

exports.getJobDetails = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, userId: req.user.id }).select('-embedding');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.status(200).json(job);
    } catch (error) {
        console.error("Fetch job details error:", error);
        res.status(500).json({ message: 'Server error fetching job details' });
    }
};

exports.analyzeManualJob = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Job description text is required' });

        const userProfile = await Profile.findById(req.user.id);
        if (!userProfile) return res.status(404).json({ message: 'User profile not found' });

        const analysis = await aiService.analyzeOpportunity(text, userProfile);
        const embedding = await aiService.generateEmbedding(text);

        const job = new Job({
            userId: req.user.id,
            title: analysis.title || 'Manual Job Entry',
            description: text,
            sourceName: 'Manual Paste',
            platform: 'Manual',
            ...analysis,
            embedding
        });

        await job.save();
        
        // Remove embedding from response
        const jobResponse = job.toObject();
        delete jobResponse.embedding;

        res.status(201).json(jobResponse);
    } catch (error) {
        console.error("Manual analyze error:", error);
        res.status(500).json({ message: 'Server error analyzing job' });
    }
};

exports.toggleSaveJob = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        job.status = job.status === 'saved' ? 'new' : 'saved';
        await job.save();
        
        res.status(200).json({ message: `Job ${job.status}`, status: job.status });
    } catch (error) {
        console.error('Toggle save error:', error);
        res.status(500).json({ message: 'Server error while saving job' });
    }
};

exports.toggleHideJob = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        job.status = job.status === 'hidden' ? 'new' : 'hidden';
        await job.save();
        
        res.status(200).json({ message: `Job ${job.status}`, status: job.status });
    } catch (error) {
        console.error('Toggle hide error:', error);
        res.status(500).json({ message: 'Server error while hiding job' });
    }
};
