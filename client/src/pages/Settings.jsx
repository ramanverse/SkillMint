import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CreditCard, Bell, ChevronRight, Zap, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'profile', label: 'Public Profile', icon: User },
  { id: 'account', label: 'Account & Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || 'Student Freelancer at University.',
    portfolio: 'skillmint.com/u/user',
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
         <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter mb-2">Workspace Settings</h1>
         <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your professional presence and account security.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
           {TABS.map(tab => {
             const Icon = tab.icon;
             const active = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                   active 
                     ? 'bg-mint text-white shadow-mint shadow-xl scale-105'
                     : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/5'
                 }`}
               >
                 <Icon size={18} />
                 <span>{tab.label}</span>
                 {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
               </button>
             );
           })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bento-tile p-8"
           >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                   <div className="flex items-center gap-6 pb-8 border-b border-gray-100 dark:border-white/5">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white text-3xl font-display font-extrabold shadow-2xl shadow-mint/20">
                         {user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                         <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">Display Portrait</h3>
                         <div className="flex gap-2">
                            <button className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 bg-mint/10 text-mint rounded-lg hover:bg-mint/20 transition-all">Upload New</button>
                            <button className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-gray-400 hover:text-red-500 transition-all">Remove</button>
                         </div>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Public Name</label>
                         <input 
                           type="text" 
                           value={form.name} 
                           onChange={e => setForm({...form, name: e.target.value})}
                           className="input-mint" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Professional Role</label>
                         <div className="input-mint bg-gray-50/50 dark:bg-white/5 opacity-70 flex items-center gap-2">
                            <Zap size={14} className="text-mint" />
                            <span>{user?.role} Creator</span>
                         </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Bio / About</label>
                         <textarea 
                           className="input-mint h-32 resize-none"
                           value={form.bio}
                           onChange={e => setForm({...form, bio: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 py-3 px-8 text-sm"
                      >
                         {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                         <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                      </button>
                   </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="text-center py-20">
                   <CreditCard size={48} className="mx-auto text-gray-200 dark:text-white/10 mb-6" />
                   <h3 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-2">Billing Dashboard</h3>
                   <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">Manage your payout methods and transaction history.</p>
                   <button className="btn-secondary py-3 px-10">Configure Payments</button>
                </div>
              )}

              {(activeTab === 'security' || activeTab === 'notifications') && (
                <div className="space-y-6">
                   <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Security & Access</h3>
                   {[
                     { label: 'Login Authentication', desc: 'Manage your primary login method.', value: 'Password' },
                     { label: 'Session Management', desc: 'Currently active on this device.', value: 'Mac OS' },
                     { label: 'Two-Factor Auth', desc: 'Secure your account with 2FA.', value: 'Disabled', danger: true },
                   ].map(item => (
                     <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div>
                           <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                           <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">{item.desc}</p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${item.danger ? 'bg-red-500/10 text-red-500' : 'bg-mint/10 text-mint'}`}>
                           {item.value}
                        </span>
                     </div>
                   ))}
                </div>
              )}
           </motion.div>
        </div>
      </div>
    </div>
  );
}
