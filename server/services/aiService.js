const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const AISettings = require('../models/AISettings');

// Helper to call specific provider
async function callProvider(provider, apiKey, prompt, isJson) {
    if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            generationConfig: isJson ? { responseMimeType: "application/json" } : {} 
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } else if (provider === 'groq') {
        const openai = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
        const response = await openai.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0].message.content;
    } else if (provider === 'openai') {
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0].message.content;
    } else {
        throw new Error(`Unsupported provider: ${provider}`);
    }
}

// Unified content generator with fallback
async function generateContentWithFallback(prompt, userId, isJson = false) {
    let userProvider = null;
    let userKey = null;

    if (userId) {
        try {
            const settings = await AISettings.findOne({ userId });
            if (settings) {
                userProvider = settings.provider;
                if (userProvider === 'gemini') userKey = settings.geminiKey;
                if (userProvider === 'groq') userKey = settings.groqKey;
                if (userProvider === 'openai') userKey = settings.openaiKey;
            }
        } catch (e) {
            console.error("Error fetching AISettings:", e.message);
        }
    }

    // Try user key first
    if (userProvider && userKey && userKey !== '********') {
        try {
            const text = await callProvider(userProvider, userKey, prompt, isJson);
            if (isJson) return JSON.parse(text);
            return text;
        } catch (err) {
            console.warn(`User AI provider ${userProvider} failed. Falling back to default Groq. Error: ${err.message}`);
        }
    }

    // Fallback to default Groq key
    const defaultKey = process.env.Grok_Ai_Key;
    if (!defaultKey) {
        throw new Error("No default Grok_Ai_Key found in environment");
    }
    
    const fallbackText = await callProvider('groq', defaultKey, prompt, isJson);
    if (isJson) return JSON.parse(fallbackText);
    return fallbackText;
}

exports.generateContentWithFallback = generateContentWithFallback;

/**
 * Analyzes a job opportunity against a user profile.
 */
exports.analyzeOpportunity = async (opportunityText, userProfile) => {
    try {
        const profileContextStr = userProfile ? `
        Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
        Experience: ${userProfile.experience || 'Not specified'}
        Rate/Salary: ${userProfile.hourlyRate || 'Not specified'}
        Preferred Tech Stack: ${userProfile.preferredTechnologies?.join(', ') || 'Not specified'}
        Resume Context: ${userProfile.resumeText ? userProfile.resumeText.substring(0, 1000) : 'None'}
        ` : 'No profile data.';

        const prompt = `
        You are an expert AI Career Copilot.
        Extract detailed information from the following Job Description and analyze it against the User Profile.
        
        User Profile:
        ${profileContextStr}
        
        Job Description Text:
        """${opportunityText}"""
        
        Extract the following fields from the job description (if not found, use "Not specified" or empty arrays):
        Job Title, Company, Location, Employment Type, Salary, Experience, Skills, Responsibilities, Preferred Skills, ATS Keywords, Benefits.
        
        Then, generate the following analysis:
        Calculate a matchScore (0-100).
        Choose a recommendation: "Apply", "Maybe", or "Skip".
        Provide a recommendationReason.
        List missingSkills the user lacks.
        Provide learningSuggestions to bridge the gap.
        Provide resumeSuggestions to tailor their resume for this job.
        Generate a short coverLetterSummary (1 paragraph) they can use as a starting point.
        Generate an aiSummary (1-2 sentences summarizing the job).
        
        Respond ONLY with a valid JSON object matching this schema exactly:
        {
          "title": "string",
          "company": "string",
          "location": "string",
          "employmentType": "string",
          "salary": "string",
          "experience": "string",
          "skills": ["string", "string"],
          "responsibilities": ["string", "string"],
          "preferredSkills": ["string", "string"],
          "atsKeywords": ["string", "string"],
          "benefits": ["string", "string"],
          "matchScore": 85,
          "recommendation": "Apply",
          "recommendationReason": "string",
          "missingSkills": ["string", "string"],
          "learningSuggestions": ["string", "string"],
          "resumeSuggestions": ["string", "string"],
          "coverLetterSummary": "string",
          "aiSummary": "string"
        }
        `;

        return await generateContentWithFallback(prompt, userProfile?._id, true);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw error;
    }
};

/**
 * Generates an embedding for semantic search.
 */
exports.generateEmbedding = async (text, userId = null) => {
    try {
        let userProvider = null;
        let userKey = null;
        
        if (userId) {
            const settings = await AISettings.findOne({ userId });
            if (settings) {
                userProvider = settings.provider;
                if (userProvider === 'gemini') userKey = settings.geminiKey;
                if (userProvider === 'openai') userKey = settings.openaiKey;
            }
        }

        if (userProvider === 'openai' && userKey && userKey !== '********') {
            try {
                const openai = new OpenAI({ apiKey: userKey });
                const result = await openai.embeddings.create({ input: text, model: 'text-embedding-3-small' });
                return result.data[0].embedding;
            } catch (e) {
                console.warn("OpenAI Embedding Failed. Falling back.", e.message);
            }
        }

        if (userProvider === 'gemini' && userKey && userKey !== '********') {
            try {
                const genAI = new GoogleGenerativeAI(userKey);
                const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
                const result = await model.embedContent(text);
                return result.embedding.values;
            } catch (e) {
                console.warn("Gemini Embedding Failed. Falling back.", e.message);
            }
        }

        // Just return empty array as fallback so it doesn't crash features that don't need semantic search.
        return [];
    } catch (error) {
        console.error("AI Embedding Error:", error);
        return [];
    }
};

/**
 * Generates a personalized proposal.
 */
exports.generateProposal = async (opportunity, userProfile) => {
    try {
        const profileContextStr = userProfile ? `
        Name: ${userProfile.name || 'Professional'}
        Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
        Experience: ${userProfile.experience || 'Not specified'}
        Portfolio Projects: ${userProfile.portfolioProjects ? JSON.stringify(userProfile.portfolioProjects) : 'None'}
        Resume Context: ${userProfile.resumeText ? userProfile.resumeText.substring(0, 1000) : 'None'}
        ` : 'No profile data.';

        const prompt = `
        You are an expert freelance career copilot helping a professional write a winning proposal.
        
        User Profile:
        ${profileContextStr}
        
        Opportunity Details:
        Title: ${opportunity.title}
        Description: ${opportunity.description}
        Budget: ${opportunity.budget}
        Timeline: ${opportunity.timeline}
        
        Generate a professional, highly personalized proposal for this opportunity. 
        The proposal MUST include:
        1. A strong opening acknowledging the Client Requirement.
        2. My Experience and why it's a great fit.
        3. Relevant Portfolio (mention specific projects if they match).
        4. Estimated Timeline and Estimated Cost (make reasonable assumptions if not provided).
        5. Professional Closing.
        
        Make it sound natural, confident, and concise. Do not use generic placeholders like [Insert Name Here], use the provided context.
        Output ONLY the proposal text.
        `;

        return await generateContentWithFallback(prompt, userProfile?._id, false);
    } catch (error) {
        console.error("AI Proposal Generation Error:", error);
        throw error;
    }
};

/**
 * Checks ATS score of a resume against a job description.
 */
exports.checkAtsMatch = async (resumeText, jobDescription, userId) => {
    try {
        const prompt = `
        You are an expert ATS (Applicant Tracking System) analyzer.
        Compare the following Resume against the Job Description.
        
        Resume:
        """${resumeText}"""
        
        Job Description:
        """${jobDescription}"""
        
        Analyze the match and return a JSON object with this exact schema:
        {
            "score": 80,
            "matchingKeywords": ["string", "string"],
            "missingKeywords": ["string", "string"],
            "improvementTips": ["string", "string"]
        }
        `;
        
        return await generateContentWithFallback(prompt, userId, true);
    } catch (error) {
        console.error("ATS Check Error:", error);
        throw error;
    }
};

/**
 * Generates a tailored resume based on a base resume and a job description.
 */
exports.generateTailoredResume = async (baseResumeText, jobDescription, mode, userId) => {
    try {
        const prompt = `
        You are an expert ${mode === 'freelance' ? 'Freelance Profile Optimizer' : 'Executive Resume Writer'}.
        Your goal is to rewrite the provided Base Resume to perfectly align with the target Job Description to maximize ATS score and recruiter interest, without lying or inventing experience.
        
        Base Resume:
        """${baseResumeText}"""
        
        Target Job Description:
        """${jobDescription}"""
        
        Instructions:
        1. Incorporate key terminology and keywords from the Job Description into the professional summary and bullet points.
        2. Highlight the most relevant experience and skills that match the job.
        3. Rephrase bullets to be action-oriented and results-driven.
        4. Output ONLY the tailored resume content formatted nicely in Markdown (with headers, bullet points). Do not include any introductory remarks.
        `;
        
        return await generateContentWithFallback(prompt, userId, false);
    } catch (error) {
        console.error("Resume Generation Error:", error);
        throw error;
    }
};

/**
 * Extracts structured profile data from raw resume text.
 */
exports.extractProfileFromResume = async (resumeText, userId) => {
    try {
        const prompt = `
        You are an expert HR parser.
        Extract the following information from the provided Resume text. 
        If a field is not found, leave it empty or return reasonable defaults (e.g., empty array for skills).
        
        Fields to extract:
        - skills: Array of strings (e.g. ["JavaScript", "React", "Node.js"])
        - experience: One of ["Fresher", "Junior", "Mid-level", "Senior"]. Choose based on years of experience or roles.
        - noticePeriod: String (e.g., "Immediate", "2 Weeks", "1 Month"). Guess based on typical patterns if not explicitly stated, or leave empty string if unsure.
        - preferredLocations: Array of strings. Look for location preferences or current location.
        - expectedSalary: Number. If not found, return 0. (Do not include currency symbols, just the number).
        - hourlyRate: Number. If not found, return 0.
        - preferredTechnologies: Array of strings. Key tech stack the person works with.
        - portfolioProjects: Array of strings. List of project names, URLs, or descriptions.
        - careerGoals: Array of strings. 

        Resume Text:
        """${resumeText}"""
        
        Respond ONLY with a valid JSON object matching this schema exactly:
        {
            "skills": ["string", "string"],
            "experience": "string",
            "noticePeriod": "string",
            "preferredLocations": ["string", "string"],
            "expectedSalary": 100000,
            "hourlyRate": 50,
            "preferredTechnologies": ["string"],
            "portfolioProjects": ["string"],
            "careerGoals": ["string"]
        }
        `;
        
        return await generateContentWithFallback(prompt, userId, true);
    } catch (error) {
        console.error("Profile Extraction Error:", error);
        throw error;
    }
};
