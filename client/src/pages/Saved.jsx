import React from 'react';
import { Bookmark, Send, Users, MoreHorizontal, ExternalLink } from 'lucide-react';

const KanbanColumn = ({ title, icon: Icon, count, color, children }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  
  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm">
      <div className="p-4 md:p-5 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon size={16} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-md">{count}</span>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[500px] bg-zinc-50/30 dark:bg-transparent">
        {children}
      </div>
    </div>
  );
};

const JobCard = ({ title, company, budget, date }) => (
  <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/40 shadow-sm hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 cursor-grab group">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-500 transition-colors">{title}</h4>
      <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
        <MoreHorizontal size={16} />
      </button>
    </div>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{company}</p>
    
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded">{budget}</span>
      <span className="text-[10px] text-zinc-400 font-medium">{date}</span>
    </div>
  </div>
);

const Saved = () => {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 tracking-tight">Saved & Applied</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">Track your application pipeline and manage client communications.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm active:scale-95">
          Add External Job
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <KanbanColumn title="Saved" count={2} icon={Bookmark} color="blue">
          <JobCard 
            title="Senior React Native Developer" 
            company="Y Combinator Startup" 
            budget="$60-80/hr" 
            date="Added 2d ago"
          />
          <JobCard 
            title="Fullstack Web3 Engineer" 
            company="DeFi Protocol" 
            budget="$10,000" 
            date="Added 5d ago"
          />
        </KanbanColumn>
        
        <KanbanColumn title="Applied" count={1} icon={Send} color="purple">
          <JobCard 
            title="Frontend Architect for AI App" 
            company="OpenAI Wrapper" 
            budget="$5,000" 
            date="Applied yesterday"
          />
        </KanbanColumn>
        
        <KanbanColumn title="Interviewing" count={0} icon={Users} color="emerald">
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
              <Users size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">No active interviews</p>
            <p className="text-xs text-zinc-500 mt-1">Move a job here once you schedule a call.</p>
          </div>
        </KanbanColumn>
      </div>
    </div>
  );
};

export default Saved;
