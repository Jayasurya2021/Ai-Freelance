import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2, Sparkles } from 'lucide-react';

const ATSBuilder = ({ user, activeProfileMode, currentResumeText, onResumeExtracted }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [jobDescription, setJobDescription] = useState('');
  const [checkingAts, setCheckingAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  
  const [generating, setGenerating] = useState(false);
  const [tailoredResume, setTailoredResume] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('resumeFile', file);
    formData.append('userId', user.id);
    formData.append('mode', activeProfileMode);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Resume uploaded and text extracted successfully!');
      if (onResumeExtracted) onResumeExtracted(data.extractedText);
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleCheckAts = async () => {
    if (!jobDescription) return;
    setCheckingAts(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/check-ats`, {
        userId: user.id,
        mode: activeProfileMode,
        jobDescription
      });
      setAtsResult(data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to check ATS score.');
    } finally {
      setCheckingAts(false);
    }
  };

  const handleGenerateTailored = async () => {
    if (!jobDescription) return;
    setGenerating(true);
    setTailoredResume('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/generate-tailored`, {
        userId: user.id,
        mode: activeProfileMode,
        jobDescription
      });
      setTailoredResume(data.tailoredResume);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to generate resume.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Resume Upload Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 md:p-6">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h4 className="text-sm font-bold text-zinc-900">Resume / CV Document</h4>
                  <p className="text-xs text-zinc-500 mt-1">Upload a PDF or DOCX file to extract your professional history.</p>
              </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative border-2 border-dashed border-zinc-200 rounded-xl p-6 hover:bg-zinc-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud size={24} className="text-zinc-400 mb-2" />
                  <p className="text-sm font-medium text-zinc-600 text-center">
                      {file ? file.name : "Drag & drop or click to upload PDF/DOCX"}
                  </p>
              </div>
              <button 
                  type="button" 
                  onClick={handleUpload} 
                  disabled={!file || uploading} 
                  className="w-full md:w-auto bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-zinc-800 transition"
              >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Upload & Parse'}
              </button>
          </div>

          {message && (
              <p className={`mt-3 text-sm font-medium ${message.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {message}
              </p>
          )}

          {currentResumeText && (
              <div className="mt-4">
                  <h5 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Current Extracted Text (Base)</h5>
                  <textarea 
                    value={currentResumeText} 
                    readOnly 
                    rows={4} 
                    className="w-full p-3 border rounded-xl bg-zinc-50/50 border-zinc-200 text-xs text-zinc-500 outline-none resize-none"
                  ></textarea>
              </div>
          )}
      </div>

      {/* 2. ATS Checker & Generator */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 md:p-6 border-l-4 border-l-emerald-500">
          <h4 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
             <Sparkles size={18} className="text-emerald-500" /> AI Resume Tailoring & ATS Checker
          </h4>
          <p className="text-xs text-zinc-500 mb-4">Paste a target Job Description to see your ATS score and generate a custom-tailored resume.</p>
          
          <textarea 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            rows={5} 
            placeholder="Paste the target Job Description here..." 
            className="w-full p-4 border rounded-xl bg-zinc-50/50 border-zinc-200 text-sm outline-none focus:border-emerald-500 resize-none mb-4"
          ></textarea>

          <div className="flex flex-wrap gap-3 mb-6">
              <button 
                  type="button"
                  onClick={handleCheckAts} 
                  disabled={!jobDescription || checkingAts} 
                  className="bg-blue-50 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-blue-100 transition flex items-center gap-2"
              >
                  {checkingAts ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Check ATS Match
              </button>

              <button 
                  type="button"
                  onClick={handleGenerateTailored} 
                  disabled={!jobDescription || generating} 
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-emerald-100 transition flex items-center gap-2"
              >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Generate Tailored Resume
              </button>
          </div>

          {/* ATS Results View */}
          {atsResult && (
              <div className="mb-6 p-5 border border-zinc-200 rounded-xl bg-zinc-50">
                  <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white ${atsResult.score >= 80 ? 'bg-emerald-500' : atsResult.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}>
                          {atsResult.score}%
                      </div>
                      <div>
                          <h5 className="font-bold text-zinc-900">ATS Match Score</h5>
                          <p className="text-xs text-zinc-500">{atsResult.score >= 80 ? 'Excellent Match!' : 'Needs improvement based on keywords.'}</p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <h6 className="text-xs font-bold text-emerald-700 uppercase mb-2">Matching Keywords</h6>
                          <div className="flex flex-wrap gap-1">
                              {atsResult.matchingKeywords?.map(kw => <span key={kw} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">{kw}</span>)}
                          </div>
                      </div>
                      <div>
                          <h6 className="text-xs font-bold text-red-700 uppercase mb-2">Missing Keywords</h6>
                          <div className="flex flex-wrap gap-1">
                              {atsResult.missingKeywords?.map(kw => <span key={kw} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">{kw}</span>)}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Tailored Resume View */}
          {tailoredResume && (
              <div className="mt-4 p-5 border border-zinc-200 rounded-xl bg-white shadow-inner relative">
                  <h5 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
                     <CheckCircle2 size={16} className="text-emerald-500" /> Generated Tailored Resume
                  </h5>
                  <button 
                      onClick={() => navigator.clipboard.writeText(tailoredResume)} 
                      className="absolute top-4 right-4 text-xs font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg transition"
                  >
                      Copy Text
                  </button>
                  <div className="prose prose-sm max-w-none text-zinc-600 whitespace-pre-wrap">
                      {tailoredResume}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default ATSBuilder;
