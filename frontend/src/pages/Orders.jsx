import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, Star, MessageSquare, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
};

const FILTERS = ['All', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    API.get('/orders')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900 mb-1">
          {user?.role === 'SELLER' ? 'Incoming Orders' : 'My Orders'}
        </h1>
        <p className="text-gray-500">{orders.length} total orders</p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f ? 'bg-mint text-white shadow-md shadow-mint/30' : 'bg-white text-gray-600 border border-gray-200 hover:border-mint/40'
            }`}>
            {f === 'All' ? 'All' : STATUS_CONFIG[f]?.label}
            {f !== 'All' && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                {orders.filter(o => o.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass-card animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-gray-200 mb-3" />
          <h3 className="font-display font-semibold text-gray-600">No orders yet</h3>
          <p className="text-gray-400 text-sm mt-1">
            {user?.role === 'BUYER' ? 'Browse the marketplace to find services.' : 'Your orders will appear here.'}
          </p>
          {user?.role === 'BUYER' && (
            <Link to="/marketplace" className="btn-primary mt-4 inline-flex">Browse Marketplace</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status];
            const other = user?.role === 'SELLER' ? order.buyer : order.seller;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/orders/${order.id}`}
                  className="glass-card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
                  <div className="w-11 h-11 rounded-xl bg-mint/10 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-mint" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{order.gig?.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {user?.role === 'SELLER' ? 'from' : 'by'} {other?.name}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-gray-900">₹{order.package?.price}</span>
                    <span className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
