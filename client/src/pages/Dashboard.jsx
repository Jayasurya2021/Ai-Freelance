import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Target, Zap, Activity, TrendingUp, Inbox, Bookmark, BookmarkCheck, ExternalLink, Mail, MessageSquare } from 'lucide-react';

const fetchOpportunities = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities?limit=5`);
  return data.opportunities || [];
};

const fetchStats = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities/stats`);
  return data;
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/30',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/30',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/30',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/30',
  };
  
  const classes = colorMap[color] || colorMap.emerald;
  const textColor = classes.split(' ')[0];
  const bgColor = classes.split(' ')[1];
  const borderColor = classes.split(' ')[2];
  
  return (
    <div className={`rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm p-6 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold mt-2 text-zinc-900 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${bgColor} ${borderColor} group-hover:scale-110 transition-all duration-300`}>
          <Icon className={textColor} size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm relative z-10">
          <span className={`font-bold px-2 py-0.5 rounded-md border ${bgColor} ${borderColor} ${textColor}`}>{trend}</span>
          <span className="text-zinc-500 dark:text-zinc-400 ml-2 font-medium">from last week</span>
        </div>
      )}
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 ${bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-all duration-500 pointer-events-none`}></div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center h-full">
    <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-4">
      <Inbox className="text-blue-500" size={32} />
    </div>
    <h4 className="text-zinc-900 dark:text-white font-semibold text-lg">No matching opportunities found</h4>
    <p className="text-zinc-500 text-sm mt-2 max-w-sm">
      Jarvis hasn't found any real opportunities yet. Import a URL or wait for the RSS feed to sync.
    </p>
  </div>
);

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading, isError } = useQuery({
    queryKey: ['opportunities'],
    queryFn: fetchOpportunities
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/opportunities/${id}/save`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['opportunities']);
    }
  });

  const handleMailTo = (op) => {
    const subject = encodeURIComponent(`Application for: ${op.title}`);
    const body = encodeURIComponent(`Hi there,\n\nI am very interested in the ${op.title} position you posted.\n\nMy AI copilot indicated I am a ${op.matchScore}% match for this role based on my skills.\n\nI would love to discuss this further.\n\nBest regards,`);
    window.location.href = `mailto:client@example.com?subject=${subject}&body=${body}`;
  };

  const highMatches = opportunities.filter(op => op.matchScore >= 90).length;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 tracking-tight">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">Here's a summary of your freelance pipeline today.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:from-blue-500 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95">
          Run Analysis
          <Zap size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="New Leads Today" value={stats ? stats.todaysCount : '-'} icon={Target} color="blue" />
        <StatCard title="High Match" value={stats ? stats.highMatchCount : '-'} icon={Zap} color="emerald" />
        <StatCard title="Applied" value={stats ? stats.appliedCount : '-'} icon={Activity} color="purple" />
        <StatCard title="Saved" value={stats ? stats.savedCount : '-'} icon={BookmarkCheck} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm flex flex-col relative h-[400px]">
          <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
             <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Pipeline Analytics</h3>
             <select className="bg-transparent border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
               <option className="dark:bg-zinc-900">Last 7 Days</option>
               <option className="dark:bg-zinc-900">Last 30 Days</option>
             </select>
          </div>
          <div className="flex-1 m-6 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-xl flex items-center justify-center bg-zinc-50/30 dark:bg-white/[0.01]">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">Not enough data to render charts.</p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm flex flex-col h-[600px] lg:h-[800px]">
          <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">AI Curated Leads</h3>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Live Feed
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
            ) : isError ? (
              <div className="p-6 text-center text-red-500 text-sm font-medium">Failed to load AI matches.</div>
            ) : opportunities.length === 0 ? (
              <EmptyState />
            ) : (
              opportunities.map((op) => (
                <div key={op._id} className="block p-5 rounded-xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 hover:border-blue-500/30 dark:hover:bg-white/[0.03] transition-all duration-300 group relative">
                  
                  {/* Top Bar: Title & Match Score */}
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-base text-zinc-900 dark:text-white pr-16 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{op.title}</h4>
                    <div className="absolute top-5 right-5 flex flex-col items-end">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border whitespace-nowrap shadow-sm ${op.matchScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`}>
                        {op.matchScore}% Match
                      </span>
                    </div>
                  </div>
                  
                  {/* AI Metadata Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[11px] font-medium px-2 py-1 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 rounded-md">Budget: {op.budget}</span>
                    <span className="text-[11px] font-medium px-2 py-1 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 rounded-md">Type: {op.projectType || 'Project'}</span>
                    <span className="text-[11px] font-medium px-2 py-1 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 rounded-md">Source: {op.sourceName}</span>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {op.description}
                  </p>
                  
                  {/* AI Reasoning */}
                  {op.matchReasons && op.matchReasons.length > 0 && (
                    <div className="mb-4 pl-3 border-l-2 border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5 p-2 rounded-r-lg">
                       <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">" {op.matchReasons[0]} "</p>
                    </div>
                  )}

                  {/* Actions Grid */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-white/10">
                    <button 
                      onClick={() => toggleSaveMutation.mutate(op._id)}
                      className="flex flex-col items-center justify-center py-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors group/btn text-zinc-500 dark:text-zinc-400"
                    >
                      {op.saved ? <BookmarkCheck size={18} className="text-emerald-500 mb-1" /> : <Bookmark size={18} className="group-hover/btn:text-emerald-500 mb-1" />}
                      <span className="text-[10px] font-bold uppercase tracking-wider">{op.saved ? 'Saved' : 'Save'}</span>
                    </button>
                    
                    <button onClick={() => alert("AI Negotiation Chat opening soon...")} className="flex flex-col items-center justify-center py-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors group/btn text-zinc-500 dark:text-zinc-400">
                      <MessageSquare size={18} className="group-hover/btn:text-purple-500 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
                    </button>

                    <button onClick={() => handleMailTo(op)} className="flex flex-col items-center justify-center py-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors group/btn text-zinc-500 dark:text-zinc-400">
                      <Mail size={18} className="group-hover/btn:text-orange-500 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Mail</span>
                    </button>

                    <a href={op.originalUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
                      <ExternalLink size={18} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Apply</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

