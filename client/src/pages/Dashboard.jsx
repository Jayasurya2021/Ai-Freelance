import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Briefcase, Code, CheckCircle, Clock, AlertTriangle, Play, Pause, List, Rss, BarChart3,
  TrendingUp, Award, Target, Zap, Activity, BookOpen, Lightbulb, Inbox, Bookmark, BookmarkCheck, ExternalLink, Mail, MessageSquare
} from 'lucide-react';
import { useProfileMode } from '../context/ProfileContext';

const fetchOpportunities = async (mode) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities?limit=5&mode=${mode}`);
  return data.opportunities || [];
};

const fetchStats = async (mode) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities/stats?mode=${mode}`);
  return data;
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    yellow: 'text-amber-500 bg-amber-50',
  };
  
  const classes = colorMap[color] || colorMap.emerald;
  
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classes}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <p className="text-sm font-semibold text-zinc-800">{title}</p>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-semibold text-zinc-900">{value}</p>
      </div>
      <div className="mt-2 text-xs font-medium text-emerald-600">
        {trend || '0% vs yesterday'}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center h-full">
    <div className="w-16 h-16 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 relative">
      <div className="absolute top-0 w-full flex justify-between px-2 -mt-1"><div className="w-1 h-1 bg-zinc-300 rounded-full"></div><div className="w-1 h-1 bg-zinc-300 rounded-full"></div></div>
      <Inbox className="text-zinc-400" size={28} />
    </div>
    <h4 className="text-zinc-900 dark:text-white font-semibold text-lg">No matching opportunities<br/>found</h4>
    <p className="text-zinc-500 text-sm mt-3 max-w-[250px] leading-relaxed">
      Jarvis hasn't found any real opportunities yet. Import a URL or wait for the RSS feed to sync.
    </p>
    <button className="mt-6 border border-zinc-200 text-zinc-700 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2">
      Inspect a URL <ExternalLink size={14} />
    </button>
  </div>
);

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { profileMode } = useProfileMode();

  const { data: opportunities = [], isLoading, isError } = useQuery({
    queryKey: ['opportunities', profileMode],
    queryFn: () => fetchOpportunities(profileMode)
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', profileMode],
    queryFn: () => fetchStats(profileMode)
  });

  const { data: completenessData } = useQuery({
      queryKey: ['profileCompleteness', profileMode],
      queryFn: async () => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/profile-completeness?mode=${profileMode}`);
          return res.data;
      }
  });

  const { data: insightsData } = useQuery({
      queryKey: ['insights', profileMode],
      queryFn: async () => {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/insights?mode=${profileMode}`);
          return res.data;
      }
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
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white tracking-tight font-serif-heading">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">Here's a snapshot of your freelance pipeline.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm">
          Run Analysis
          <Zap size={16} />
        </button>
      </div>

      {insightsData && insightsData.insight && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 flex items-start gap-4">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1">
                  <Lightbulb size={20} />
              </div>
              <div>
                  <h3 className="font-semibold text-indigo-900 mb-1">AI Daily Insight</h3>
                  <p className="text-indigo-800 text-sm">{insightsData.insight}</p>
              </div>
          </div>
      )}

      {completenessData && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-zinc-900">Profile Completeness</h3>
                  <span className="text-lg font-bold text-indigo-600">{completenessData.percentage}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2.5 mb-4">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${completenessData.percentage}%` }}></div>
              </div>
              {completenessData.missingFields?.length > 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <strong>Missing Fields to Improve AI Matching:</strong> {completenessData.missingFields.join(', ')}
                  </div>
              )}
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Opportunities" value={stats ? stats.totalCount : '0'} icon={Briefcase} color="blue" />
        <StatCard title="High Match" value={stats ? stats.highMatchCount : '0'} icon={Zap} color="yellow" />
        <StatCard title="Applied" value={stats ? stats.appliedCount : '0'} icon={Activity} color="emerald" />
        <StatCard title="Saved" value={stats ? stats.savedCount : '0'} icon={Bookmark} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          <div className="glass-card flex flex-col relative h-[400px]">
            <div className="p-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Pipeline Analytics</h3>
              <div className="flex items-center gap-2 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-zinc-50 transition-colors">
                <span className="text-sm font-medium text-zinc-700">Last 7 Days</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <div className="flex-1 m-6 flex flex-col items-center justify-center relative">
              {/* Fake grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[4,3,2,1,0].map(n => (
                  <div key={n} className="w-full border-b border-zinc-100 dark:border-white/5 flex items-end">
                    <span className="absolute left-0 -translate-y-2 text-xs text-zinc-400 bg-white pr-2">{n}</span>
                  </div>
                ))}
              </div>
              
              <div className="relative z-10 flex flex-col items-center mt-8">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="text-zinc-500" size={20} />
                </div>
                <p className="text-zinc-900 font-semibold text-sm">No data to display yet</p>
                <p className="text-zinc-500 text-xs mt-1 text-center max-w-xs">Start applying to opportunities to see your pipeline metrics here.</p>
              </div>
            </div>
            {/* Fake legend */}
            <div className="flex justify-center gap-6 mb-6">
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-xs font-medium text-zinc-600">New Leads</span></div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-xs font-medium text-zinc-600">High Match</span></div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-xs font-medium text-zinc-600">Applied</span></div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-xs font-medium text-zinc-600">Saved</span></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight mb-6">Activity Snapshot</h3>
            <div className="grid grid-cols-4 gap-4 divide-x divide-zinc-100">
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Activity size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-zinc-900">0</p>
                <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">Viewed</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <ExternalLink size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-zinc-900">0</p>
                <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">Clicked</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <BookmarkCheck size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-zinc-900">0</p>
                <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">Applied</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Bookmark size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-zinc-900">0</p>
                <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">Saved</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="glass-card flex flex-col h-[520px]">
            <div className="p-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">AI Curated Leads</h3>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
                <div key={op._id} className="block p-5 rounded-2xl glass hover:neo-glow dark:hover:bg-white/[0.05] transition-all duration-500 group relative cursor-pointer hover:-translate-y-1 hover:scale-[1.01]">
                  
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
          
          <div className="glass-card p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <Zap size={16} className="text-zinc-700" />
              </div>
              <h3 className="font-semibold text-zinc-900">Let AI do the heavy lifting</h3>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Inspect job URLs, get match scores and let Jarvis find the best opportunities for you.
            </p>
            <button className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
              Inspect Job URL <ExternalLink size={14} />
            </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
