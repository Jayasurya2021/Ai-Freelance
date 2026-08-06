exports.calculateCompleteness = (userProfile) => {
    let score = 0;
    let missingFields = [];
    const fieldsToChecks = [];

    const activeProfile = userProfile;
    
    if (!activeProfile) {
        return { percentage: 0, missingFields: ['Entire Profile'] };
    }

    fieldsToChecks.push(
        { field: 'skills', weight: 15 },
        { field: 'experience', weight: 10 },
        { field: 'hourlyRate', weight: 10 },
        { field: 'preferredBudget', weight: 10 },
        { field: 'preferredCountries', weight: 5 },
        { field: 'preferredIndustries', weight: 10 },
        { field: 'preferredProjectTypes', weight: 10 },
        { field: 'preferredTechnologies', weight: 10 },
        { field: 'proposalTemplate', weight: 10 },
        { field: 'careerGoals', weight: 10 }
    );

    fieldsToChecks.forEach(({ field, weight }) => {
        const val = activeProfile[field];
        if (val && (Array.isArray(val) ? val.length > 0 : val !== 0 && val !== '')) {
            score += weight;
        } else {
            missingFields.push(field);
        }
    });

    return {
        percentage: Math.min(score, 100),
        missingFields
    };
};
