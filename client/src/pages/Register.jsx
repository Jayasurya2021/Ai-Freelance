import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] relative overflow-hidden p-4">

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 md:p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-4">
               <Search className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 font-serif-heading">Create an account</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Start automating your freelance pipeline</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                placeholder="Tony Stark"
                value={name} onChange={e => setName(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                placeholder="hello@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl px-4 py-3 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-70 mt-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-zinc-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign Up Failed')}
                theme="filled_black"
                shape="rectangular"
                width="100%"
                text="signup_with"
              />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account? <Link to="/login" className="text-zinc-900 dark:text-white font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
