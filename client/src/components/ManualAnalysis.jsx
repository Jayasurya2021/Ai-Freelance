import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ManualAnalysis = ({ onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [text, setText] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [pitch, setPitch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError("Please paste a description first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/analyze`, { text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPreviewData(res.data);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze. Ensure the text is sufficiently detailed.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/approve-and-pitch`, { jobData: previewData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPitch(res.data.proposal);
            setStep(3);
        } catch (err) {
            setError("Failed to generate pitch.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(pitch);
        onComplete(); // Close after copying
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
                        <Sparkles className="text-emerald-500" /> 
                        {step === 1 && "Manual Gig Analysis"}
                        {step === 2 && "Gig Requirements Preview"}
                        {step === 3 && "Your Pitch Draft"}
                    </h3>
                    <button onClick={onClose} disabled={loading} className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                Paste a freelance gig description. Our AI will extract requirements, score it against your profile, and upon approval, draft a custom proposal.
                            </p>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste description here..."
                                className="w-full h-64 p-4 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white resize-none"
                                disabled={loading}
                            />
                        </>
                    )}

                    {step === 2 && previewData && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-zinc-900">{previewData.title}</h4>
                                    <p className="text-sm text-zinc-500">{previewData.company || 'Unknown Client'} • {previewData.salary || 'Budget not specified'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-emerald-600">{previewData.matchScore}%</div>
                                    <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Match</div>
                                </div>
                            </div>
                            
                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                <h5 className="font-semibold text-sm mb-2 text-zinc-700">Required Skills</h5>
                                <div className="flex flex-wrap gap-2">
                                    {previewData.skills?.map((s, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                <h5 className="font-semibold text-sm mb-2 text-zinc-700">AI Assessment</h5>
                                <p className="text-sm text-zinc-600 leading-relaxed">{previewData.aiSummary}</p>
                            </div>
                            
                            {previewData.missingSkills?.length > 0 && (
                                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                    <h5 className="font-semibold text-sm mb-2 text-orange-800">Missing Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {previewData.missingSkills.map((s, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-orange-100 rounded-lg text-xs font-medium text-orange-800">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && pitch && (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-500">Your gig has been saved to your feed! Here is your custom drafted proposal, ready to be sent.</p>
                            <textarea
                                value={pitch}
                                readOnly
                                className="w-full h-80 p-4 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white resize-none font-mono text-xs leading-relaxed"
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 flex justify-end gap-3">
                    {step === 1 && (
                        <>
                            <button onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-600 hover:bg-zinc-200 transition-colors">Cancel</button>
                            <button onClick={handleAnalyze} disabled={loading} className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2">
                                {loading ? "Analyzing..." : "Analyze"}
                            </button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <button onClick={() => setStep(1)} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-600 hover:bg-zinc-200 transition-colors">Back</button>
                            <button onClick={handleApprove} disabled={loading} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                                {loading ? "Generating Pitch..." : "Approve & Generate Pitch"}
                            </button>
                        </>
                    )}
                    {step === 3 && (
                        <button onClick={handleCopy} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                            Copy Pitch & Close
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ManualAnalysis;
