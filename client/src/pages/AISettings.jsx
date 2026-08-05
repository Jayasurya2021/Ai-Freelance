import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Save, CheckCircle, XCircle } from 'lucide-react';

const AISettings = () => {
    const [settings, setSettings] = useState({
        provider: 'gemini',
        geminiModel: 'gemini-2.5-flash',
        openaiModel: 'gpt-4o',
        geminiKey: '',
        openaiKey: ''
    });
    
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenaiKey, setShowOpenaiKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5000/api/settings/ai', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data) {
                    setSettings({
                        ...settings,
                        provider: data.provider,
                        geminiModel: data.geminiModel,
                        openaiModel: data.openaiModel,
                        // Don't show real keys, just placeholders if they exist
                        geminiKey: data.hasGeminiKey ? '********' : '',
                        openaiKey: data.hasOpenaiKey ? '********' : ''
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
        setLoading(true);
        setStatus({ type: '', message: '' });
        
        try {
            const token = localStorage.getItem('token');
            const payload = { ...settings };
            
            // Don't send masked passwords back
            if (payload.geminiKey === '********') delete payload.geminiKey;
            if (payload.openaiKey === '********') delete payload.openaiKey;

            await axios.post('http://localhost:5000/api/settings/ai', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'Settings saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setStatus({ type: '', message: '' });
        try {
            const token = localStorage.getItem('token');
            // If the key is masked, it means we want the backend to use its stored key
            const payload = {
                provider: settings.provider,
                apiKey: settings[settings.provider + 'Key'] === '********' ? undefined : settings[settings.provider + 'Key'],
                modelName: settings[settings.provider + 'Model']
            };

            await axios.post('http://localhost:5000/api/settings/ai/test', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'Connection Test Successful!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.details || 'Connection Test Failed.' });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 dark:bg-black/20 dark:border-white/10">

            {status.message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.type === 'success' ? <CheckCircle /> : <XCircle />}
                    <span>{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Active Provider</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="provider" value="gemini" checked={settings.provider === 'gemini'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                            <span>Google Gemini</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="provider" value="openai" checked={settings.provider === 'openai'} onChange={handleChange} className="w-4 h-4 text-purple-600" />
                            <span>OpenAI</span>
                        </label>
                    </div>
                </div>

                {settings.provider === 'gemini' && (
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <h2 className="text-xl font-semibold">Gemini Configuration</h2>
                        <div>
                            <label className="block text-sm font-medium mb-2">API Key</label>
                            <div className="relative">
                                <input 
                                    type={showGeminiKey ? 'text' : 'password'} 
                                    name="geminiKey"
                                    value={settings.geminiKey}
                                    onChange={handleChange}
                                    placeholder="AIza..."
                                    className="w-full p-3 pr-12 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                />
                                <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                    {showGeminiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Model</label>
                            <select name="geminiModel" value={settings.geminiModel} onChange={handleChange} className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                            </select>
                        </div>
                    </div>
                )}

                {settings.provider === 'openai' && (
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <h2 className="text-xl font-semibold">OpenAI Configuration</h2>
                        <div>
                            <label className="block text-sm font-medium mb-2">API Key</label>
                            <div className="relative">
                                <input 
                                    type={showOpenaiKey ? 'text' : 'password'} 
                                    name="openaiKey"
                                    value={settings.openaiKey}
                                    onChange={handleChange}
                                    placeholder="sk-..."
                                    className="w-full p-3 pr-12 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                />
                                <button type="button" onClick={() => setShowOpenaiKey(!showOpenaiKey)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                    {showOpenaiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Model</label>
                            <select name="openaiModel" value={settings.openaiModel} onChange={handleChange} className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini">GPT-4o Mini</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button type="button" onClick={handleTest} disabled={testing} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                        {testing ? 'Testing...' : 'Test Connection'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AISettings;
