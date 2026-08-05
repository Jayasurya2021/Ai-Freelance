import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import AnalyzerDashboard from '../components/AnalyzerDashboard';

const URLAnalyzer = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!url) return;
        
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post('http://localhost:5000/api/analyzer/url', { url }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to analyze URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">AI URL Analyzer</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">
                        Paste any job or freelance opportunity URL below to instantly see your match score and recommendations.
                    </p>
                </div>
            </div>

            <form onSubmit={handleAnalyze}>
                <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <div className="relative flex items-center bg-zinc-50/50 dark:bg-black/20 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 focus-within:border-emerald-500 transition-all">
                        <div className="pl-4 text-zinc-400">
                            <Search size={20} />
                        </div>
                        <input 
                            type="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.upwork.com/freelance-jobs/..."
                            className="w-full p-4 pl-3 outline-none text-base bg-transparent text-zinc-900 dark:text-white"
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="mr-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {loading ? <><Loader2 className="animate-spin" size={16} /> Analyzing</> : 'Analyze'}
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="max-w-3xl mx-auto p-4 bg-red-100 text-red-800 rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                    <p className="text-xl font-medium animate-pulse">Extracting and analyzing opportunity...</p>
                    <p className="text-sm mt-2">This may take 10-20 seconds depending on the AI model.</p>
                </div>
            )}

            {!loading && result && (
                <AnalyzerDashboard result={result} />
            )}
        </div>
    );
};

export default URLAnalyzer;
