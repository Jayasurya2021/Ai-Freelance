import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const SourceManager = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', type: 'rss', url: '', intervalMinutes: 60 });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/sources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSources(data);
        } catch (err) {
            console.error("Failed to load sources");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(`http://localhost:5000/api/sources/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/sources', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setFormData({ name: '', type: 'rss', url: '', intervalMinutes: 60 });
            setEditingId(null);
            fetchSources();
        } catch (err) {
            console.error("Save failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/sources/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSources();
        } catch (err) {
            console.error("Delete failed");
        }
    };

    const startEdit = (source) => {
        setEditingId(source._id);
        setFormData({
            name: source.name,
            type: source.type,
            url: source.url,
            intervalMinutes: source.intervalMinutes
        });
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 dark:bg-black/20 dark:border-white/10">

            <div className="mb-10 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Source' : 'Add New Source'}</h2>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Source Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Source Type</label>
                        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded">
                            <option value="rss">RSS Feed</option>
                            <option value="url">Single URL</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Source URL</label>
                        <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <Plus size={18} /> {editingId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 dark:bg-slate-700">
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">URL</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Last Checked</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map(source => (
                            <tr key={source._id} className="border-b dark:border-slate-700">
                                <td className="p-3 font-medium">{source.name}</td>
                                <td className="p-3 uppercase text-sm">{source.type}</td>
                                <td className="p-3 text-sm truncate max-w-xs">{source.url}</td>
                                <td className="p-3">
                                    {source.status === 'active' ? (
                                        <span className="flex items-center gap-1 text-green-600"><CheckCircle size={16}/> Active</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600"><XCircle size={16}/> Error</span>
                                    )}
                                </td>
                                <td className="p-3 text-sm text-slate-500">
                                    {source.lastChecked ? new Date(source.lastChecked).toLocaleString() : 'Never'}
                                </td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => startEdit(source)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDelete(source._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {sources.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="p-6 text-center text-slate-500">No sources configured yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SourceManager;
