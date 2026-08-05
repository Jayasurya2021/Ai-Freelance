const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// Ensure process.env.GEMINI_API_KEY is set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

/**
 * Analyzes an opportunity against a user profile using Gemini.
 * @param {string} opportunityText - The raw text/description of the job.
 * @param {Object} userProfile - The user's profile object.
 * @returns {Promise<Object>} - The JSON analysis.
 */
exports.analyzeOpportunity = async (opportunityText, userProfile) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" }});
        
        const mode = userProfile.activeProfileMode || 'freelance';
        const profile = mode === 'freelance' ? userProfile.freelanceProfile : userProfile.jobProfile;
        const profileContextStr = profile ? `
        Skills: ${profile.skills?.join(', ') || 'Not specified'}
        Experience: ${profile.experience || 'Not specified'}
        Rate/Salary: ${mode === 'freelance' ? profile.hourlyRate : profile.expectedSalary || 'Not specified'}
        Preferred Tech Stack: ${profile.preferredTechStack?.join(', ') || 'Not specified'}
        Portfolio Projects: ${profile.portfolioProjects ? JSON.stringify(profile.portfolioProjects) : 'None'}
        Resume Context: ${profile.resumeText ? profile.resumeText.substring(0, 1000) : 'None'}
        ` : 'No profile data.';

        const prompt = `
        You are an expert ${mode === 'freelance' ? 'freelance career' : 'job search'} copilot.
        Analyze the following opportunity against the user's profile using deep semantic understanding, not just keyword matching.
        
        User Profile (${mode} mode):
        ${profileContextStr}
        
        Opportunity Text:
        """${opportunityText}"""
        
        Calculate a match score (0-100) based on skill match, experience, tech stack, and category.
        Decide a recommendation level: "Apply Immediately", "Good Opportunity", "Worth Considering", "Low Priority", or "Skip".
        Recommend the BEST portfolio project to share for this specific job, if any.
        
        Respond ONLY with a valid JSON object matching this schema exactly:
        {
          "matchScore": number (0-100),
          "matchReasons": [string, string] (List why it matches, starting with ✔),
          "missingSkills": [string, string] (List skills the user lacks for this job),
          "projectType": string (e.g., Ecommerce, Dashboard, Mobile App),
          "industry": string,
          "requiredSkills": [string, string],
          "budget": string (Extract budget if present, else "Not specified"),
          "timeline": string (Extract timeline if present, else "Not specified"),
          "country": string (Extract country if present, else "Any/Remote"),
          "difficulty": string (Beginner, Intermediate, Advanced),
          "estimatedHours": string,
          "recommendedPrice": string,
          "scamRisk": string (Low, Medium, High),
          "urgency": string (Low, Normal, High, ASAP),
          "aiSummary": string (A short 1-2 sentence summary of the job),
          "recommendationLevel": string (Apply Immediately, Good Opportunity, Worth Considering, Low Priority, Skip),
          "recommendationReason": string (Explain why this level was chosen),
          "portfolioRecommendation": string (Title of the best portfolio project to share, or "None")
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw error;
    }
};

/**
 * Generates an embedding for semantic search.
 * @param {string} text - The text to embed (e.g. title + description)
 * @returns {Promise<number[]>} - The embedding array.
 */
exports.generateEmbedding = async (text) => {
    try {
        // text-embedding-004 is the recommended model for embeddings
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("AI Embedding Error:", error);
        // Fallback to empty array if embedding fails
        return [];
    }
};

/**
 * Generates a personalized proposal based on the opportunity and user profile.
 * @param {Object} opportunity - The opportunity details.
 * @param {Object} userProfile - The user's profile.
 * @returns {Promise<string>} - The generated proposal text.
 */
exports.generateProposal = async (opportunity, userProfile) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const mode = userProfile.activeProfileMode || 'freelance';
        const profile = mode === 'freelance' ? userProfile.freelanceProfile : userProfile.jobProfile;
        
        const profileContextStr = profile ? `
        Name: ${userProfile.name || 'Professional'}
        Skills: ${profile.skills?.join(', ') || 'Not specified'}
        Experience: ${profile.experience || 'Not specified'}
        Portfolio Projects: ${profile.portfolioProjects ? JSON.stringify(profile.portfolioProjects) : 'None'}
        Resume Context: ${profile.resumeText ? profile.resumeText.substring(0, 1000) : 'None'}
        ` : 'No profile data.';

        const prompt = `
        You are an expert ${mode === 'freelance' ? 'freelance career' : 'job search'} copilot helping a professional write a winning ${mode === 'freelance' ? 'proposal' : 'cover letter'}.
        
        User Profile (${mode} mode):
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

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Proposal Generation Error:", error);
        throw error;
    }
};

/**
 * Checks ATS score of a resume against a job description.
 */
exports.checkAtsMatch = async (resumeText, jobDescription) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
        
        const prompt = `
        You are an expert ATS (Applicant Tracking System) analyzer.
        Compare the following Resume against the Job Description.
        
        Resume:
        """${resumeText}"""
        
        Job Description:
        """${jobDescription}"""
        
        Analyze the match and return a JSON object with this exact schema:
        {
            "score": number (0-100),
            "matchingKeywords": [string, string],
            "missingKeywords": [string, string],
            "improvementTips": [string, string]
        }
        `;
        
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("ATS Check Error:", error);
        throw error;
    }
};

/**
 * Generates a tailored resume based on a base resume and a job description.
 */
exports.generateTailoredResume = async (baseResumeText, jobDescription, mode) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
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
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Resume Generation Error:", error);
        throw error;
    }
};
