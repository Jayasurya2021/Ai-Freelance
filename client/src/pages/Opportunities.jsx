import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Inbox, ExternalLink, ShieldCheck, Zap, Search, Loader2, FileText, CheckCircle2, Copy, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fetchOpportunities = async ({ queryKey }) => {
  const [_key, searchQuery] = queryKey;
  const url = searchQuery 
    ? `${import.meta.env.VITE_API_URL}/api/opportunities?q=${encodeURIComponent(searchQuery)}`
    : `${import.meta.env.VITE_API_URL}/api/opportunities`;
  const { data } = await axios.get(url);
  return data.opportunities || [];
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-16 text-center h-full rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-50"></div>
    <div className="w-24 h-24 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-zinc-200/20 dark:shadow-black/50">
      <div className="absolute inset-0 rounded-full border border-zinc-300/50 dark:border-white/20 animate-ping opacity-20"></div>
      <Inbox className="text-zinc-400 dark:text-zinc-500" size={40} />
    </div>
    <h4 className="text-zinc-900 dark:text-white font-bold text-2xl relative z-10 tracking-tight">Pipeline is clear</h4>
    <p className="text-zinc-500 dark:text-zinc-400 text-base mt-3 max-w-md mx-auto relative z-10 leading-relaxed">
      Jarvis hasn't found any real opportunities yet. Configure your exact RSS feeds in your Profile to start receiving AI-curated leads.
    </p>
  </div>
);

const Opportunities = () => {
  const { user } = useAuth();
  const [semanticQuery, setSemanticQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: opportunities = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunities_full', semanticQuery],
    queryFn: fetchOpportunities
  });
  const [scanUrl, setScanUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  
  const [proposalModal, setProposalModal] = useState({ isOpen: false, opportunityId: null, proposalText: '', isGenerating: false });
  const [copied, setCopied] = useState(false);

  const handleGenerateProposal = async (opportunityId) => {
    setProposalModal({ isOpen: true, opportunityId, proposalText: '', isGenerating: true });
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/opportunities/${opportunityId}/proposal`, {
        userId: user?._id || localStorage.getItem('userId')
      });
      setProposalModal(prev => ({ ...prev, proposalText: data.proposal, isGenerating: false }));
    } catch (error) {
      setProposalModal(prev => ({ ...prev, proposalText: 'Failed to generate proposal. Please try again.', isGenerating: false }));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/opportunities/${id}/status`, { status });
      refetch();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalModal.proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanUrl) return;
    setIsScanning(true);
    setScanMessage(null);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/opportunities/ingest-url`, {
        url: scanUrl,
        sourceName: 'Manual URL',
        platform: 'Web',
        userId: user?._id || localStorage.getItem('userId') // fallback
      });
      setScanUrl('');
      setScanMessage({ type: 'success', text: 'URL analyzed successfully! Lead added.' });
      refetch(); // Refresh the list
    } catch (error) {
      setScanMessage({ type: 'error', text: 'Failed to analyze URL. Please check if the URL is accessible.' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 tracking-tight">Opportunities</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">Your AI-curated freelance opportunities from real sources.</p>
        </div>
      </div>

      {/* Semantic Search Bar */}
      <form onSubmit={(e) => { e.preventDefault(); setSemanticQuery(searchInput); }} className="relative flex items-center">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={20} className="text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Semantic Search (e.g. 'Looking for easy react projects paying over $50')"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-2xl pl-12 pr-32 py-4 text-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400 shadow-sm text-base"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
        >
          Search
        </button>
      </form>

      {/* Quick Scan Section */}
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="p-5 md:p-6 relative overflow-hidden rounded-[15px] border-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              <Zap size={20} className="text-emerald-500" />
              Quick Scan URL
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Paste any job post or freelance listing URL for Jarvis to analyze and match against your profile instantly.</p>
            
            <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-zinc-400" />
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/job/123"
                  value={scanUrl}
                  onChange={(e) => setScanUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isScanning || !scanUrl}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                ) : (
                  'Scan & Extract'
                )}
              </button>
            </form>
            {scanMessage && (
              <p className={`mt-3 text-sm font-medium ${scanMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                {scanMessage.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm p-16 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-zinc-500 font-medium">Neural matching engine running...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-500/20 overflow-hidden bg-red-50 dark:bg-red-500/5 p-16 text-center text-red-600 dark:text-red-400 font-medium">
          Failed to connect to backend API. Please ensure the server is running.
        </div>
      ) : opportunities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {opportunities.map((op) => (
            <div key={op._id} className="bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col md:flex-row group transition-all duration-300 hover:border-zinc-300 relative">
              <div className="flex-1 p-6 md:p-8 space-y-5 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{op.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> Verified Source</span>
                      <span>•</span>
                      <span>{op.sourceName}</span>
                      <span>•</span>
                      <span>{new Date(op.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border whitespace-nowrap shadow-sm ${op.matchScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`}>
                      {op.matchScore}% Match
                    </span>
                    {op.recommendationLevel && (
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${
                        op.recommendationLevel === 'Apply Immediately' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400' : 
                        op.recommendationLevel === 'Skip' ? 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400' :
                        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400'
                      }`}>
                        {op.recommendationLevel}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                  {op.aiSummary ? <span className="font-medium text-zinc-900 dark:text-zinc-200">{op.aiSummary}</span> : op.description.substring(0, 300) + '...'}
                </p>

                {op.matchReasons && op.matchReasons.length > 0 && (
                  <div className="p-4 bg-zinc-50/50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/5 border-l-2 border-l-emerald-500">
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap size={14} className="text-emerald-500"/>
                      Jarvis Analysis
                    </h5>
                    <ul className="text-sm space-y-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                      {op.matchReasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {reason}
                        </li>
                      ))}
                      {op.portfolioRecommendation && op.portfolioRecommendation !== 'None' && (
                        <li className="flex items-start gap-2 mt-2 pt-2 border-t border-zinc-200/50 dark:border-white/5">
                          <span className="text-blue-500 mt-0.5">💡</span>
                          <span className="text-zinc-700 dark:text-zinc-300">Portfolio to share: <strong className="text-zinc-900 dark:text-white">{op.portfolioRecommendation}</strong></span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-72 flex flex-col gap-4 justify-center bg-zinc-50/50 dark:bg-black/20 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-white/10 p-6 md:p-8 relative z-10">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Budget</p>
                  <p className="font-bold text-lg text-zinc-900 dark:text-white">{op.budget}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Difficulty</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">{op.difficulty}</span>
                    <div className="flex gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className={`w-2 h-4 rounded-sm ${i <= (op.difficulty === 'Hard' ? 3 : op.difficulty === 'Medium' ? 2 : 1) ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-white/10'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 space-y-3">
                  <button 
                    onClick={() => handleGenerateProposal(op._id)}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    Generate Proposal <FileText size={16} />
                  </button>
                  
                  <div className="flex gap-2">
                    <a 
                      href={op.originalUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Original <ExternalLink size={14} />
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => handleUpdateStatus(op._id, 'Applied')} className={`flex-1 flex justify-center items-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${op.status === 'Applied' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'}`}>
                      <ThumbsUp size={14} /> Applied
                    </button>
                    <button onClick={() => handleUpdateStatus(op._id, 'Ignored')} className={`flex-1 flex justify-center items-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${op.status === 'Ignored' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'}`}>
                      <ThumbsDown size={14} /> Ignored
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proposal Generation Modal */}
      {proposalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/20">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="text-emerald-500" /> AI Proposal Draft
              </h3>
              <button onClick={() => setProposalModal({ isOpen: false })} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {proposalModal.isGenerating ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 size={40} className="animate-spin text-emerald-500" />
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">Crafting personalized proposal...</p>
                </div>
              ) : (
                <textarea 
                  className="w-full h-full min-h-[300px] p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm leading-relaxed"
                  value={proposalModal.proposalText}
                  onChange={(e) => setProposalModal(prev => ({...prev, proposalText: e.target.value}))}
                />
              )}
            </div>

            {!proposalModal.isGenerating && (
              <div className="p-5 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/20 flex justify-end gap-3">
                <button onClick={() => handleGenerateProposal(proposalModal.opportunityId)} className="px-5 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors">
                  Regenerate
                </button>
                <button onClick={copyToClipboard} className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95">
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
