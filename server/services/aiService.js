const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// Ensure process.env.GEMINI_API_KEY is set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

/**
 * Analyzes a job opportunity against a user profile using Gemini.
 * @param {string} opportunityText - The raw text/description of the job.
 * @param {Object} userProfile - The user's profile object.
 * @returns {Promise<Object>} - The JSON analysis.
 */
exports.analyzeOpportunity = async (opportunityText, userProfile) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" }});
        
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
          "matchScore": number,
          "recommendation": "Apply" | "Maybe" | "Skip",
          "recommendationReason": "string",
          "missingSkills": ["string", "string"],
          "learningSuggestions": ["string", "string"],
          "resumeSuggestions": ["string", "string"],
          "coverLetterSummary": "string",
          "aiSummary": "string"
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
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

/**
 * Extracts structured profile data from raw resume text.
 */
exports.extractProfileFromResume = async (resumeText) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        
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

        Resume Text:
        """${resumeText}"""
        
        Respond ONLY with a valid JSON object matching this schema exactly:
        {
            "skills": ["string", "string"],
            "experience": "string",
            "noticePeriod": "string",
            "preferredLocations": ["string", "string"],
            "expectedSalary": number
        }
        `;
        
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Profile Extraction Error:", error);
        throw error;
    }
};
