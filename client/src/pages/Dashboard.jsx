import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Star, Clock, ArrowRight, PlusCircle, Package } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Data', 'Business'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, earnings: 0, listings: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, gigsRes] = await Promise.all([
          API.get('/orders'),
          API.get('/gigs?limit=4'),
        ]);
        const orders = ordersRes.data;
        setRecentOrders(orders.slice(0, 5));
        const earnings = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + (o.package?.price || 0), 0);
        setStats({
          orders: orders.length,
          earnings,
          reviews: orders.filter(o => o.review).length,
          listings: user?.role === 'SELLER' ? (gigsRes.data?.gigs?.length || 0) : 0,
        });
        setFeaturedGigs(gigsRes.data?.gigs || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const statCards = user?.role === 'SELLER'
    ? [
        { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
        { label: 'Earnings', value: `₹${stats.earnings.toFixed(0)}`, icon: TrendingUp, color: 'bg-mint/10 text-mint-dark' },
        { label: 'Active Listings', value: stats.listings, icon: Package, color: 'bg-purple-50 text-purple-600' },
        { label: 'Reviews', value: stats.reviews, icon: Star, color: 'bg-amber-50 text-amber-600' },
      ]
    : [
        { label: 'Active Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
        { label: 'Completed', value: stats.reviews, icon: Star, color: 'bg-mint/10 text-mint-dark' },
        { label: 'Spent', value: `₹${stats.earnings.toFixed(0)}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
        { label: 'Reviews Given', value: stats.reviews, icon: Star, color: 'bg-amber-50 text-amber-600' },
      ];

  const statusColors = { PENDING: 'bg-amber-100 text-amber-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening on your account.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="font-display font-bold text-2xl text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-mint hover:text-mint-dark flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
              <p>No orders yet</p>
              {user?.role === 'BUYER' && (
                <Link to="/marketplace" className="mt-3 inline-flex btn-primary text-sm">Browse Gigs</Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-mint" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.gig?.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-gray-900">₹{order.package?.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h2 className="font-display font-semibold text-lg text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/marketplace"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-mint/30 hover:bg-mint/5 transition-all group">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Browse Marketplace</p>
                <p className="text-xs text-gray-400">Find talented students</p>
              </div>
            </Link>
            {user?.role === 'SELLER' && (
              <Link to="/seller/create"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-mint/30 hover:bg-mint/5 transition-all group">
                <div className="w-9 h-9 bg-mint/10 rounded-lg flex items-center justify-center">
                  <PlusCircle size={16} className="text-mint" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Create New Listing</p>
                  <p className="text-xs text-gray-400">Share your skills</p>
                </div>
              </Link>
            )}
            <Link to="/orders"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-mint/30 hover:bg-mint/5 transition-all group">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Orders</p>
                <p className="text-xs text-gray-400">Track your projects</p>
              </div>
            </Link>
          </div>

          {/* Categories */}
          <h3 className="font-semibold text-sm text-gray-700 mt-6 mb-3">Browse by Category</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/marketplace?category=${cat}`}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-mint/10 hover:text-mint transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
