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
        <div className="max-w-6xl mx-auto mt-10 p-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                    AI URL Analyzer
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Paste any job or freelance opportunity URL below to instantly see your match score and recommendations.
                </p>
            </div>

            <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto mb-10">
                <div className="relative flex items-center shadow-lg rounded-full overflow-hidden border-2 border-transparent focus-within:border-blue-500 transition-all bg-white dark:bg-slate-800">
                    <div className="pl-6 text-slate-400">
                        <Search size={24} />
                    </div>
                    <input 
                        type="url" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.upwork.com/freelance-jobs/..."
                        className="w-full p-5 pl-4 outline-none text-lg bg-transparent dark:text-white"
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors flex items-center gap-2"
                    >
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing</> : 'Analyze'}
                    </button>
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
