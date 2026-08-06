import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Briefcase, MapPin, DollarSign, Clock, Star, Target, Zap, AlertTriangle, FileText } from 'lucide-react';

const JobDetailsModal = ({ job, onClose }) => {
    
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full overflow-y-auto shadow-2xl border-l border-zinc-200 dark:border-white/10 flex flex-col"
            >
                {/* Header fixed */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2 leading-tight">{job.title}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5"><Briefcase size={16}/> {job.company}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={16}/> {job.location}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-zinc-600 dark:text-zinc-300" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-10 flex-1">
                    
                    {/* Key Metrics row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-4 border border-zinc-100 dark:border-white/5">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Match</span>
                            <span className={`text-xl font-extrabold flex items-center gap-1 ${getScoreColor(job.matchScore)}`}><Star size={20} className="fill-current"/> {job.matchScore}%</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-4 border border-zinc-100 dark:border-white/5">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Salary</span>
                            <span className="text-zinc-900 dark:text-white font-bold truncate block">{job.salary}</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-4 border border-zinc-100 dark:border-white/5">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Type</span>
                            <span className="text-zinc-900 dark:text-white font-bold truncate block">{job.employmentType}</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-4 border border-zinc-100 dark:border-white/5">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">Experience</span>
                            <span className="text-zinc-900 dark:text-white font-bold truncate block">{job.experience}</span>
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Zap className="text-emerald-500"/> AI Insights</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-500/5 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/10">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">Recommendation: {job.recommendation}</h4>
                                <p className="text-sm text-emerald-700/80 dark:text-emerald-200/70">{job.recommendationReason}</p>
                            </div>
                            
                            {job.missingSkills?.length > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-500/5 p-5 rounded-3xl border border-amber-100 dark:border-amber-500/10">
                                    <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5"><AlertTriangle size={16}/> Gap Analysis</h4>
                                    <ul className="text-sm text-amber-700/80 dark:text-amber-200/70 list-disc list-inside space-y-1">
                                        {job.missingSkills.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {job.coverLetterSummary && (
                            <div className="bg-blue-50 dark:bg-blue-500/5 p-5 rounded-3xl border border-blue-100 dark:border-blue-500/10">
                                <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-1.5"><FileText size={16}/> Draft Pitch / Cover Letter</h4>
                                <p className="text-sm text-blue-700/80 dark:text-blue-200/70 italic leading-relaxed">"{job.coverLetterSummary}"</p>
                            </div>
                        )}
                    </div>

                    {/* Extracted Details */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Target className="text-blue-500"/> Requirements</h3>
                        
                        {job.skills?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-white/10">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {job.responsibilities?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Responsibilities</h4>
                                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                                    {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        )}
                        
                        {job.benefits?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Benefits</h4>
                                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                                    {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Original Description */}
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Original Description</h3>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-white/5 p-6 rounded-3xl border border-zinc-100 dark:border-white/5">
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Footer fixed */}
                <div className="sticky bottom-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 p-6 flex justify-between items-center z-10">
                    <span className="text-xs text-zinc-500 font-medium">Source: {job.sourceName}</span>
                    {job.originalUrl && (
                        <a 
                            href={job.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            Apply Now <ExternalLink size={18} />
                        </a>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default JobDetailsModal;
