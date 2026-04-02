import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Package, Edit, Trash2, Eye, Star, ShoppingBag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth, API } from '../../context/AuthContext';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/gigs/seller/my')
      .then(r => setGigs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await API.delete(`/gigs/${id}`);
      setGigs(prev => prev.filter(g => g.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-1">{gigs.length} listing{gigs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/seller/create" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New Listing
        </Link>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 glass-card animate-pulse" />)}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-gray-200 mb-3" />
          <h3 className="font-display font-semibold text-gray-600">No listings yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create your first gig to start earning.</p>
          <Link to="/seller/create" className="btn-primary mt-4 inline-flex items-center gap-2">
            <PlusCircle size={16} /> Create a Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {gigs.map((gig, i) => {
            const minPkg = gig.packages?.sort((a, b) => a.price - b.price)[0];
            return (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 flex items-center gap-5"
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-mint/20 to-emerald-100 flex-shrink-0 overflow-hidden">
                  {gig.images?.[0]
                    ? <img src={gig.images[0]} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">📦</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{gig.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{gig.category}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><ShoppingBag size={10} /> {gig._count?.orders || 0} orders</span>
                    {minPkg && <span className="text-xs font-semibold text-mint">From ₹{minPkg.price}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/gigs/${gig.id}`}
                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-mint/10 hover:text-mint transition-colors"
                    title="View">
                    <Eye size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(gig.id)}
                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
