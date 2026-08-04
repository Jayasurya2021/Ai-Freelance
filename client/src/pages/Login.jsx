import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="absolute w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 opacity-50"></div>
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl shadow-xl p-8 md:p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center mb-4 shadow-md">
               <Search className="text-white dark:text-zinc-900" size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Sign in to your AI Copilot</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400"
                placeholder="hello@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl px-4 py-3 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-70 mt-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#121212] text-zinc-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don't have an account? <Link to="/register" className="text-zinc-900 dark:text-white font-semibold hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
