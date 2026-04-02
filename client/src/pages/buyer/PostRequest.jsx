import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Clock, CreditCard, Tag, Plus, CheckCircle, Info } from 'lucide-react';
import { API } from '../../context/AuthContext';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Data', 'Business'];

export default function PostRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deliveryTime: 3,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/requests', form);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center text-mint mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-display font-extrabold text-gray-900 mb-2">Request Posted!</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Students will see your request in their feed and can start sending offers soon.</p>
        <div className="w-8 h-8 border-3 border-mint border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-gray-900 tracking-tighter">Post a Service Brief</h1>
        <p className="text-gray-500 font-medium">Describe what you need and set your budget.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-2">
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="bento-tile p-8 space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
                <Info size={16} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Request Title</label>
              <input 
                type="text" 
                placeholder="e.g., Need a logo for my student startup"
                className="input-mint py-4 text-lg"
                required
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Description</label>
              <textarea 
                placeholder="Tell students more about what you need..."
                className="input-mint h-32 py-4 resize-none"
                required
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Category</label>
                <div className="relative">
                  <select 
                    className="input-mint appearance-none py-3.5"
                    required
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Tag size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Budget (₹)</label>
                <div className="relative">
                   <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mint" />
                   <input 
                     type="number" 
                     placeholder="₹ 5,000"
                     className="input-mint pl-12 py-3.5"
                     required
                     value={form.budget}
                     onChange={e => setForm({...form, budget: e.target.value})}
                   />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
               <button 
                 type="submit" 
                 disabled={loading}
                 className="btn-primary flex items-center justify-center gap-2 py-4 px-10 flex-1 text-base shadow-2xl shadow-mint/20"
               >
                 {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> Post Your Request</>}
               </button>
            </div>
          </motion.form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="liquid-glass p-6 rounded-3xl bg-gradient-to-br from-mint/10 to-transparent border border-mint/20">
              <h3 className="font-display font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                 <Plus size={18} className="text-mint" />
                 How it works
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Be Specific', desc: 'Clear descriptions get better quality offers.' },
                   { label: 'Fair Budget', desc: 'Students are more likely to apply to realistic budgets.' },
                   { label: 'Set a Deadline', desc: 'Mention if you need it urgently.' }
                 ].map(item => (
                    <div key={item.label}>
                       <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">{item.label}</p>
                       <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">{item.desc}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                    <Clock size={20} className="text-mint" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Typical Response</p>
                    <p className="text-sm font-bold text-gray-900">~ 2 - 4 hours</p>
                 </div>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                 Your request will be visible to students globally. Make sure to check your messages regularly for seller offers.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
