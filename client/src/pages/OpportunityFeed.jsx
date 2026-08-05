import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, CheckCircle, Briefcase, DollarSign, Calendar, Star, FileText } from 'lucide-react';

const OpportunityFeed = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpps = async () => {
            try {
                const token = localStorage.getItem('token');
                // Reusing the existing opportunity route
                const { data } = await axios.get('http://localhost:5000/api/opportunities', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOpportunities(data);
            } catch (err) {
                console.error("Failed to load feed");
            } finally {
                setLoading(false);
            }
        };
        fetchOpps();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500 bg-green-100';
        if (score >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-500 bg-red-100';
    };

    return (
        <div className="max-w-7xl mx-auto mt-10 p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Opportunity Feed</h1>
                <p className="text-slate-500">AI-curated opportunities matching your profile.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading feed...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map(opp => (
                        <div key={opp._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden hover:shadow-lg transition">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {opp.platform || 'Unknown Source'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getScoreColor(opp.matchScore)}`}>
                                        <Star size={12}/> {opp.matchScore}% Match
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 line-clamp-2">{opp.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1"><Briefcase size={14}/> {opp.company}</p>
                                
                                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                        <DollarSign size={14} className="text-green-500"/>
                                        <span className="truncate">{opp.budget !== 'Not specified' ? opp.budget : opp.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                        <Calendar size={14} className="text-purple-500"/>
                                        <span className="truncate">{opp.timeline}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                    {opp.aiSummary}
                                </p>
                            </div>
                            
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                                <a href={opp.originalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
                                    View Source <ExternalLink size={14}/>
                                </a>
                                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                    <FileText size={14}/> Details
                                </button>
                            </div>
                        </div>
                    ))}
                    {opportunities.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            No opportunities found. Check your sources or AI settings.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OpportunityFeed;
