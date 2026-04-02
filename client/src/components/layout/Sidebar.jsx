import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, ShoppingBag,
  PlusCircle, Star, LogOut, Menu, X, Zap, ChevronDown, User,
  Globe, Settings, CreditCard, HelpCircle, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['BUYER', 'SELLER'] },
  { icon: MessageSquare, label: 'Messages', path: '/messages', roles: ['BUYER', 'SELLER'] },
  { icon: Search, label: 'Marketplace', path: '/marketplace', roles: ['BUYER', 'SELLER'] },
  { icon: PlusCircle, label: 'Post a Request', path: '/requests/post', roles: ['BUYER'] },
  { icon: Zap, label: 'My Requests', path: '/requests/my', roles: ['BUYER'] },
  { icon: Zap, label: 'Available Requests', path: '/requests/browse', roles: ['SELLER'] },
  { icon: ShoppingBag, label: 'Orders', path: '/orders', roles: ['BUYER', 'SELLER'] },
  { icon: PlusCircle, label: 'Create Listing', path: '/seller/create', roles: ['SELLER'] },
  { icon: Star, label: 'My Listings', path: '/seller/listings', roles: ['SELLER'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const filtered = navItems.filter(item => item.roles.includes(user?.role || 'BUYER'));

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed top-24 bottom-6 bg-white/40 dark:bg-obsidian-800/40 backdrop-blur-3xl border-r border-gray-100 dark:border-white/5 z-30 transition-all duration-300 ml-4 rounded-3xl shadow-xl overflow-hidden">
      <div className="flex flex-col h-full py-8">
        
        {/* User Stats Card (Bento Style) */}
        <div className="px-6 mb-8">
           <div className="p-5 rounded-2xl bg-gradient-to-br from-mint/10 to-transparent border border-mint/10 dark:border-mint/5 group hover:border-mint/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-extrabold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-mint">{user?.role}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                 <div className="bg-white/50 dark:bg-white/5 p-2 rounded-lg text-center border border-white/50 dark:border-white/5">
                    <div className="text-xs font-display font-extrabold text-gray-900 dark:text-white">Active</div>
                    <div className="text-[10px] text-gray-500">2 Orders</div>
                 </div>
                 <div className="bg-white/50 dark:bg-white/5 p-2 rounded-lg text-center border border-white/50 dark:border-white/5">
                    <div className="text-xs font-display font-extrabold text-gray-900 dark:text-white">Rating</div>
                    <div className="text-[10px] text-gray-500">4.9/5</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500 mb-4">Main Menu</p>
          {filtered.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-500 ease-[cubic-bezier(0.2,1,0.2,1)] group ${
                  active
                    ? 'bg-mint text-white shadow-[0_20px_40px_-12px_rgba(0,229,157,0.4)] translate-x-1'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-mint/5 hover:text-mint dark:hover:bg-mint/10'
                }`}
              >
                <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-mint transition-colors duration-500'} />
                <span className="relative z-10">{label}</span>
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="ml-auto w-1.5 h-6 bg-white/30 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="px-4 pt-6 border-t border-gray-100 dark:border-white/5 space-y-2">
           {[
             { icon: CreditCard, label: 'Billing', path: '/billing' },
             { icon: Settings, label: 'Settings', path: '/settings' },
             { icon: HelpCircle, label: 'Support', path: '/support' },
           ].map(item => {
             const active = location.pathname === item.path;
             return (
               <Link
                 key={item.label}
                 to={item.path}
                 className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                   active
                     ? 'bg-mint/10 text-mint'
                     : 'text-gray-500 dark:text-gray-400 hover:text-mint dark:hover:text-mint'
                 }`}
               >
                 <item.icon size={18} />
                 <span>{item.label}</span>
               </Link>
             );
           })}
           <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
