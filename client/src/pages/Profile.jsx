import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProfileMode } from '../context/ProfileContext';
import { CheckCircle2, X, Settings, Briefcase } from 'lucide-react';
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
  const { profileMode } = useProfileMode();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'settings'
  
  const [profileData, setProfileData] = useState({
    notificationThreshold: 70,
    skills: [],
    experience: '',
    hourlyRate: '',
    preferredTechnologies: [],
    portfolioProjects: [],
    expectedSalary: '',
    noticePeriod: '',
    preferredLocations: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`);
        setProfileData({
          notificationThreshold: data.notificationThreshold || 70,
          skills: data.skills || [],
          experience: data.experience || '',
          hourlyRate: data.hourlyRate || '',
          preferredTechnologies: data.preferredTechnologies || [],
          portfolioProjects: data.portfolioProjects || [],
          expectedSalary: data.expectedSalary || '',
          noticePeriod: data.noticePeriod || '',
          preferredLocations: data.preferredLocations || []
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, profileData);
      updateUser(data.profile);
      setMessage('Profile updated successfully!');
      setHasChanges(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Agent Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base">
            Configure your {profileMode === 'freelance' ? 'Freelance' : 'Job'} profile for AI-curated opportunities.
          </p>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">{message}</p>
        </motion.div>
      )}

      <div className="flex border-b border-zinc-200 gap-6">
        <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'profile' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <Briefcase size={16} className="inline mr-2"/>
          {profileMode === 'freelance' ? 'Freelance Profile' : 'Job Profile'}
        </button>
        <button 
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'settings' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <Settings size={16} className="inline mr-2"/>
          Global Settings
        </button>
      </div>

      <div className="space-y-8">
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">
                    {profileMode === 'freelance' ? 'Freelance Core Details' : 'Job Core Details'}
                  </h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Skills</h4></div>
                    <div className="md:col-span-2"><TagInput name="skills" value={profileData.skills} onChange={handleChange} placeholder="React, Node, Figma" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Preferred Technologies</h4></div>
                    <div className="md:col-span-2"><TagInput name="preferredTechnologies" value={profileData.preferredTechnologies} onChange={handleChange} placeholder="AWS, MongoDB" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                    <div><h4 className="text-sm font-bold text-zinc-900">Experience Level</h4></div>
                    <div className="md:col-span-2">
                        <select name="experience" value={profileData.experience} onChange={handleChange} className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 text-zinc-900 outline-none focus:border-emerald-500 cursor-pointer">
                            <option value="">Select Level...</option>
                            <option value="Fresher">Fresher (0 years)</option>
                            <option value="Junior">Junior (0-2 years)</option>
                            <option value="Mid-level">Mid-level (3-5 years)</option>
                            <option value="Senior">Senior (5+ years)</option>
                        </select>
                    </div>
                  </div>
                  {profileMode === 'freelance' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                      <div><h4 className="text-sm font-bold text-zinc-900">Hourly Rate ($)</h4></div>
                      <div className="md:col-span-2">
                          <input type="number" name="hourlyRate" value={profileData.hourlyRate} onChange={handleChange} placeholder="50" className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                        <div><h4 className="text-sm font-bold text-zinc-900">Expected Salary ($)</h4></div>
                        <div className="md:col-span-2">
                            <input type="number" name="expectedSalary" value={profileData.expectedSalary} onChange={handleChange} placeholder="120000" className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                        <div><h4 className="text-sm font-bold text-zinc-900">Notice Period</h4></div>
                        <div className="md:col-span-2">
                            <input type="text" name="noticePeriod" value={profileData.noticePeriod} onChange={handleChange} placeholder="e.g. 2 weeks, Immediate" className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 md:p-6">
                        <div><h4 className="text-sm font-bold text-zinc-900">Preferred Locations</h4></div>
                        <div className="md:col-span-2"><TagInput name="preferredLocations" value={profileData.preferredLocations} onChange={handleChange} placeholder="Remote, New York, SF" /></div>
                      </div>
                    </>
                  )}
                </div>
            </div>

            {profileMode === 'freelance' && (
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                  <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-zinc-900">Freelance Portfolio</h3>
                    <button type="button" onClick={() => { setProfileData({...profileData, portfolioProjects: [...profileData.portfolioProjects, { title: '', link: '', description: '' }]}); setHasChanges(true); }} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition">Add Project</button>
                  </div>
                  <div className="p-5 space-y-4">
                    {(!profileData.portfolioProjects || profileData.portfolioProjects.length === 0) && <p className="text-zinc-500 text-sm">No projects added. AI uses these to write proposals.</p>}
                    {(profileData.portfolioProjects || []).map((proj, i) => (
                      <div key={i} className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-xl relative space-y-3">
                          <button type="button" onClick={() => {
                              const newP = [...profileData.portfolioProjects];
                              newP.splice(i, 1);
                              setProfileData({...profileData, portfolioProjects: newP});
                              setHasChanges(true);
                          }} className="absolute top-4 right-4 text-red-500"><X size={16}/></button>
                          <input type="text" placeholder="Project Title" value={proj.title} onChange={(e) => { const newP = [...profileData.portfolioProjects]; newP[i].title = e.target.value; setProfileData({...profileData, portfolioProjects: newP}); setHasChanges(true); }} className="w-full md:w-2/3 p-2 border border-zinc-200 rounded-lg text-sm font-bold"/>
                          <input type="url" placeholder="Live Link" value={proj.link} onChange={(e) => { const newP = [...profileData.portfolioProjects]; newP[i].link = e.target.value; setProfileData({...profileData, portfolioProjects: newP}); setHasChanges(true); }} className="w-full p-2 border border-zinc-200 rounded-lg text-sm"/>
                          <textarea placeholder="Description" value={proj.description} onChange={(e) => { const newP = [...profileData.portfolioProjects]; newP[i].description = e.target.value; setProfileData({...profileData, portfolioProjects: newP}); setHasChanges(true); }} className="w-full p-2 border border-zinc-200 rounded-lg text-sm h-20 resize-none"></textarea>
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-5 md:p-6 bg-zinc-50/50 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">User Account</h3>
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
                   <span className="text-sm font-bold text-zinc-900 w-12">{profileData.notificationThreshold}%</span>
                   <input type="range" name="notificationThreshold" min="0" max="100" value={profileData.notificationThreshold} onChange={handleChange} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-zinc-200">
              <AISettings />
              <SourceManager />
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end sticky bottom-6 z-10">
          <button type="button" onClick={handleSubmit} disabled={loading || !hasChanges} className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${hasChanges ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'}`}>
            {loading ? 'Saving...' : 'Save All Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
