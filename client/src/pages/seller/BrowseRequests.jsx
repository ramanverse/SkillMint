import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Clock, CreditCard, Tag, Search, Filter, MessageSquare, Plus, CheckCircle, Info } from 'lucide-react';
import { API } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function BrowseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    API.get('/requests')
      .then(r => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(requests.map(r => r.category))];
  const filtered = filter === 'All' ? requests : requests.filter(r => r.category === filter);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header & Stats */}
      <div className="grid lg:grid-cols-2 gap-8 items-center">
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
         >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-[10px] font-bold uppercase tracking-widest mb-4">
               <Briefcase size={12} className="fill-current" />
               <span>Available Opportunities</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-gray-900 tracking-tighter leading-none mb-6">
              Connect with <span className="text-mint">Real Requests</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-md">
              Check out what clients are looking for right now and send them an offer.
            </p>
         </motion.div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bento-tile p-6">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Open Requests</p>
               <h3 className="text-2xl font-display font-extrabold text-gray-900">{requests.length}</h3>
            </div>
            <div className="bento-tile p-6 bg-mint/5 border-mint/20">
               <p className="text-xs font-bold text-mint uppercase tracking-widest mb-1">Total Budget</p>
               <h3 className="text-2xl font-display font-extrabold text-mint">₹{requests.reduce((s, r) => s + r.budget, 0).toLocaleString()}</h3>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
         {categories.map(cat => (
           <button 
             key={cat} 
             onClick={() => setFilter(cat)}
             className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
               filter === cat 
                 ? 'bg-mint text-white shadow-xl shadow-mint/20' 
                 : 'bg-gray-50 text-gray-400 hover:text-gray-600'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Request Grid */}
      {loading ? (
        <div className="space-y-4">
           {[...Array(3)].map((_, i) => <div key={i} className="h-40 bento-tile animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100">
           <Search size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active requests found</p>
           <p className="text-xs text-gray-300 mt-2 font-medium">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 pb-20">
           {filtered.map((req, i) => (
             <motion.div
               key={req.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bento-tile p-6 group hover:translate-y-[-4px] transition-all duration-300 flex flex-col"
             >
                <div className="flex justify-between items-start mb-4">
                   <span className="text-[10px] font-bold px-2.5 py-1 bg-mint/10 text-mint rounded-lg uppercase tracking-widest">
                      {req.category}
                   </span>
                   <div className="text-right">
                      <p className="text-xl font-display font-bold text-gray-900 tracking-tighter">₹{req.budget}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{req.deliveryTime}d turnaround</p>
                   </div>
                </div>
                
                <div className="flex-1 min-w-0">
                   <h3 className="text-lg font-display font-extrabold text-gray-900 mb-2 truncate group-hover:text-mint transition-colors tracking-tight">
                      {req.title}
                   </h3>
                   <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed mb-6">
                      {req.description}
                   </p>
                </div>

                <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white text-[10px] font-bold">
                         {req.buyer?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{req.buyer?.name}</span>
                   </div>
                   <Link 
                     to={`/messages?userId=${req.buyerId}`}
                     className="btn-secondary py-2 px-4 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"
                   >
                     <MessageSquare size={12} /> Contact Client
                   </Link>
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
}
