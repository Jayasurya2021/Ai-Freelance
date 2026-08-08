const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { userId, mode } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const profileMode = mode || 'freelance'; // 'freelance' or 'job'
        let extractedText = '';
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        // 1. Extract Text based on file type
        if (fileExtension === 'pdf') {
            const parser = new PDFParse({
                data: req.file.buffer
            });
            const data = await parser.getText();
            extractedText = data.text;
            console.log(`[PDF Parse] Extracted ${extractedText.length} characters.`);
            await parser.destroy();
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
            const data = await mammoth.extractRawText({ buffer: req.file.buffer });
            extractedText = data.value;
        } else {
            return res.status(400).json({ message: 'Unsupported file type. Please upload a PDF or DOCX.' });
        }

        if (extractedText.trim() === '') {
            return res.status(400).json({ message: 'Could not extract any text from the document.' });
        }

        // 2. Save text to profile and file to disk
        const userProfile = await Profile.findById(userId);
        if (!userProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        userProfile.resumeText = extractedText;

        // Save file to disk
        const uploadDir = path.join(__dirname, '../public/uploads/resumes');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Remove old file if it exists
        if (userProfile.resumeFileUrl) {
            const oldFilePath = path.join(__dirname, '../public', userProfile.resumeFileUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const fileName = `${userId}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, req.file.buffer);
        
        userProfile.resumeFileUrl = `/uploads/resumes/${fileName}`;

        // 3. Extract Structured Profile Data using AI
        const extractedData = await aiService.extractProfileFromResume(extractedText, userId);
        console.log(`[AI Extraction] Result:`, extractedData);
        
        // 4. Update Profile with extracted data
        if (extractedData.skills && extractedData.skills.length > 0) {
            // Merge skills uniquely
            userProfile.skills = [...new Set([...(userProfile.skills || []), ...extractedData.skills])];
        }
        if (extractedData.experience) userProfile.experience = extractedData.experience;
        if (extractedData.noticePeriod) userProfile.noticePeriod = extractedData.noticePeriod;
        if (extractedData.expectedSalary) userProfile.expectedSalary = extractedData.expectedSalary;
        if (extractedData.preferredLocations && extractedData.preferredLocations.length > 0) {
            userProfile.preferredLocations = [...new Set([...(userProfile.preferredLocations || []), ...extractedData.preferredLocations])];
        }

        await userProfile.save();

        res.status(200).json({ 
            message: 'Resume parsed and profile updated successfully',
            extractedData,
            resumeText: extractedText,
            resumeFileUrl: userProfile.resumeFileUrl
        });

    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({ message: 'Server error during resume upload' });
    }
};

exports.checkAts = async (req, res) => {
    try {
        const { userId, mode, jobDescription } = req.body;
        
        if (!jobDescription || !userId) {
            return res.status(400).json({ message: 'Job Description and User ID are required.' });
        }

        const userProfile = await Profile.findById(userId);
        if (!userProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (!userProfile.resumeText) {
            return res.status(400).json({ message: 'No resume uploaded.' });
        }

        const result = await aiService.checkAtsMatch(userProfile.resumeText, jobDescription, userId);
        res.status(200).json(result);

    } catch (error) {
        console.error('Check ATS error:', error);
        res.status(500).json({ message: 'Server error checking ATS score.' });
    }
};

exports.generateTailoredResume = async (req, res) => {
    try {
        const { userId, mode, jobDescription } = req.body;
        
        if (!jobDescription || !userId) {
            return res.status(400).json({ message: 'Job Description and User ID are required.' });
        }

        const userProfile = await Profile.findById(userId);
        if (!userProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (!userProfile.resumeText) {
            return res.status(400).json({ message: 'No base resume uploaded. Please upload one first.' });
        }

        const tailoredResume = await aiService.generateTailoredResume(userProfile.resumeText, jobDescription, mode || 'freelance', userId);
        res.status(200).json({ tailoredResume });

    } catch (error) {
        console.error('Tailor resume error:', error);
        res.status(500).json({ message: 'Server error generating tailored resume.' });
    }
};
