import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const handleToggle = (toLogin) => {
    setError('');
    setIsLogin(toLogin);
    navigate(toLogin ? '/login' : '/register', { replace: true });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      await register(regName, regEmail, regPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true); setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Auth failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#050505] p-4 md:p-8 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 w-full h-full pointer-events-none flex justify-center items-center overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] -translate-x-1/2 opacity-70"></motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/2 opacity-70"></motion.div>
      </div>

      <div className="w-full max-w-[1000px] h-[700px] relative rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5">
        
        {/* --- LEFT PANEL: SIGN IN FORM --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center p-8 md:p-12 transition-opacity duration-300 ${!isLogin ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'}`}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
               <Search className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">LeadFlow AI</h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLogin && (
              <motion.div key="login-form" variants={containerVariants} initial="hidden" animate="show" exit="hidden">
                <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Welcome back</motion.h2>
                <motion.p variants={itemVariants} className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Sign in to access your freelance pipeline.</motion.p>
                
                {error && <motion.div variants={itemVariants} className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">{error}</motion.div>}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required 
                      className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white" placeholder="hello@example.com" />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
                      <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Forgot?</a>
                    </div>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required 
                      className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white" placeholder="••••••••" />
                  </motion.div>
                  <motion.button variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold rounded-xl px-4 py-3.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                    {isLoading ? 'Processing...' : 'Sign In'}
                  </motion.button>
                </form>

                <motion.div variants={itemVariants} className="mt-8">
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-white/10"></div></div>
                    <span className="relative bg-white dark:bg-[#121212] px-3 text-xs uppercase font-semibold text-zinc-400">Or continue with</span>
                  </div>
                  <div className="flex justify-center w-full">
                     <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} theme="filled_black" shape="rectangular" width="300" text="signin_with" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="mt-8 text-center text-sm text-zinc-500 md:hidden relative z-10">
            Don't have an account? <button onClick={() => handleToggle(false)} className="text-zinc-900 dark:text-white font-semibold underline">Register</button>
          </p>
        </div>


        {/* --- RIGHT PANEL: SIGN UP FORM --- */}
        <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full hidden md:flex flex-col justify-center p-8 md:p-12 transition-opacity duration-300 ${isLogin ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'}`}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
               <Zap className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">LeadFlow AI</h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div key="reg-form" variants={containerVariants} initial="hidden" animate="show" exit="hidden">
                <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Create Account</motion.h2>
                <motion.p variants={itemVariants} className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Start automating your freelance pipeline.</motion.p>
                
                {error && <motion.div variants={itemVariants} className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">{error}</motion.div>}

                <form onSubmit={handleRegSubmit} className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required 
                      className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="Tony Stark" />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required 
                      className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="hello@example.com" />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required 
                      className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all dark:text-white" placeholder="••••••••" />
                  </motion.div>
                  <motion.button variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white font-semibold rounded-xl px-4 py-3.5 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                    {isLoading ? 'Processing...' : 'Create Account'}
                  </motion.button>
                </form>

                <motion.div variants={itemVariants} className="mt-8">
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-white/10"></div></div>
                    <span className="relative bg-white dark:bg-[#121212] px-3 text-xs uppercase font-semibold text-zinc-400">Or continue with</span>
                  </div>
                  <div className="flex justify-center w-full">
                     <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} theme="filled_black" shape="rectangular" width="300" text="signup_with" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- OVERLAY PANEL (The "Curtain" that slides left and right) --- */}
        <motion.div 
          className="absolute top-0 left-0 w-full md:w-1/2 h-full hidden md:block z-50 overflow-hidden"
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40, bounce: 0 }}
        >
          <motion.div 
            className="w-[200%] h-full flex absolute top-0 left-0 bg-gradient-to-tr from-zinc-900 to-zinc-800 dark:from-black dark:to-zinc-900"
            animate={{ x: isLogin ? '-50%' : '0%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40, bounce: 0 }}
          >
            
            {/* LEFT HALF OF THE 200% OVERLAY -> Visible when isLogin is false (Register Form is visible) -> User wants to go to Login */}
            <div 
              onClick={() => handleToggle(true)}
              className="w-1/2 h-full relative flex flex-col items-center justify-center p-12 text-center overflow-hidden cursor-pointer group hover:bg-white/[0.02] transition-colors"
            >
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <motion.div animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="absolute -top-[50%] -left-[50%] w-[100%] h-[100%] rounded-full border-[1px] border-blue-500/10 border-dashed"></motion.div>
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 110, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[50%] -right-[50%] w-[100%] h-[100%] rounded-full border-[1px] border-blue-500/10 border-dashed"></motion.div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
               </div>

               {/* Elegant Floating Indicator */}
               <div className="absolute top-12 left-0 w-full flex justify-center text-blue-400 font-semibold tracking-[0.2em] text-[10px] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-3">
                   <motion.div animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                     <ArrowRight size={12} className="rotate-180" />
                   </motion.div>
                   Switch to Sign In
                 </div>
               </div>
               
               <div className="relative z-10 text-white mt-auto pointer-events-none flex flex-col items-center">
                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                   <div className="w-12 h-12 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                      <Search size={20} className="text-blue-400" />
                   </div>
                   <h2 className="text-3xl font-light mb-4 tracking-tight text-white/90">System Initialization</h2>
                   <p className="text-sm text-blue-100/60 max-w-sm mx-auto leading-relaxed font-light">
                     Already configured? Authenticate to access your neural matching engine and review algorithmically curated freelance leads.
                   </p>
                 </motion.div>
                 
                 {/* Large subtle hover arrow indicating the whole panel is a button */}
                 <div className="mt-12 w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-500 group-hover:-translate-x-2">
                    <ArrowRight size={20} className="rotate-180" />
                 </div>
               </div>
            </div>

            {/* RIGHT HALF OF THE 200% OVERLAY -> Visible when isLogin is true (Login form is visible) -> User wants to go to Register */}
            <div 
              onClick={() => handleToggle(false)}
              className="w-1/2 h-full relative flex flex-col items-center justify-center p-12 text-center overflow-hidden cursor-pointer group hover:bg-white/[0.02] transition-colors"
            >
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="absolute -top-[50%] -right-[50%] w-[100%] h-[100%] rounded-full border-[1px] border-emerald-500/10 border-dashed"></motion.div>
                 <motion.div animate={{ rotate: -360 }} transition={{ duration: 110, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[50%] -left-[50%] w-[100%] h-[100%] rounded-full border-[1px] border-emerald-500/10 border-dashed"></motion.div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
               </div>

               {/* Elegant Floating Indicator */}
               <div className="absolute top-12 left-0 w-full flex justify-center text-emerald-400 font-semibold tracking-[0.2em] text-[10px] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-3">
                   Switch to Register
                   <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                     <ArrowRight size={12} />
                   </motion.div>
                 </div>
               </div>
               
               <div className="relative z-10 text-white mt-auto pointer-events-none flex flex-col items-center">
                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                     <ShieldCheck size={20} className="text-emerald-400" />
                   </div>
                   <h2 className="text-3xl font-light mb-4 tracking-tight text-white/90">Neural Synchronization</h2>
                   <p className="text-sm text-emerald-100/60 max-w-sm mx-auto leading-relaxed font-light">
                     New user? Secure your API keys and calibrate your personal AI assistant to begin discovering high-intent opportunities.
                   </p>
                 </motion.div>

                 {/* Large subtle hover arrow indicating the whole panel is a button */}
                 <div className="mt-12 w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all duration-500 group-hover:translate-x-2">
                    <ArrowRight size={20} />
                 </div>
               </div>
            </div>
            
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default Auth;
