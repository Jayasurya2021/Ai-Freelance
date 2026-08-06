import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Info, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const AISettings = () => {
    const [settings, setSettings] = useState({
        groqKey: '',
        geminiKey: '',
        openaiKey: '',
        provider: 'gemini'
    });
    
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
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
                        provider: data.provider || 'gemini',
                        geminiKey: data.hasGeminiKey ? '********' : '',
                        groqKey: data.hasGroqKey ? '********' : '',
                        openaiKey: data.hasOpenaiKey ? '********' : ''
                    });
                    setHasChanges(false);
                }
            } catch (err) {
                console.error("Failed to load AI settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
        setHasChanges(true);
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
            const payload = { provider: settings.provider };
            
            if (settings.provider === 'gemini' && settings.geminiKey !== '********') {
                payload.geminiKey = settings.geminiKey;
            } else if (settings.provider === 'groq' && settings.groqKey !== '********') {
                payload.groqKey = settings.groqKey;
            } else if (settings.provider === 'openai' && settings.openaiKey !== '********') {
                payload.openaiKey = settings.openaiKey;
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/ai`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'API Keys saved successfully!' });
            setHasChanges(false);
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
            const payload = {};
            if (settings.provider === 'gemini') {
                payload.geminiKey = settings.geminiKey === '********' ? undefined : settings.geminiKey;
            } else if (settings.provider === 'groq') {
                payload.groqKey = settings.groqKey === '********' ? undefined : settings.groqKey;
            } else if (settings.provider === 'openai') {
                payload.openaiKey = settings.openaiKey === '********' ? undefined : settings.openaiKey;
            }

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
                <div className="grid grid-cols-1 gap-6">
                    {/* Groq Card */}
                    {settings.provider === 'groq' && (
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
                    )}

                    {/* Gemini Card */}
                    {settings.provider === 'gemini' && (
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
                    )}

                    {/* OpenAI Card */}
                    {settings.provider === 'openai' && (
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-6 border border-zinc-100 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="text-indigo-400" size={20} />
                                <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">How to get OpenAI API Key:</h2>
                            </div>
                            <ol className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <li>
                                    1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 font-semibold hover:underline inline-flex items-center gap-1">platform.openai.com <ExternalLink size={14} /></a>
                                </li>
                                <li>2. Sign in with your OpenAI account.</li>
                                <li>3. Click <strong>Create new secret key</strong>.</li>
                                <li>4. Name it and copy your new key.</li>
                            </ol>
                        </div>
                    )}
                </div>

                {/* Active Provider Selection */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">ACTIVE AI PROVIDER</label>
                    <select
                        name="provider"
                        value={settings.provider || 'gemini'}
                        onChange={handleChange}
                        className="w-full p-3.5 border rounded-xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-zinc-900 dark:text-white"
                    >
                        <option value="gemini">Google Gemini</option>
                        <option value="groq">Groq</option>
                        <option value="openai">OpenAI</option>
                    </select>
                    <p className="text-zinc-500 text-xs mt-2">Select which provider to use for all AI features.</p>
                </div>

                {/* API Key Inputs */}
                <div className="grid grid-cols-1 gap-6">
                    {settings.provider === 'groq' && (
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
                    )}
                    
                    {settings.provider === 'gemini' && (
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
                    )}

                    {settings.provider === 'openai' && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">OPENAI API KEY</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Key size={18} className="text-zinc-400" />
                                </div>
                                <input 
                                    type="text" 
                                    name="openaiKey"
                                    value={settings.openaiKey}
                                    onChange={handleChange}
                                    placeholder="sk-..."
                                    className="w-full pl-11 p-3.5 border rounded-xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Terms Checkbox */}
                <div className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="flex items-center h-5 mt-0.5">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => {
                                setAgreedToTerms(e.target.checked);
                                setHasChanges(true);
                            }}
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
                        disabled={loading || !hasChanges} 
                        className={`px-8 py-3 font-semibold rounded-xl transition shadow-sm ${
                            loading || !hasChanges 
                            ? 'bg-zinc-200 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 cursor-not-allowed' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                    >
                        {loading ? 'Saving...' : 'Save All Configurations'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AISettings;
