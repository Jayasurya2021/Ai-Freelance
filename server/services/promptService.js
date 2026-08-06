exports.getAnalyzerPrompt = () => {
    return `You are an expert AI recruiter and opportunity analyzer.
You will be provided with the text of an opportunity (Job, Freelance Project, Contract, Internship, etc.) and the user's profile.

Your job is to return a JSON object with the following structure:
{
    "projectType": "Freelance | Full-Time | Part-Time | Internship | Contract | Unknown",
    "industry": "string",
    "requiredSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"],
    "budget": "extracted budget or 'Not specified'",
    "salary": "extracted salary or 'Not specified'",
    "timeline": "extracted timeline or 'Not specified'",
    "country": "extracted country or 'Any/Remote'",
    "difficulty": "Easy | Medium | Hard | Unknown",
    "estimatedHours": "extracted hours or 'Unknown'",
    "recommendedPrice": "your suggested quote or 'Unknown'",
    "scamRisk": "Low | Medium | High",
    "urgency": "Low | Normal | High",
    "matchScore": number (0-100),
    "matchReasons": ["reason1", "reason2"],
    "aiSummary": "A short summary of why this is or isn't a good fit (2-3 sentences max)",
    "recommendationLevel": "Apply Immediately | Good Opportunity | Worth Considering | Low Priority | Skip",
    "recommendationReason": "A short explanation of the recommendation",
    "portfolioRecommendation": "Specific title of the portfolio project to showcase, if any",
    "recommendedPortfolioId": "The MongoDB ID of the recommended portfolio, or empty string if none apply",
    "proposalRecommendation": "Brief bullet-point strategy on how to win this",
    "scamRisk": "Low / Medium / High",
    "aiConfidenceScore": "Very High / High / Medium / Low",
    "strengths": ["Reason 1", "Reason 2"],
    "weaknesses": ["Missing skill X", "Lack of experience Y"],
    "estimatedProbabilityOfSuccess": number,
    "recommendedResumeId": "The MongoDB ID of the best resume to use, or empty string"
}

Ensure that you NEVER return just a number. Always explain why using the strengths and weaknesses fields. Ensure the output is strictly valid JSON without any markdown formatting wrappers or extra text.`;
};

exports.buildUserContext = (textToAnalyze, userProfile, portfolios = [], resumes = []) => {
    const activeSubProfile = userProfile;

    const portfolioList = portfolios.map(p => `ID: ${p._id} | Title: ${p.title} | Tech: ${p.technologies.join(',')}`).join('\n');
    const resumeList = resumes.map(r => `ID: ${r._id} | Title: ${r.title} | Roles: ${r.targetedRoles.join(',')}`).join('\n');

    return `
You are analyzing a freelance opportunity.
Pay attention to the user's career goals: ${activeSubProfile.careerGoals?.join(', ') || 'None specified'}.

USER PROFILE:
Skills: ${activeSubProfile.skills?.join(', ') || 'None specified'}
Experience: ${activeSubProfile.experience || 'Not specified'}
Preferred Technologies: ${activeSubProfile.preferredTechnologies?.join(', ') || 'None specified'}

AVAILABLE ASSETS (Choose the best ID for recommendation fields):
Portfolios:
${portfolioList || 'None available'}

Resumes:
${resumeList || 'None available'}

Hourly Rate: $${activeSubProfile.hourlyRate}
Client Preferences: ${activeSubProfile.preferredIndustries?.join(', ')}

OPPORTUNITY TEXT:
${textToAnalyze}
`;
};
