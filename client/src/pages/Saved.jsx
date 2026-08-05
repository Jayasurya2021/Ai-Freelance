import React from 'react';
import { Bookmark, Send, Users, MoreHorizontal, ExternalLink, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const KanbanColumn = ({ title, icon: Icon, count, color, children }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  
  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 md:p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon size={16} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs font-bold bg-white border border-zinc-200 text-zinc-600 px-2.5 py-1 rounded-md">{count}</span>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[500px] bg-zinc-50/30">
        {children}
      </div>
    </div>
  );
};

const JobCard = ({ title, company, budget, date, url }) => (
  <div className="p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all duration-300 cursor-grab group shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-500 transition-colors">{title}</h4>
      <a href={url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-500 transition-colors">
        <ExternalLink size={14} />
      </a>
    </div>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{company}</p>
    
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded">{budget || 'N/A'}</span>
      <span className="text-[10px] text-zinc-400 font-medium">{date}</span>
    </div>
  </div>
);

const fetchKanbanData = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/opportunities/kanban`);
  return data;
};

const Saved = () => {
  const { data = { saved: [], applied: [], interviewing: [] }, isLoading, isError } = useQuery({
    queryKey: ['kanban'],
    queryFn: fetchKanbanData
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Saved & Applied</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">Track your application pipeline and manage client communications.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm active:scale-95">
          Add External Job
          <ExternalLink size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-zinc-500 font-medium">Loading pipeline...</p>
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center text-red-500 font-medium">
          Failed to load kanban data.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <KanbanColumn title="Saved" count={data.saved.length} icon={Bookmark} color="blue">
            {data.saved.length > 0 ? data.saved.map(op => (
              <JobCard 
                key={op._id}
                title={op.title}
                company={op.company || op.sourceName}
                budget={op.budget}
                date={formatDate(op.createdAt)}
                url={op.originalUrl}
              />
            )) : (
              <p className="text-center text-zinc-500 text-sm pt-8">No saved jobs.</p>
            )}
          </KanbanColumn>
          
          <KanbanColumn title="Applied" count={data.applied.length} icon={Send} color="purple">
            {data.applied.length > 0 ? data.applied.map(op => (
              <JobCard 
                key={op._id}
                title={op.title}
                company={op.company || op.sourceName}
                budget={op.budget}
                date={formatDate(op.createdAt)}
                url={op.originalUrl}
              />
            )) : (
              <p className="text-center text-zinc-500 text-sm pt-8">No applications sent.</p>
            )}
          </KanbanColumn>
          
          <KanbanColumn title="Interviewing" count={data.interviewing.length} icon={Users} color="emerald">
            {data.interviewing.length > 0 ? data.interviewing.map(op => (
              <JobCard 
                key={op._id}
                title={op.title}
                company={op.company || op.sourceName}
                budget={op.budget}
                date={formatDate(op.createdAt)}
                url={op.originalUrl}
              />
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-xl">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                  <Users size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">No active interviews</p>
                <p className="text-xs text-zinc-500 mt-1">Move a job here once you schedule a call.</p>
              </div>
            )}
          </KanbanColumn>
        </div>
      )}
    </div>
  );
};

export default Saved;
