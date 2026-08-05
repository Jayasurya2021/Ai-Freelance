import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Code2, Briefcase, Globe, DollarSign, CheckCircle2, Zap, X, Settings, FileText, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import AISettings from './AISettings';
import SourceManager from './SourceManager';

const TagInput = ({ name, value, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const tags = Array.isArray(value) ? value : (value ? value.split(',').map(t => t.trim()).filter(Boolean) : []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        const newTags = [...new Set([...tags, input.trim()])];
        onChange({ target: { name, value: newTags } });
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange({ target: { name, value: newTags } });
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
  const [activeTab, setActiveTab] = useState('global'); // 'global', 'freelance', 'job'
  
  const [globalSettings, setGlobalSettings] = useState({
    notificationThreshold: 70
  });

  const [freelanceProfile, setFreelanceProfile] = useState({
    skills: [], experience: '', hourlyRate: '', preferredTechStack: [], portfolioLink: '', githubLink: '', portfolioProjects: [], resumeText: ''
  });

  const [jobProfile, setJobProfile] = useState({
    skills: [], experience: '', expectedSalary: '', preferredTechStack: [], githubLink: '', resumeText: '', remotePreference: true, relocation: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`);
        setGlobalSettings({
          notificationThreshold: data.notificationThreshold || 70
        });
        if (data.freelanceProfile) setFreelanceProfile(data.freelanceProfile);
        if (data.jobProfile) setJobProfile(data.jobProfile);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleGlobalChange = (e) => setGlobalSettings({ ...globalSettings, [e.target.name]: e.target.value });
  const handleFreelanceChange = (e) => setFreelanceProfile({ ...freelanceProfile, [e.target.name]: e.target.value });
  const handleJobChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setJobProfile({ ...jobProfile, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const updates = {
        notificationThreshold: globalSettings.notificationThreshold,
        freelanceProfile,
        jobProfile
      };
      
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, updates);
      updateUser(data.profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Agent Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">
            Configure your Global, Freelance, and Job profiles for hyper-personalized AI recommendations.
          </p>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">{message}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-6">
        <button 
            type="button"
            onClick={() => setActiveTab('global')}
            className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'global' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <Settings size={16} className="inline mr-2"/>
          Global Settings
        </button>
        <button 
            type="button"
            onClick={() => setActiveTab('freelance')}
            className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'freelance' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <Briefcase size={16} className="inline mr-2"/>
          Freelance Profile
        </button>
        <button 
            type="button"
            onClick={() => setActiveTab('job')}
            className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'job' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <FileText size={16} className="inline mr-2"/>
          Job Profile
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- GLOBAL SETTINGS TAB --- */}
        {activeTab === 'global' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">User Account</h3>
                  <p className="text-sm text-zinc-500 mt-1">Your basic identity shared across all profiles.</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                        <input type="text" value={user?.name || ''} readOnly className="w-full p-3 border rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 opacity-70" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                        <input type="text" value={user?.email || ''} readOnly className="w-full p-3 border rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 opacity-70" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">AI Notification Threshold</h3>
                  <p className="text-sm text-zinc-500 mt-1">Set the minimum match score required for Jarvis to notify you.</p>
                </div>
                <div className="p-5 md:p-6 flex items-center gap-4">
                   <span className="text-sm font-bold text-zinc-900 w-12">{globalSettings.notificationThreshold}%</span>
                   <input type="range" name="notificationThreshold" min="0" max="100" value={globalSettings.notificationThreshold} onChange={handleGlobalChange} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-zinc-200">
              <AISettings />
              <SourceManager />
            </div>
          </div>
        )}

        {/* --- FREELANCE PROFILE TAB --- */}
        {activeTab === 'freelance' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">Freelance Core details</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Freelance Skills</h4></div>
                    <div className="md:col-span-2"><TagInput name="skills" value={freelanceProfile.skills} onChange={handleFreelanceChange} placeholder="React, Node, Figma" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Experience Level</h4></div>
                    <div className="md:col-span-2">
                        <select name="experience" value={freelanceProfile.experience} onChange={handleFreelanceChange} className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 text-zinc-900 outline-none focus:border-emerald-500 cursor-pointer">
                            <option value="">Select Level...</option>
                            <option value="Junior">Junior (0-2 years)</option>
                            <option value="Mid-level">Mid-level (3-5 years)</option>
                            <option value="Senior">Senior (5+ years)</option>
                        </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Hourly Rate ($)</h4></div>
                    <div className="md:col-span-2">
                        <input type="number" name="hourlyRate" value={freelanceProfile.hourlyRate} onChange={handleFreelanceChange} placeholder="50" className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-zinc-900">Freelance Portfolio</h3>
                  <button type="button" onClick={() => setFreelanceProfile({...freelanceProfile, portfolioProjects: [...freelanceProfile.portfolioProjects, { title: '', link: '', description: '' }]})} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition">Add Project</button>
                </div>
                <div className="p-5 space-y-4">
                  {freelanceProfile.portfolioProjects.length === 0 && <p className="text-zinc-500 text-sm">No projects added. AI uses these to write proposals.</p>}
                  {freelanceProfile.portfolioProjects.map((proj, i) => (
                    <div key={i} className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-xl relative space-y-3">
                        <button type="button" onClick={() => {
                            const newP = [...freelanceProfile.portfolioProjects];
                            newP.splice(i, 1);
                            setFreelanceProfile({...freelanceProfile, portfolioProjects: newP});
                        }} className="absolute top-4 right-4 text-red-500"><X size={16}/></button>
                        <input type="text" placeholder="Project Title" value={proj.title} onChange={(e) => { const newP = [...freelanceProfile.portfolioProjects]; newP[i].title = e.target.value; setFreelanceProfile({...freelanceProfile, portfolioProjects: newP}); }} className="w-full md:w-2/3 p-2 border border-zinc-200 rounded-lg text-sm font-bold"/>
                        <input type="url" placeholder="Live Link" value={proj.link} onChange={(e) => { const newP = [...freelanceProfile.portfolioProjects]; newP[i].link = e.target.value; setFreelanceProfile({...freelanceProfile, portfolioProjects: newP}); }} className="w-full p-2 border border-zinc-200 rounded-lg text-sm"/>
                        <textarea placeholder="Description" value={proj.description} onChange={(e) => { const newP = [...freelanceProfile.portfolioProjects]; newP[i].description = e.target.value; setFreelanceProfile({...freelanceProfile, portfolioProjects: newP}); }} className="w-full p-2 border border-zinc-200 rounded-lg text-sm h-20 resize-none"></textarea>
                    </div>
                  ))}
                </div>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 md:p-6">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Freelance Proposal Context</h4>
                <textarea name="resumeText" value={freelanceProfile.resumeText} onChange={handleFreelanceChange} rows={5} placeholder="Paste your general pitch, background, and what makes you a great freelancer..." className="w-full p-4 border rounded-xl bg-zinc-50/50 border-zinc-200 text-sm outline-none focus:border-emerald-500 resize-none"></textarea>
            </div>
          </div>
        )}

        {/* --- JOB PROFILE TAB --- */}
        {activeTab === 'job' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">Job Search Details</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Target Skills</h4></div>
                    <div className="md:col-span-2"><TagInput name="skills" value={jobProfile.skills} onChange={handleJobChange} placeholder="React, System Design, Leadership" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Experience Level</h4></div>
                    <div className="md:col-span-2">
                        <select name="experience" value={jobProfile.experience} onChange={handleJobChange} className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 text-zinc-900 outline-none focus:border-emerald-500 cursor-pointer">
                            <option value="">Select Level...</option>
                            <option value="Junior">Junior</option>
                            <option value="Mid-level">Mid-level</option>
                            <option value="Senior">Senior</option>
                            <option value="Staff/Principal">Staff/Principal</option>
                        </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Expected Salary ($)</h4></div>
                    <div className="md:col-span-2">
                        <input type="number" name="expectedSalary" value={jobProfile.expectedSalary} onChange={handleJobChange} placeholder="120000" className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Work Preferences</h4></div>
                    <div className="md:col-span-2 flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="remotePreference" checked={jobProfile.remotePreference} onChange={handleJobChange} className="w-4 h-4 text-emerald-600 rounded" />
                            <span className="text-sm font-medium">Remote Preferred</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="relocation" checked={jobProfile.relocation} onChange={handleJobChange} className="w-4 h-4 text-emerald-600 rounded" />
                            <span className="text-sm font-medium">Open to Relocation</span>
                        </label>
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 md:p-6">
                <h4 className="text-sm font-bold text-zinc-900 mb-2">Full Resume / CV Text</h4>
                <p className="text-xs text-zinc-500 mb-4">Paste your full resume here. The AI will extract it to answer application questions.</p>
                <textarea name="resumeText" value={jobProfile.resumeText} onChange={handleJobChange} rows={10} placeholder="Experience: Software Engineer at Tech Corp..." className="w-full p-4 border rounded-xl bg-zinc-50/50 border-zinc-200 text-sm outline-none focus:border-emerald-500 resize-none"></textarea>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end sticky bottom-6 z-10">
          <button type="submit" disabled={loading} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2">
            {loading ? 'Saving...' : 'Save All Configurations'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
