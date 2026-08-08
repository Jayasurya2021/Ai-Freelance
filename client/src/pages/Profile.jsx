import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProfileMode } from '../context/ProfileContext';
import { CheckCircle2, X, Settings, Briefcase, UploadCloud, FileText, Trash2, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    resumeText: '',
    resumeFileUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Modal states
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState('');

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
          preferredLocations: data.preferredLocations || [],
          resumeText: data.resumeText || '',
          resumeFileUrl: data.resumeFileUrl || ''
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

  const handleRemoveResume = () => {
    setProfileData({ ...profileData, resumeText: '', resumeFileUrl: '' });
    setHasChanges(true);
  };

  const handleModalFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedResumeFile(file);
      if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(URL.createObjectURL(file));
    }
  };

  const closeResumeModal = () => {
    setIsResumeModalOpen(false);
    setSelectedResumeFile(null);
    if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
    setResumePreviewUrl('');
  };

  const handleFileUpload = async () => {
    if (!selectedResumeFile) return;

    setIsUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('resumeFile', selectedResumeFile);
    formData.append('userId', user?.id || '');
    formData.append('mode', profileMode);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (data.extractedData) {
         setProfileData(prev => ({
             ...prev,
             skills: data.extractedData.skills?.length > 0 ? [...new Set([...prev.skills, ...data.extractedData.skills])] : prev.skills,
             experience: data.extractedData.experience || prev.experience,
             noticePeriod: data.extractedData.noticePeriod || prev.noticePeriod,
             expectedSalary: data.extractedData.expectedSalary || prev.expectedSalary,
             preferredLocations: data.extractedData.preferredLocations?.length > 0 ? [...new Set([...prev.preferredLocations, ...data.extractedData.preferredLocations])] : prev.preferredLocations,
             resumeText: data.resumeText || prev.resumeText,
             resumeFileUrl: data.resumeFileUrl || prev.resumeFileUrl
         }));
         setHasChanges(true);
         setMessage('Resume parsed! Form auto-filled successfully.');
      } else {
         setMessage('Resume uploaded successfully.');
      }
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('File upload error', err);
      setMessage('Failed to upload and parse resume.');
    } finally {
      setIsUploading(false);
      closeResumeModal();
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
            {/* Resume Status / Upload Section */}
            {profileData.resumeText ? (
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Reference Resume Active</h3>
                      <p className="text-sm text-zinc-500">Your resume is parsed and ready to generate proposals.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setIsPreviewModalOpen(true)} className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition flex items-center gap-2">
                      <Eye size={16} /> Preview
                    </button>
                    <button type="button" onClick={() => setIsResumeModalOpen(true)} className="px-4 py-2 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl transition flex items-center gap-2 shadow-sm">
                      <RefreshCw size={16} /> Replace
                    </button>
                    <button type="button" onClick={handleRemoveResume} className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center gap-2">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <UploadCloud className="text-indigo-500 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Upload your reference resume</h2>
                
                <div className="flex items-center gap-4 mb-6">
                  <button 
                    type="button"
                    onClick={() => setIsResumeModalOpen(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
                  >
                    <UploadCloud size={18} />
                    Upload File
                  </button>
                  <button type="button" className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-50 transition shadow-sm">
                    <FileText size={18} />
                    Quick Draft
                  </button>
                </div>
                
                <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
                  To get started, please upload your core resume. We'll parse it and you can use it to generate tailored versions for any job application.
                </p>
              </div>
            )}
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

        <div className="pt-4 flex justify-end sticky bottom-6 z-10 gap-4">
          <button type="button" onClick={handleSubmit} disabled={loading || !hasChanges} className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${hasChanges ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'}`}>
            {loading ? 'Saving...' : 'Save All Configurations'}
          </button>
        </div>
      </div>

      {/* Resume Upload & Preview Modal */}
      <AnimatePresence>
        {isResumeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  Preview & Upload Resume
                </h2>
                <button onClick={closeResumeModal} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-6">
                {!resumePreviewUrl ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 bg-white dark:bg-zinc-900 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                    <UploadCloud size={48} className="text-indigo-500 mb-4" />
                    <span className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Click to select resume</span>
                    <span className="text-sm text-zinc-500">PDF, DOC, DOCX up to 10MB</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleModalFileSelect} />
                  </label>
                ) : (
                  <div className="flex-1 min-h-[500px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white">
                    {selectedResumeFile?.type === 'application/pdf' ? (
                      <object data={resumePreviewUrl} type="application/pdf" width="100%" height="100%" className="w-full h-full min-h-[500px]">
                        <p className="p-4 text-center text-zinc-500">PDF preview not available. <a href={resumePreviewUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Download here</a>.</p>
                      </object>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-6 text-center">
                        <FileText size={64} className="text-indigo-500 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{selectedResumeFile?.name}</h3>
                        <p className="text-zinc-500">Preview not available for this file type, but it is ready to upload.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
                {selectedResumeFile && (
                  <label className="cursor-pointer text-sm font-bold text-indigo-600 hover:text-indigo-700 transition">
                    Choose different file
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleModalFileSelect} />
                  </label>
                )}
                {!selectedResumeFile && <div></div>}
                
                <div className="flex items-center gap-3">
                  <button onClick={closeResumeModal} className="px-5 py-2.5 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition">
                    Cancel
                  </button>
                  <button 
                    onClick={handleFileUpload} 
                    disabled={!selectedResumeFile || isUploading}
                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-md ${!selectedResumeFile || isUploading ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                  >
                    {isUploading ? 'Uploading & Parsing...' : 'Upload & Auto-Fill'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resume Text Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Eye size={20} className="text-indigo-600" />
                  Parsed Resume Preview
                </h2>
                <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 flex flex-col">
                <p className="text-sm text-zinc-500 mb-4 shrink-0">
                  This is the original document you uploaded.
                </p>
                <div className="w-full flex-1 border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 min-h-[500px]">
                  {profileData.resumeFileUrl ? (
                    <object data={`${import.meta.env.VITE_API_URL}${profileData.resumeFileUrl}`} type="application/pdf" className="w-full h-full min-h-[500px]">
                      <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center h-full">
                        <FileText size={48} className="mb-4 text-zinc-300" />
                        <p>PDF preview not available in this browser.</p>
                        <a href={`${import.meta.env.VITE_API_URL}${profileData.resumeFileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline mt-2">Download Resume</a>
                      </div>
                    </object>
                  ) : (
                    <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center h-full">
                      <p>No document file available for preview.</p>
                      <p className="text-xs mt-2 text-zinc-400">(Your resume was uploaded before document storage was enabled)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3">
                <button onClick={() => setIsPreviewModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
