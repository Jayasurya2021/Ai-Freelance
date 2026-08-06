import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ManualAnalysis = ({ onClose, onComplete }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError("Please paste a job description first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/analyze`, { text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onComplete();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze job. Ensure the text is sufficiently detailed.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-xl text-zinc-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-emerald-500" /> AI Manual Analysis
                    </h3>
                    <button onClick={onClose} disabled={loading} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        Paste a job description from LinkedIn, Indeed, or any other platform. Our AI will extract all details, score it against your profile, and add it to your Feed.
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste job description here..."
                        className="w-full h-64 p-4 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white resize-none"
                        disabled={loading}
                    />
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={loading}
                        className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>Analyze Job</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ManualAnalysis;
