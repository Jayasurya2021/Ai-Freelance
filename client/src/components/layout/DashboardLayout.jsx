import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { LayoutDashboard, Briefcase, Bookmark, User, Menu, Moon, Sun, Search, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

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
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-dark-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-surface dark:bg-[#121212] border-r border-zinc-200 dark:border-white/5">
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                 <Search className="text-white dark:text-zinc-900" size={18} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                  LeadFlow AI
                </h1>
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Personal Copilot</p>
              </div>
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#121212]"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-white/10 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-black/20">
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-zinc-500">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n._id} 
                            onClick={() => !n.isRead && markAsReadMutation.mutate(n._id)}
                            className={`p-3 border-b border-zinc-100 dark:border-white/5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-500/5' : 'opacity-70'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h5 className={`text-xs font-semibold ${!n.isRead ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{n.title}</h5>
                              {!n.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></span>}
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-zinc-100/80 dark:bg-white/10 text-zinc-900 dark:text-white' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon size={18} className={isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-white/5 space-y-2">
          {user && (
            <div className="px-3 pb-3 mb-2 border-b border-zinc-100 dark:border-white/5">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate mb-2">{user.email}</p>
              {(user.experience || (user.skills && user.skills.length > 0)) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.experience && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      {user.experience}
                    </span>
                  )}
                  {user.skills && user.skills.slice(0, 2).map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 truncate max-w-[80px]">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 glass px-4 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-white/5">
        <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">LeadFlow AI</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-600 dark:text-zinc-300">
          <Menu size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-10"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
