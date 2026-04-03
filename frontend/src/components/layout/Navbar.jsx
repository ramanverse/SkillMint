import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sun, Moon, Menu, X, ArrowRight, ShoppingBag, PieChart, LogOut, Search, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-3' : 'py-6'
    }`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className={`relative px-6 py-2.5 rounded-[2rem] transition-all duration-500 bg-white/20 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl ${
          scrolled 
            ? 'shadow-mint/10' 
            : 'shadow-2xl'
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center shadow-lg shadow-mint/20 group-hover:scale-110 transition-transform duration-300">
                <Zap size={22} className="text-white fill-current" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
                Skill<span className="text-mint">Mint</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {/* Links removed as per request */}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Desktop Actions (Hidden on Mobile) */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Search Icon */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowSearch(true)}
                  onMouseLeave={() => setShowSearch(false)}
                >
                  <Link 
                    to="/marketplace" 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-mint/20 ${
                      showSearch 
                        ? 'bg-mint/10 text-mint border-mint/20' 
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-mint dark:hover:text-mint'
                    }`}
                    aria-label="Search marketplace"
                  >
                    <Search size={20} />
                  </Link>

                  <AnimatePresence>
                    {showSearch && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-72 liquid-glass rounded-2xl p-2 shadow-2xl z-50 border border-white/20 dark:border-white/10"
                      >
                        <div className="relative flex items-center">
                          <Search size={16} className="absolute left-4 text-gray-400" />
                          <input 
                            autoFocus
                            type="text"
                            placeholder="Quick find..."
                            className="w-full bg-white dark:bg-obsidian-900 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                navigate(`/marketplace?search=${e.target.value}`);
                                setShowSearch(false);
                              }
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notification Bell */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowNotifications(true)}
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <button 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-mint/20 relative ${
                      showNotifications 
                        ? 'bg-mint/10 text-mint' 
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-mint dark:hover:text-mint'
                    }`}
                    aria-label="View notifications"
                  >
                    <Bell size={20} />
                    {hasUnread && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-mint rounded-full border-2 border-white dark:border-obsidian-900" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 bg-white/95 dark:bg-obsidian-950/95 backdrop-blur-3xl rounded-[2rem] p-1 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] z-50 overflow-hidden border border-gray-100 dark:border-white/10"
                      >
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-mint/10 dark:bg-mint/5 blur-[64px] rounded-full" />
                        
                        <div className="relative z-10 p-5">
                          <div className="flex items-center justify-between mb-6 px-1">
                            <span className="font-display font-extrabold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Live Alerts</span>
                            {hasUnread && (
                              <span className="text-[9px] font-extrabold text-mint bg-mint/10 px-3 py-1 rounded-full uppercase tracking-widest border border-mint/20">2 NEW</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {[
                              { id: 1, t: 'Welcome to SkillMint! 🚀', s: 'Start your journey now.' },
                              { id: 2, t: 'Verify your ID', s: 'Required for payouts.' }
                            ].map(n => (
                              <div key={n.id} className="p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-mint/5">
                                <p className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-mint transition-colors">{n.t}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium leading-relaxed">{n.s}</p>
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => setHasUnread(false)}
                            className="w-full mt-6 py-4 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-mint transition-colors border-t border-gray-100 dark:border-white/5 uppercase tracking-widest"
                          >
                            Dismiss All Notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-mint dark:hover:text-mint transition-all border border-transparent hover:border-mint/20"
                  aria-label="Toggle Theme"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'light' ? (
                      <motion.div
                        key="sun"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                      >
                        <Moon size={20} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                      >
                        <Sun size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      to="/settings"
                      className="w-10 h-10 rounded-xl overflow-hidden border-2 border-mint/20 hover:border-mint transition-all"
                    >
                      <div className="w-full h-full bg-mint flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <Link to="/login" className="nav-link text-sm font-bold uppercase tracking-widest">
                      Sign In
                    </Link>
                    <Link to="/signup" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 group shadow-lg shadow-mint/20">
                      <span>Join Now</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Theme Toggle (Visible on Mobile) */}
              <button
                onClick={toggleTheme}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-obsidian-900/95 backdrop-blur-3xl border-t border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl z-40"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-8">
              {/* Quick Search for Mobile */}
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search marketplace..."
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl pl-12 pr-4 py-4 text-gray-900 dark:text-white font-bold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/marketplace?search=${e.target.value}`);
                      setIsOpen(false);
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Link to="/marketplace" onClick={() => setIsOpen(false)} className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint">
                    <Search size={20} />
                  </div>
                  Browse Marketplace
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-display font-bold text-gray-900 dark:text-white"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {user ? (
                <div className="space-y-4">
                   <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-white text-lg font-bold">
                       <PieChart size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Dashboard</p>
                      <p className="text-xs text-gray-500">Manage your orders</p>
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-400 font-bold"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                       {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span>My Settings</span>
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                       <LogOut size={24} />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary w-full py-4 text-lg font-bold text-center border-2 border-gray-100 dark:border-white/10 rounded-2xl">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="btn-primary w-full py-4 text-lg">
                    Join SkillMint
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
