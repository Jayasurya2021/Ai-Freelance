import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw, Eye, X } from 'lucide-react';

const SourceManager = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', type: 'rss', url: '', intervalMinutes: 60 });
    const [editingId, setEditingId] = useState(null);

    const [previewModal, setPreviewModal] = useState({ isOpen: false, loading: false, data: null, error: null });

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/sources`, {
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
                await axios.put(`${import.meta.env.VITE_API_URL}/api/sources/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/sources`, formData, {
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
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/sources/${id}`, {
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

    const handlePreview = async (source) => {
        setPreviewModal({ isOpen: true, loading: true, data: null, error: null });
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/sources/test`, {
                url: source.url, type: source.type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPreviewModal({ isOpen: true, loading: false, data, error: null });
        } catch (err) {
            setPreviewModal({ isOpen: true, loading: false, data: null, error: "Failed to fetch or parse source." });
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 dark:bg-white/[0.02] dark:border-white/10">

            <div className="mb-10 bg-white dark:bg-transparent p-6 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mb-5">{editingId ? 'Edit Source' : 'Add New Source'}</h2>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Source Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-zinc-900 dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Source Type</label>
                        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-zinc-900 dark:text-white">
                            <option value="rss">RSS Feed</option>
                            <option value="url">Web Crawl (Career Page)</option>
                            <option value="api">JSON API Endpoint</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Source URL</label>
                        <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-zinc-900 dark:text-white" required />
                    </div>
                    <div>
                        <button type="submit" className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition shadow-sm">
                            <Plus size={18} /> {editingId ? 'Update Source' : 'Add Source'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-transparent dark:border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">URL</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Last Checked</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {sources.map(source => (
                            <tr key={source._id} className="hover:bg-zinc-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-zinc-900">{source.name}</td>
                                <td className="p-4 uppercase text-xs font-bold text-zinc-500">{source.type}</td>
                                <td className="p-4 text-sm text-zinc-600 truncate max-w-[200px]">{source.url}</td>
                                <td className="p-4">
                                    {source.status === 'active' ? (
                                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-bold flex items-center gap-1 w-max"><CheckCircle size={12}/> Active</span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-bold flex items-center gap-1 w-max"><XCircle size={12}/> Error</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm font-medium text-zinc-500">
                                    {source.lastChecked ? new Date(source.lastChecked).toLocaleString() : 'Never'}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handlePreview(source)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Preview"><Eye size={16}/></button>
                                    <button onClick={() => startEdit(source)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDelete(source._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {sources.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-zinc-500 text-sm">No sources configured yet. Add one above.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {previewModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <h3 className="font-bold text-lg text-zinc-900">Source Preview</h3>
                            <button onClick={() => setPreviewModal({ isOpen: false, loading: false, data: null, error: null })} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors">
                                <X size={20} className="text-zinc-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {previewModal.loading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                                    <p className="text-zinc-500">Fetching live data from source...</p>
                                </div>
                            ) : previewModal.error ? (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                                    {previewModal.error}
                                </div>
                            ) : previewModal.data && previewModal.data.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-emerald-600 mb-4 flex items-center gap-2">
                                        <CheckCircle size={16} /> Successfully parsed {previewModal.data.length} items. Showing preview:
                                    </p>
                                    {previewModal.data.map((item, idx) => (
                                        <div key={idx} className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                                            <h4 className="font-bold text-zinc-900 mb-2">{item.title}</h4>
                                            <p className="text-xs text-zinc-500 mb-2">Company: {item.company} | URL: <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.originalUrl}</a></p>
                                            <p className="text-sm text-zinc-600 line-clamp-2">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-zinc-500">
                                    No items found. The source might be empty or blocking the crawler.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SourceManager;
