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
                axios.get('http://localhost:5000/api/monitoring/settings', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/monitoring/logs', { headers: { Authorization: `Bearer ${token}` } })
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
            await axios.post('http://localhost:5000/api/monitoring/run', {}, {
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
            const updated = await axios.post('http://localhost:5000/api/monitoring/settings', {
                enableMonitoring: !settings.enableMonitoring
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSettings(updated.data);
        } catch (err) {
            console.error("Failed to toggle monitoring");
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
                <div className="flex gap-4">
                    {settings && (
                        <button 
                            onClick={toggleMonitoring}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${settings.enableMonitoring ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}
                        >
                            <Activity size={18} /> {settings.enableMonitoring ? 'Engine Running' : 'Engine Paused'}
                        </button>
                    )}
                    <button 
                        onClick={handleRunNow} 
                        disabled={running}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Play size={18} /> {running ? 'Triggering...' : 'Run Now'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                    <Clock size={32} className="text-blue-500 mb-2" />
                    <span className="text-slate-500">Interval</span>
                    <strong className="text-2xl mt-1">{settings?.intervalMinutes || 60} mins</strong>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                    <CheckCircle size={32} className="text-green-500 mb-2" />
                    <span className="text-slate-500">Min Match Score</span>
                    <strong className="text-2xl mt-1">{settings?.minimumMatchScore || 70}%</strong>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                    <FileText size={32} className="text-purple-500 mb-2" />
                    <span className="text-slate-500">Latest Run</span>
                    <strong className="text-lg mt-1">{logs.length > 0 ? new Date(logs[0].startTime).toLocaleTimeString() : 'Never'}</strong>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                    <Activity size={32} className="text-orange-500 mb-2" />
                    <span className="text-slate-500">Total Found (Last 20)</span>
                    <strong className="text-2xl mt-1">{logs.reduce((acc, log) => acc + log.opportunitiesFound, 0)}</strong>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Recent Executions</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700">
                            <th className="p-4">Time</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Sources</th>
                            <th className="p-4 text-center">Found</th>
                            <th className="p-4 text-center">Skipped</th>
                            <th className="p-4 text-center">Alerts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id} className="border-t border-slate-200 dark:border-slate-700">
                                <td className="p-4">{new Date(log.startTime).toLocaleString()}</td>
                                <td className="p-4">
                                    {log.status === 'success' ? 
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Success</span> : 
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium flex items-center gap-1 w-max"><AlertTriangle size={12}/> Error</span>
                                    }
                                </td>
                                <td className="p-4 text-center">{log.sourcesChecked}</td>
                                <td className="p-4 text-center font-bold text-green-600">{log.opportunitiesFound}</td>
                                <td className="p-4 text-center text-slate-500">{log.duplicatesSkipped}</td>
                                <td className="p-4 text-center font-bold text-blue-600">{log.notificationsSent}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-slate-500">No monitoring logs yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonitoringDashboard;
