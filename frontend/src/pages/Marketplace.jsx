import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, ChevronDown, Filter, X, SlidersHorizontal, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { API } from '../context/AuthContext';

const CATEGORIES = ['All', 'Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Data', 'Business'];

function GigCard({ gig, index }) {
  const minPkg = gig.packages?.[0];
  const rating = 4.8 + Math.random() * 0.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="group"
    >
      <Link to={`/gigs/${gig.id}`} className="liquid-glass rounded-[2rem] block overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-mint/20">
        {/* Preview Image Area */}
        <div className="aspect-[4/3] bg-gray-100 dark:bg-obsidian-900 border-b border-gray-100 dark:border-white/5 relative overflow-hidden">
          {gig.images?.[0] ? (
            <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
              <Zap size={64} className="text-mint fill-current" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-md text-[9px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl text-mint font-extrabold shadow-xl">
              {gig.category}
            </div>
          </div>
          {/* Tonal Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
             <span className="text-white text-xs font-bold flex items-center gap-2">View Portfolio <ArrowRight size={14} /></span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-7">
          <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-white/5 pb-4">
            <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-white text-[10px] font-extrabold shadow-lg">
              {gig.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate tracking-tight">{gig.user?.name}</p>
               <p className="text-[9px] text-mint uppercase font-bold tracking-widest">Expert Creator</p>
            </div>
            <div className="flex items-center gap-1.5 bg-mint/10 px-2 py-1 rounded-lg">
               <Star size={12} className="text-mint fill-current" />
               <span className="text-[10px] font-extrabold text-mint">{rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-lg font-display font-extrabold text-gray-900 dark:text-white line-clamp-2 mb-6 group-hover:text-mint transition-colors leading-[1.25] tracking-tight h-12">
            {gig.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
               <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Starting At</span>
               <span className="text-xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter">₹{minPkg?.price || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-xl">
               <Clock size={14} className="text-mint" />
               <span>{minPkg?.deliveryTime || 3}d</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(params.get('category') || 'All');

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (activeCategory !== 'All') query.set('category', activeCategory);
      if (search) query.set('search', search);
      const { data } = await API.get(`/gigs?${query}`);
      setGigs(data.gigs || []);
      setTotal(data.total || 0);
    } catch { setGigs([]); }
    finally { setLoading(false); }
  }, [activeCategory, search]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs();
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Search & Intro */}
      <section className="relative py-12 px-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} className="fill-current" />
            <span>Discover Elite Talent</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter mb-4 lg:mb-6">
            The Student <span className="text-mint">Marketplace</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mb-8 lg:mb-12">
            Browse through {total} services curated for quality and university expertise.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-3xl group">
             <div className="absolute inset-0 bg-mint/20 blur-3xl opacity-0 group-focus-within:opacity-30 transition-opacity duration-700" />
             <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0">
                <div className="relative flex-1">
                   <Search size={20} className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mint transition-colors" />
                   <input
                     id="marketplace-search"
                     type="text"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="What expertise do you need?"
                     className="w-full bg-white dark:bg-obsidian-900/50 backdrop-blur-xl border-2 border-gray-100 dark:border-white/5 p-4 sm:p-6 pl-14 sm:pl-16 pr-6 sm:pr-32 rounded-2xl sm:rounded-[2rem] text-base sm:text-lg font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:border-mint focus:ring-0 transition-all shadow-2xl shadow-black/5 dark:text-white"
                   />
                </div>
                <button type="submit" className="sm:absolute sm:right-4 h-full sm:h-auto px-8 py-4 sm:py-3 bg-mint text-white font-bold rounded-2xl hover:bg-mint-dark transition-all shadow-lg shadow-mint/20 flex-shrink-0">
                  Search
                </button>
             </div>
          </form>
        </motion.div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-24 z-20 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-8 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all duration-500 ${
                activeCategory === cat
                  ? 'bg-mint text-white shadow-mint shadow-xl scale-105'
                  : 'bg-white/80 dark:bg-white/5 backdrop-blur-md text-gray-400 border border-gray-100 dark:border-white/5 hover:border-mint/30 hover:text-mint'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gig Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="liquid-glass rounded-[2rem] h-[450px] animate-pulse">
               <div className="h-2/3 bg-gray-100 dark:bg-white/5" />
               <div className="p-8 space-y-4">
                  <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-1/3" />
                  <div className="h-8 bg-gray-100 dark:bg-white/5 rounded w-full" />
               </div>
            </div>
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-32 liquid-glass rounded-[3rem]"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <X size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-2">No matching skills found</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Try broadening your search or switching categories.</p>
          <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-8 text-mint font-bold hover:underline">Clear all filters</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {gigs.map((gig, i) => <GigCard key={gig.id} gig={gig} index={i} />)}
        </div>
      )}
    </div>
  );
}
