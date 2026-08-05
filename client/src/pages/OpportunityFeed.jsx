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
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities`, {
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Opportunity Feed</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">AI-curated opportunities matching your active profile.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map(opp => (
                        <div key={opp._id} className="bg-white dark:bg-white/[0.02] rounded-2xl shadow-sm border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2.5 py-1 rounded-lg">
                                        {opp.platform || 'Unknown Source'}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                                        opp.matchScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                                        opp.matchScore >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                                        'text-zinc-700 bg-zinc-50 border-zinc-200'
                                    }`}>
                                        <Star size={12}/> {opp.matchScore}% Match
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 leading-snug">{opp.title}</h3>
                                <p className="text-sm text-zinc-500 mb-5 flex items-center gap-1.5"><Briefcase size={14} className="text-zinc-400"/> {opp.company}</p>
                                
                                <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/5 p-2 rounded-xl border border-zinc-100 dark:border-white/5">
                                        <div className="p-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-md">
                                            <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400"/>
                                        </div>
                                        <span className="truncate font-medium">{opp.budget !== 'Not specified' ? opp.budget : opp.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/5 p-2 rounded-xl border border-zinc-100 dark:border-white/5">
                                        <div className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded-md">
                                            <Calendar size={14} className="text-blue-600 dark:text-blue-400"/>
                                        </div>
                                        <span className="truncate font-medium">{opp.timeline}</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-50/50 dark:bg-black/20 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                        {opp.aiSummary}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-5 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-transparent flex gap-3">
                                <a href={opp.originalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    View Source <ExternalLink size={14}/>
                                </a>
                                <button className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <FileText size={14}/> Details
                                </button>
                            </div>
                        </div>
                    ))}
                    {opportunities.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                                <Briefcase className="text-zinc-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">No opportunities found</h3>
                            <p className="text-zinc-500 mt-1 max-w-sm">Try adjusting your filters or wait for Jarvis to pull in more leads from your sources.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OpportunityFeed;
