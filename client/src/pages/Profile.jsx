import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Code2, Briefcase, GitBranch, Globe, DollarSign, PenTool, CheckCircle2, Zap, X } from 'lucide-react';
import { motion } from 'framer-motion';

const TagInput = ({ name, value, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        const newTags = [...new Set([...tags, input.trim()])];
        onChange({ target: { name, value: newTags.join(', ') } });
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange({ target: { name, value: newTags.join(', ') } });
  };

  return (
    <div className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-emerald-500 transition-all focus-within:bg-white dark:focus-within:bg-zinc-900/50">
      {tags.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm font-medium">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1 focus:outline-none">
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-zinc-900 dark:text-white px-1 py-1 text-base placeholder:text-zinc-500"
      />
    </div>
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    skills: '',
    experience: '',
    hourlyRate: '',
    preferredTechStack: '',
    portfolioLink: '',
    githubLink: '',
    rssFeeds: [],
    portfolioProjects: [],
    resumeText: '',
    notificationThreshold: 70
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`);
        setProfile({
          skills: data.skills?.join(', ') || '',
          experience: data.experience || '',
          hourlyRate: data.hourlyRate || '',
          preferredTechStack: data.preferredTechStack?.join(', ') || '',
          portfolioLink: data.portfolioLink || '',
          githubLink: data.githubLink || '',
          rssFeeds: data.rssFeeds || [],
          portfolioProjects: data.portfolioProjects || [],
          resumeText: data.resumeText || '',
          notificationThreshold: data.notificationThreshold || 70
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const updates = {
        ...profile,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
        preferredTechStack: profile.preferredTechStack.split(',').map(s => s.trim()).filter(Boolean),
        rssFeeds: profile.rssFeeds.map(s => s.trim()).filter(Boolean),
        portfolioProjects: profile.portfolioProjects.filter(p => p.title.trim() && p.description.trim())
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, updates);
      updateUser({ experience: updates.experience, skills: updates.skills });
      setMessage('Profile synchronized successfully.');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely display array of strings
  const renderPills = (commaString, colorClass) => {
    const items = commaString.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return <span className="text-zinc-500 italic text-sm">Not specified</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient tracking-tight">Agent Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">
            Your personal AI copilot uses this data to map your capabilities to high-intent opportunities.
          </p>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity & Links */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-full border border-white/10 flex items-center justify-center mb-4">
               <User size={40} className="text-zinc-700 dark:text-zinc-300" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user?.name}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{user?.email}</p>
            
            <div className="w-full h-px bg-zinc-200 dark:bg-white/5 my-4"></div>
            
            <div className="w-full space-y-3 text-left">
               <div className="flex items-center text-sm">
                 <Briefcase size={16} className="text-emerald-500 mr-3" />
                 <span className="text-zinc-600 dark:text-zinc-300 font-medium">Experience:</span>
                 <span className="ml-auto text-zinc-900 dark:text-white">{profile.experience || 'N/A'}</span>
               </div>
               <div className="flex items-center text-sm">
                 <DollarSign size={16} className="text-emerald-500 mr-3" />
                 <span className="text-zinc-600 dark:text-zinc-300 font-medium">Hourly Rate:</span>
                 <span className="ml-auto text-zinc-900 dark:text-white">{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'N/A'}</span>
               </div>
               <div className="flex items-center text-sm">
                 <GitBranch size={16} className="text-blue-500 mr-3" />
                 <span className="text-zinc-600 dark:text-zinc-300 font-medium">GitHub:</span>
                 <span className="ml-auto text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                   {profile.githubLink ? <a href={profile.githubLink} target="_blank" rel="noreferrer" className="hover:underline">Link</a> : 'N/A'}
                 </span>
               </div>
               <div className="flex items-center text-sm">
                 <Globe size={16} className="text-blue-500 mr-3" />
                 <span className="text-zinc-600 dark:text-zinc-300 font-medium">Portfolio:</span>
                 <span className="ml-auto text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                   {profile.portfolioLink ? <a href={profile.portfolioLink} target="_blank" rel="noreferrer" className="hover:underline">Link</a> : 'N/A'}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Tech Stack */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 md:p-8">
            <div className="space-y-8 h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Code2 size={20} className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Core Skills</h3>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                  {renderPills(profile.skills, "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20")}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Zap size={20} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Preferred Tech Stack</h3>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
                  {renderPills(profile.preferredTechStack, "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20")}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Globe size={20} className="text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Active Data Sources</h3>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 space-y-2">
                  {!profile.rssFeeds || profile.rssFeeds.filter(Boolean).length === 0 ? (
                    <span className="text-zinc-500 italic text-sm">No custom RSS feeds configured.</span>
                  ) : (
                    profile.rssFeeds.filter(Boolean).map((feed, i) => (
                      <div key={i} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate bg-zinc-200/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-white/10">
                        {feed}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Edit Form at the bottom - Premium Redesign */}
      <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-white/10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            System Configuration
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Fine-tune the parameters your AI copilot uses to find and qualify leads.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Technical Profile */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Technical Profile</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Define your core competencies and experience level.</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Core Skills</h4>
                  <p className="text-xs text-zinc-500 mt-1">Press enter or comma to add</p>
                </div>
                <div className="md:col-span-2">
                  <TagInput name="skills" value={profile.skills} onChange={handleChange} placeholder="React, Node.js, Python" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Preferred Tech Stack</h4>
                  <p className="text-xs text-zinc-500 mt-1">Press enter or comma to add</p>
                </div>
                <div className="md:col-span-2">
                  <TagInput name="preferredTechStack" value={profile.preferredTechStack} onChange={handleChange} placeholder="MERN, LAMP, Next.js" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Experience Level</h4>
                </div>
                <div className="md:col-span-2 relative">
                  <select name="experience" value={profile.experience} onChange={handleChange} className="w-full appearance-none bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900/50 cursor-pointer">
                    <option value="" className="dark:bg-zinc-800">Select Level...</option>
                    <option value="Junior" className="dark:bg-zinc-800">Junior (0-2 years)</option>
                    <option value="Mid-level" className="dark:bg-zinc-800">Mid-level (3-5 years)</option>
                    <option value="Senior" className="dark:bg-zinc-800">Senior (5+ years)</option>
                    <option value="Lead/Architect" className="dark:bg-zinc-800">Lead/Architect</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Resume Context</h4>
                  <p className="text-xs text-zinc-500 mt-1">Paste your resume text for deep semantic matching</p>
                </div>
                <div className="md:col-span-2">
                  <textarea name="resumeText" value={profile.resumeText} onChange={handleChange} rows={5} placeholder="I am a full-stack developer with 5 years of experience..." className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900/50 resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Professional Details</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your rate and public profiles.</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Hourly Rate</h4>
                  <p className="text-xs text-zinc-500 mt-1">In USD ($)</p>
                </div>
                <div className="md:col-span-2 relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="text-zinc-500">$</span>
                  </div>
                  <input type="number" name="hourlyRate" value={profile.hourlyRate} onChange={handleChange} placeholder="50" className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Portfolio URL</h4>
                </div>
                <div className="md:col-span-2">
                  <input type="url" name="portfolioLink" value={profile.portfolioLink} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">GitHub URL</h4>
                </div>
                <div className="md:col-span-2">
                  <input type="url" name="githubLink" value={profile.githubLink} onChange={handleChange} placeholder="https://github.com/..." className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2.5: Portfolio Projects */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Portfolio Projects</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Add specific projects for AI to recommend in proposals.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setProfile({...profile, portfolioProjects: [...profile.portfolioProjects, { title: '', description: '', link: '' }]})} 
                className="hidden md:flex items-center gap-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Project
              </button>
            </div>
            
            <div className="p-5 md:p-6 space-y-4">
              {profile.portfolioProjects.length === 0 && (
                <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-xl">
                  No portfolio projects added yet.
                </div>
              )}
              {profile.portfolioProjects.map((proj, index) => (
                <div key={index} className="flex flex-col gap-3 p-4 bg-zinc-50/50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10 relative">
                  <button 
                    type="button" 
                    onClick={() => {
                      const newProj = profile.portfolioProjects.filter((_, i) => i !== index);
                      setProfile({...profile, portfolioProjects: newProj});
                    }} 
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <input type="text" value={proj.title} onChange={(e) => {
                    const newProj = [...profile.portfolioProjects];
                    newProj[index].title = e.target.value;
                    setProfile({...profile, portfolioProjects: newProj});
                  }} placeholder="Project Title (e.g. Fashion Ecommerce)" className="w-full md:w-3/4 bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
                  <input type="url" value={proj.link} onChange={(e) => {
                    const newProj = [...profile.portfolioProjects];
                    newProj[index].link = e.target.value;
                    setProfile({...profile, portfolioProjects: newProj});
                  }} placeholder="Live Link or GitHub URL" className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  <textarea value={proj.description} onChange={(e) => {
                    const newProj = [...profile.portfolioProjects];
                    newProj[index].description = e.target.value;
                    setProfile({...profile, portfolioProjects: newProj});
                  }} placeholder="Brief description of the technologies used and what the project does..." rows={2} className="w-full bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"></textarea>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setProfile({...profile, portfolioProjects: [...profile.portfolioProjects, { title: '', description: '', link: '' }]})} 
                className="md:hidden mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl hover:bg-emerald-500/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Project
              </button>
            </div>
          </div>

          {/* Section 3: Data Sources */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Active Data Sources</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Provide custom RSS feeds for Jarvis to scrape hourly.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setProfile({...profile, rssFeeds: [...profile.rssFeeds, '']})} 
                className="hidden md:flex items-center gap-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Feed
              </button>
            </div>
            
            <div className="p-5 md:p-6 space-y-3">
              {profile.rssFeeds.length === 0 && (
                <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-xl">
                  No RSS feeds configured. Click "Add Feed" to monitor external sources.
                </div>
              )}
              {profile.rssFeeds.map((feed, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                  </div>
                  <input 
                    type="url" 
                    value={feed} 
                    onChange={(e) => {
                      const newFeeds = [...profile.rssFeeds];
                      newFeeds[index] = e.target.value;
                      setProfile({...profile, rssFeeds: newFeeds});
                    }} 
                    placeholder="https://..." 
                    className="flex-1 bg-transparent border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all focus:bg-white dark:focus:bg-zinc-900/50 font-mono text-sm" 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const newFeeds = profile.rssFeeds.filter((_, i) => i !== index);
                      setProfile({...profile, rssFeeds: newFeeds});
                    }} 
                    className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0 border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setProfile({...profile, rssFeeds: [...profile.rssFeeds, '']})} 
                className="md:hidden mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl hover:bg-emerald-500/20 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Custom Feed
              </button>
            </div>
          </div>

          {/* Section 4: AI Preferences */}
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm">
            <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/10">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Notification Threshold</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Set the minimum match score required for Jarvis to notify you.</p>
            </div>
            <div className="p-5 md:p-6 flex items-center gap-4">
               <span className="text-sm font-bold text-zinc-900 dark:text-white w-12">{profile.notificationThreshold}%</span>
               <input type="range" name="notificationThreshold" min="0" max="100" value={profile.notificationThreshold} onChange={handleChange} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-emerald-500" />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col md:flex-row justify-end items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Jarvis immediately applies these settings.</span>
            <button type="submit" disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-2">
              {loading ? (
                <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Saving...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
