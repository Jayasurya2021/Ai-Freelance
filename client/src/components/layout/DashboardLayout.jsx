import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { LayoutDashboard, Briefcase, Bookmark, User, Menu, X, Search, LogOut, Bell, Settings, Activity, Globe, Rss, List, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProfileMode } from '../../context/ProfileContext';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { profileMode, setProfileMode } = useProfileMode();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

  // Force Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications?userId=${user.id}`);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refetch every minute
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Feed', path: '/feed', icon: List },
    { name: 'Analyzer', path: '/url-analyzer', icon: Globe },
    { name: 'Watchlist', path: '/watchlist', icon: Eye },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Saved', path: '/saved', icon: Bookmark },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo & Desktop Nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-6 mr-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                       <Search className="text-white" size={18} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-zinc-900 leading-tight">
                        LeadFlow AI
                      </h1>
                    </div>
                </div>
                
                {/* Profile Switcher (Hover to expand) */}
                <div className="hidden md:flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 group relative">
                    <button 
                        onClick={() => setProfileMode('freelance')}
                        className={`flex items-center justify-center p-1.5 text-sm font-medium rounded-md transition-all duration-300 ${profileMode === 'freelance' ? 'bg-white shadow-sm text-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        <span className="text-base leading-none">🚀</span>
                        <span className="overflow-hidden whitespace-nowrap transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2">
                            Freelance
                        </span>
                    </button>
                    <button 
                        onClick={() => setProfileMode('job')}
                        className={`flex items-center justify-center p-1.5 text-sm font-medium rounded-md transition-all duration-300 ${profileMode === 'job' ? 'bg-white shadow-sm text-purple-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        <span className="text-base leading-none">💼</span>
                        <span className="overflow-hidden whitespace-nowrap transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2">
                            Job Search
                        </span>
                    </button>
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`inline-flex items-center gap-2 px-1 pt-1 pb-4 mt-4 text-sm font-medium border-b-2 transition-colors ${
                        isActive 
                          ? 'border-indigo-600 text-indigo-600' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}>
                         <Icon size={16} />
                      </div>
                      <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side icons & Profile */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-6">
              
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                 <Search size={18} />
              </button>

              {/* Notification Bell */}
              <div className="relative flex items-center">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-slate-400 hover:text-slate-600 transition-colors relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-zinc-100 bg-zinc-50">
                        <h4 className="font-semibold text-sm text-zinc-900">Notifications</h4>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-zinc-500">No new alerts</div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n._id} 
                              onClick={() => !n.isRead && markAsReadMutation.mutate(n._id)}
                              className={`p-4 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : 'opacity-70'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h5 className={`text-sm font-semibold ${!n.isRead ? 'text-zinc-900' : 'text-zinc-600'}`}>{n.title}</h5>
                                {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                              </div>
                              <p className="text-xs text-zinc-500 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Menu Link */}
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-slate-700 font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                {user && <span className="text-sm font-medium text-slate-700 hidden lg:block">{user.name}</span>}
                <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden border-t border-zinc-200 bg-white"
            >
              <div className="pt-2 pb-3 space-y-1">
                {[...navItems, { name: 'Profile', path: '/profile', icon: User }].map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 pl-4 pr-4 py-3 border-l-4 text-base font-medium ${
                        isActive 
                          ? 'bg-zinc-50 border-zinc-900 text-zinc-900' 
                          : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 pl-4 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
