import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Info, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const AISettings = () => {
    const [settings, setSettings] = useState({
        groqKey: '',
        geminiKey: ''
    });
    
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings/ai`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data) {
                    setSettings({
                        ...settings,
                        geminiKey: data.hasGeminiKey ? '********' : '',
                        groqKey: data.hasGroqKey ? '********' : ''
                    });
                }
            } catch (err) {
                console.error("Failed to load AI settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!agreedToTerms) {
            setStatus({ type: 'error', message: 'You must agree to the Terms and Conditions.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });
        
        try {
            const token = localStorage.getItem('token');
            const payload = { ...settings };
            
            // Don't send masked passwords back
            if (payload.geminiKey === '********') delete payload.geminiKey;
            if (payload.groqKey === '********') delete payload.groqKey;

            await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/ai`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'API Keys saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setStatus({ type: '', message: '' });
        try {
            const token = localStorage.getItem('token');
            const payload = {
                provider: 'gemini', // Test Gemini by default since Groq isn't fully supported in backend test route yet
                apiKey: settings.geminiKey === '********' ? undefined : settings.geminiKey,
                modelName: 'gemini-2.5-flash'
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/ai/test`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'Connection Test Successful!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.details || err.response?.data?.message || 'Connection Test Failed.' });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 dark:bg-white/[0.02] dark:border-white/10">
            {status.message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.type === 'success' ? <CheckCircle /> : <XCircle />}
                    <span>{status.message}</span>
                </div>
            )}

            <div className="flex items-center gap-2 mb-2">
                <Key className="text-zinc-400" size={24} />
                <h1 className="text-xl font-bold text-zinc-500 uppercase tracking-wide">CUSTOM AI API KEYS</h1>
            </div>
            <p className="text-zinc-500 text-sm mb-8">Provide your own credentials to use custom models.</p>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Instructions Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Groq Card */}
                    <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-6 border border-zinc-100 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-indigo-400" size={20} />
                            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">How to get Groq API Key:</h2>
                        </div>
                        <ol className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <li>
                                1. Go to <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 font-semibold hover:underline inline-flex items-center gap-1">console.groq.com <ExternalLink size={14} /></a>
                            </li>
                            <li>2. Log in or register your free account.</li>
                            <li>3. Navigate to <strong>API Keys</strong> in the sidebar.</li>
                            <li>4. Click <strong>Create API Key</strong>, name it, and copy it.</li>
                        </ol>
                    </div>

                    {/* Gemini Card */}
                    <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-6 border border-zinc-100 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-indigo-400" size={20} />
                            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">How to get Gemini API Key:</h2>
                        </div>
                        <ol className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <li>
                                1. Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 font-semibold hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink size={14} /></a>
                            </li>
                            <li>2. Sign in with your Google account.</li>
                            <li>3. Click <strong>Get API key</strong> in the left menu.</li>
                            <li>4. Click <strong>Create API key</strong> and copy it.</li>
                        </ol>
                    </div>
                </div>

                {/* API Key Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">GROQ API KEY</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key size={18} className="text-zinc-400" />
                            </div>
                            <input 
                                type="text" 
                                name="groqKey"
                                value={settings.groqKey}
                                onChange={handleChange}
                                placeholder="gsk_..."
                                className="w-full pl-11 p-3.5 border rounded-xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">GEMINI API KEY</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key size={18} className="text-zinc-400" />
                            </div>
                            <input 
                                type="text" 
                                name="geminiKey"
                                value={settings.geminiKey}
                                onChange={handleChange}
                                placeholder="AIzaSy..."
                                className="w-full pl-11 p-3.5 border rounded-xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Terms Checkbox */}
                <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="flex items-center h-5 mt-0.5">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 text-indigo-500 bg-zinc-50 border-zinc-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        I agree to the Terms and Conditions and accept that our API key is used to generate the AI job apply analysis, resume tailoring, and interview preparation. I understand it will be securely saved to my database profile.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-white/10 mt-6">
                    <button 
                        type="button" 
                        onClick={handleTest}
                        disabled={testing} 
                        className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                    >
                        {testing ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save All Configurations'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AISettings;
