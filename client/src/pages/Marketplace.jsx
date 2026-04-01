import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, ChevronDown, Filter, X, SlidersHorizontal } from 'lucide-react';
import { API } from '../context/AuthContext';

const CATEGORIES = ['All', 'Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Data', 'Business'];

function GigCard({ gig, index }) {
  const minPkg = gig.packages?.[0];
  const rating = 4.5 + Math.random() * 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/gigs/${gig.id}`} className="glass-card block overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        {/* Image */}
        <div className="aspect-video bg-gradient-to-br from-mint/20 to-emerald-100 relative overflow-hidden">
          {gig.images?.[0] ? (
            <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-5xl opacity-30">{
                { Design: '🎨', Development: '💻', Writing: '✍️', Marketing: '📈', Video: '🎬', Music: '🎵', Data: '📊', Business: '💼' }[gig.category] || '📦'
              }</div>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-mint font-medium">
            {gig.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {gig.user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 truncate">{gig.user?.name}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-mint transition-colors">
            {gig.title}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            <Star size={12} fill="#f59e0b" className="text-amber-400" />
            <span className="text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">(12)</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} />
              <span>{minPkg?.deliveryTime || 3}d delivery</span>
            </div>
            <div>
              <span className="text-xs text-gray-400">From </span>
              <span className="font-bold text-mint">₹{minPkg?.price || '—'}</span>
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900 mb-1">Marketplace</h1>
        <p className="text-gray-500">Discover {total} student-powered gigs</p>
      </motion.div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="marketplace-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search gigs..."
            className="input-mint pl-11 pr-12 py-3.5 text-base shadow-sm"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-mint text-white shadow-md shadow-mint/30'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-mint/40 hover:text-mint'
            }`}
          >
            {cat}
          </button>
        ))}
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
