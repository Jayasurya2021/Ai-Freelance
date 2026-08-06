import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ExternalLink, Briefcase, DollarSign, MapPin, 
    Clock, Star, Search, Filter, Bookmark, X, AlertCircle 
} from 'lucide-react';
import JobDetailsModal from '../components/JobDetailsModal';
import ManualAnalysis from '../components/ManualAnalysis';

const JobFeed = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sources, setSources] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSource, setSelectedSource] = useState('All Sources');
    const [statusFilter, setStatusFilter] = useState('new');
    const [recommendationFilter, setRecommendationFilter] = useState('All');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);

    useEffect(() => {
        fetchSources();
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [page, selectedSource, statusFilter, recommendationFilter, searchQuery]);

    const fetchSources = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/sources`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSources(data);
        } catch (err) {
            console.error("Failed to load sources");
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL(`${import.meta.env.VITE_API_URL}/api/jobs`);
            url.searchParams.append('page', page);
            url.searchParams.append('limit', 12);
            if (selectedSource !== 'All Sources') url.searchParams.append('sourceName', selectedSource);
            if (statusFilter !== 'All') url.searchParams.append('status', statusFilter);
            if (recommendationFilter !== 'All') url.searchParams.append('recommendation', recommendationFilter);
            if (searchQuery) url.searchParams.append('q', searchQuery);

            const { data } = await axios.get(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(data.jobs);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(jobs.map(j => j._id === id ? { ...j, status: data.status } : j));
        } catch (err) {
            console.error("Failed to save job");
        }
    };

    const toggleHide = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/${id}/hide`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // If we hid it and we are on the 'new' filter, remove from list
            if (data.status === 'hidden' && statusFilter === 'new') {
                setJobs(jobs.filter(j => j._id !== id));
            } else {
                setJobs(jobs.map(j => j._id === id ? { ...j, status: data.status } : j));
            }
        } catch (err) {
            console.error("Failed to hide job");
        }
    };

    const getRecommendationBadge = (rec) => {
        switch (rec) {
            case 'Apply': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Maybe': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'Skip': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-500';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header & Controls */}
            <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">AI Job Feed</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base max-w-xl">
                            Hyper-personalized job opportunities curated, scored, and analyzed by your AI career copilot.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => setShowManualEntry(true)}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-sm"
                        >
                            Paste LinkedIn Job
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Semantic search (e.g. React Native roles in FinTech)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white"
                        />
                    </div>
                    <div>
                        <select 
                            value={selectedSource}
                            onChange={(e) => {setSelectedSource(e.target.value); setPage(1);}}
                            className="w-full p-3 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer dark:text-white"
                        >
                            <option value="All Sources">All Sources</option>
                            {sources.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <select 
                            value={statusFilter}
                            onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
                            className="w-1/2 p-3 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer dark:text-white"
                        >
                            <option value="new">Inbox</option>
                            <option value="saved">Saved</option>
                            <option value="applied">Applied</option>
                            <option value="All">Everything</option>
                        </select>
                        <select 
                            value={recommendationFilter}
                            onChange={(e) => {setRecommendationFilter(e.target.value); setPage(1);}}
                            className="w-1/2 p-3 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer dark:text-white"
                        >
                            <option value="All">All Recs</option>
                            <option value="Apply">Apply</option>
                            <option value="Maybe">Maybe</option>
                            <option value="Skip">Skip</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Feed Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-3xl h-80"></div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-3xl">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                            <Briefcase className="text-zinc-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No jobs found</h3>
                        <p className="text-zinc-500 mt-2 max-w-sm">Adjust your filters or add more sources in the Source Manager.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {jobs.map(job => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={job._id} 
                                    onClick={() => setSelectedJob(job)}
                                    className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col overflow-hidden relative"
                                >
                                    {/* Action Buttons Top Right */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button 
                                            onClick={(e) => toggleSave(job._id, e)}
                                            className={`p-2 rounded-full backdrop-blur-md border ${job.status === 'saved' ? 'bg-emerald-500 text-white border-transparent' : 'bg-white/80 text-zinc-600 border-zinc-200 hover:bg-zinc-100'}`}
                                        >
                                            <Bookmark size={16} className={job.status === 'saved' ? 'fill-current' : ''} />
                                        </button>
                                        <button 
                                            onClick={(e) => toggleHide(job._id, e)}
                                            className="p-2 rounded-full backdrop-blur-md bg-white/80 text-zinc-600 border border-zinc-200 hover:bg-red-50 hover:text-red-600"
                                            title="Hide Job"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4 pr-16">
                                            <span className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${getRecommendationBadge(job.recommendation)}`}>
                                                {job.recommendation}
                                            </span>
                                            <span className={`text-sm font-extrabold flex items-center gap-1 ${getScoreColor(job.matchScore)}`}>
                                                {job.matchScore}% Match
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-snug line-clamp-2">
                                            {job.title}
                                        </h3>
                                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-5 flex flex-col gap-1.5">
                                            <span className="flex items-center gap-1.5"><Briefcase size={14}/> {job.company}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={14}/> {job.location}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-5">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-semibold">
                                                <DollarSign size={12}/> {job.salary !== 'Not specified' ? job.salary : 'N/A'}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-semibold">
                                                <Clock size={12}/> {job.employmentType}
                                            </span>
                                        </div>

                                        <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                                            <p className="text-sm text-emerald-800 dark:text-emerald-200/80 line-clamp-3 leading-relaxed">
                                                {job.aiSummary || job.description.substring(0, 100) + '...'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/10 flex justify-between items-center text-xs text-zinc-400 font-medium">
                                        <span>via {job.sourceName}</span>
                                        <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-semibold disabled:opacity-50 dark:text-white"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-zinc-500">Page {page} of {totalPages}</span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-semibold disabled:opacity-50 dark:text-white"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {selectedJob && (
                    <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
                )}
                {showManualEntry && (
                    <ManualAnalysis onClose={() => setShowManualEntry(false)} onComplete={() => {setShowManualEntry(false); fetchJobs();}} />
                )}
            </AnimatePresence>

        </div>
    );
};

export default JobFeed;
