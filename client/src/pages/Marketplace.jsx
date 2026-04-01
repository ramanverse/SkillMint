import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, ChevronDown, Filter, X, SlidersHorizontal } from 'lucide-react';
import { API } from '../context/AuthContext';

const CATEGORIES = ['All', 'Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Data', 'Business'];

function GigCard({ gig, index }) {
  const minPkg = gig.packages?.[0];
  const rating = 4.8 + Math.random() * 0.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/gigs/${gig.id}`} className="glass-card block overflow-hidden border-none hover:shadow-2xl hover:shadow-mint/10 hover:-translate-y-2 transition-all duration-500 group">
        {/* Image */}
        <div className="aspect-[4/3] bg-gradient-to-br from-mint/5 to-mint/20 relative overflow-hidden">
          {gig.images?.[0] ? (
            <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-mint-light/30">
              <div className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">{
                { Design: '🎨', Development: '💻', Writing: '✍️', Marketing: '📈', Video: '🎬', Music: '🎵', Data: '📊', Business: '💼' }[gig.category] || '📦'
              }</div>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <div className="bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full text-mint font-extrabold shadow-sm">
              {gig.category}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0 shadow-sm">
              {gig.user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-bold text-gray-400 truncate tracking-tight">{gig.user?.name}</span>
          </div>
          <h3 className="text-base font-extrabold text-gray-900 line-clamp-2 mb-4 group-hover:text-mint transition-colors leading-tight tracking-tight h-12">
            {gig.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-5 bg-mint-light/30 w-fit px-2.5 py-1 rounded-lg">
            <Star size={14} fill="#00D18E" className="text-mint" />
            <span className="text-xs font-extrabold text-mint-dark">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400 font-bold">(24 reviews)</span>
          </div>
          <div className="flex items-center justify-between pt-5 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-tight">
              <Clock size={14} className="text-mint/40" />
              <span>{minPkg?.deliveryTime || 3}d Delivery</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest leading-none mb-1">Starting At</p>
              <p className="font-extrabold text-lg text-gray-900">₹{minPkg?.price || '—'}</p>
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-gray-900 tracking-tight mb-2">Marketplace</h1>
        <p className="text-gray-500 font-medium">Discover {total} student-powered opportunities for your next project.</p>
      </motion.div>

      {/* Search & Category Header */}
      <div className="flex flex-col gap-8 mb-10">
        <form onSubmit={handleSearch}>
          <div className="relative max-w-2xl group">
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mint transition-colors" />
            <input
              id="marketplace-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="What service are you looking for today?"
              className="input-mint pl-14 pr-14 py-5 text-lg shadow-xl shadow-mint/5 border-none bg-white font-medium placeholder:text-gray-300"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-extrabold transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-mint text-white shadow-xl shadow-mint/30 scale-105'
                  : 'bg-white text-gray-400 border border-transparent hover:border-mint/10 hover:text-mint hover:bg-mint-light/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gig Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-semibold text-lg text-gray-700">No gigs found</h3>
          <p className="text-gray-500 mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {gigs.map((gig, i) => <GigCard key={gig.id} gig={gig} index={i} />)}
        </div>
      )}
    </div>
  );
}
