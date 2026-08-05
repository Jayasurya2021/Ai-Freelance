import React from 'react';
import { ExternalLink, CheckCircle, AlertTriangle, Briefcase, DollarSign, Calendar, XCircle, FileText } from 'lucide-react';

const AnalyzerDashboard = ({ result }) => {
    if (!result) return null;

    const {
        originalUrl, title, company, projectType, budget, salary, timeline,
        matchScore, matchReasons, aiSummary, recommendationLevel, recommendationReason,
        requiredSkills, missingSkills, portfolioRecommendation, proposalRecommendation,
        scamRisk
    } = result;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getRecBadgeColor = (rec) => {
        if (rec.includes('Apply')) return 'bg-green-100 text-green-800';
        if (rec.includes('Good')) return 'bg-blue-100 text-blue-800';
        if (rec.includes('Worth')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-slate-500 text-lg flex items-center gap-2 mt-1">
                            <Briefcase size={18} /> {company} • {projectType}
                        </p>
                    </div>
                    <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                        Open Original <ExternalLink size={16} />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <span className="text-slate-500 text-sm block mb-1">Match Score</span>
                        <div className={`text-4xl font-bold ${getScoreColor(matchScore)}`}>{matchScore}%</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <span className="text-slate-500 text-sm block mb-1">Compensation</span>
                        <div className="text-xl font-semibold flex items-center gap-2">
                            <DollarSign size={20} className="text-green-600" /> 
                            {budget !== 'Not specified' ? budget : salary}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <span className="text-slate-500 text-sm block mb-1">Timeline</span>
                        <div className="text-xl font-semibold flex items-center gap-2">
                            <Calendar size={20} className="text-purple-600" />
                            {timeline}
                        </div>
                    </div>
                </div>

                <div className="mb-6 p-4 rounded-xl border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI Summary</h3>
                    <p className="text-blue-900 dark:text-blue-100">{aiSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="text-green-500" /> Match Reasons
                        </h3>
                        <ul className="space-y-2">
                            {matchReasons?.map((r, i) => (
                                <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
                                    <span className="text-green-500">•</span> {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <XCircle className="text-red-500" /> Missing Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {missingSkills?.length > 0 ? missingSkills.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">{s}</span>
                            )) : <span className="text-green-600 font-medium">None! You have all required skills.</span>}
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-slate-200 dark:border-slate-700" />

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className={scamRisk === 'High' ? 'text-red-500' : 'text-yellow-500'} /> AI Recommendation
                        </h3>
                        <div className="flex items-start gap-4">
                            <span className={`px-4 py-2 rounded-lg font-bold ${getRecBadgeColor(recommendationLevel)}`}>
                                {recommendationLevel}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{recommendationReason}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <FileText className="text-blue-500" /> Recommended Action Plan
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3">
                            <p><strong>Portfolio to highlight:</strong> {portfolioRecommendation}</p>
                            <p><strong>Strategy:</strong> {proposalRecommendation}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyzerDashboard;
