import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Activity, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const MonitoringDashboard = () => {
    const [settings, setSettings] = useState(null);
    const [logs, setLogs] = useState([]);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [settingsRes, logsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/monitoring/settings`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/monitoring/logs`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSettings(settingsRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            console.error("Failed to fetch monitoring data");
        }
    };

    const handleRunNow = async () => {
        setRunning(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/monitoring/run`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Monitoring run triggered in the background. Check back in a minute for logs.');
        } catch (err) {
            alert('Failed to trigger run.');
        } finally {
            setRunning(false);
        }
    };

    const toggleMonitoring = async () => {
        if (!settings) return;
        try {
            const token = localStorage.getItem('token');
            const updated = await axios.post(`${import.meta.env.VITE_API_URL}/api/monitoring/settings`, {
                enableMonitoring: !settings.enableMonitoring
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSettings(updated.data);
        } catch (err) {
            console.error("Failed to toggle monitoring");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Monitoring Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">Manage the background AI engine that automatically scouts for leads.</p>
                </div>
                <div className="flex gap-4">
                    {settings && (
                        <button 
                            onClick={toggleMonitoring}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${settings.enableMonitoring ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'}`}
                        >
                            <Activity size={16} /> {settings.enableMonitoring ? 'Engine Running' : 'Engine Paused'}
                        </button>
                    )}
                    <button 
                        onClick={handleRunNow} 
                        disabled={running}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <Play size={16} /> {running ? 'Triggering...' : 'Run Now'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <Clock size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Check Interval</span>
                    <select 
                        value={settings?.intervalMinutes || 60}
                        onChange={async (e) => {
                            if (!settings) return;
                            const newInterval = parseInt(e.target.value);
                            try {
                                const token = localStorage.getItem('token');
                                const updated = await axios.post(`${import.meta.env.VITE_API_URL}/api/monitoring/settings`, {
                                    intervalMinutes: newInterval
                                }, { headers: { Authorization: `Bearer ${token}` } });
                                setSettings(updated.data);
                            } catch (err) {
                                console.error("Failed to update interval", err);
                            }
                        }}
                        className="p-2 border border-zinc-200 rounded-lg text-lg font-bold text-zinc-900 bg-zinc-50 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={60}>1 hour</option>
                        <option value={180}>3 hours</option>
                        <option value={360}>6 hours</option>
                        <option value={720}>12 hours</option>
                        <option value={1440}>24 hours</option>
                    </select>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Min Match Score</span>
                    <strong className="text-2xl mt-1 text-zinc-900">{settings?.minimumMatchScore || 70}%</strong>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <FileText size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Latest Run</span>
                    <strong className="text-lg mt-1 text-zinc-900">{logs.length > 0 ? new Date(logs[0].startTime).toLocaleTimeString() : 'Never'}</strong>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                        <Activity size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Found (Last 20)</span>
                    <strong className="text-2xl mt-1 text-zinc-900">{logs.reduce((acc, log) => acc + log.opportunitiesFound, 0)}</strong>
                </div>
            </div>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">Recent Executions</h2>
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Time</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Sources</th>
                            <th className="p-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Found</th>
                            <th className="p-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Skipped</th>
                            <th className="p-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Alerts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {logs.map(log => (
                            <tr key={log._id} className="hover:bg-zinc-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-zinc-900">{new Date(log.startTime).toLocaleString()}</td>
                                <td className="p-4">
                                    {log.status === 'success' ? 
                                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-bold flex items-center gap-1 w-max"><CheckCircle size={12}/> Success</span> : 
                                        <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-bold flex items-center gap-1 w-max"><AlertTriangle size={12}/> Error</span>
                                    }
                                </td>
                                <td className="p-4 text-center text-sm font-medium text-zinc-700">{log.sourcesChecked}</td>
                                <td className="p-4 text-center text-sm font-bold text-emerald-600">{log.opportunitiesFound}</td>
                                <td className="p-4 text-center text-sm font-medium text-zinc-400">{log.duplicatesSkipped}</td>
                                <td className="p-4 text-center text-sm font-bold text-blue-600">{log.notificationsSent}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-zinc-500 text-sm">No monitoring logs yet. The background agent will run automatically.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonitoringDashboard;
