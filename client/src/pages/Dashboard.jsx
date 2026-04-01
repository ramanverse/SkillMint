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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-gray-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]} <span className="animate-pulse inline-block">👋</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Your academic marketplace is buzzing. Here's your summary.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-6 group hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${color} group-hover:scale-110 transition-transform`}>
              <Icon size={22} />
            </div>
            <div className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">{value}</div>
            <div className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-wider">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-extrabold text-xl text-gray-900 tracking-tight">Recent Projects</h2>
            <Link to="/orders" className="text-sm font-bold text-mint hover:text-mint-dark flex items-center gap-1.5 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-50/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-16 px-4 bg-mint-light/20 rounded-3xl border border-dashed border-mint/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShoppingBag size={28} className="text-mint/40" />
              </div>
              <p className="text-gray-900 font-bold text-lg">No active projects</p>
              <p className="text-gray-500 text-sm mt-1 mb-6">Your next opportunity is waiting for you.</p>
              {user?.role === 'BUYER' && (
                <Link to="/marketplace" className="btn-primary">Browse Gigs</Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-5 p-4 rounded-2xl hover:bg-mint-light/30 border border-transparent hover:border-mint/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform">
                    <Package size={20} className="text-mint" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate group-hover:text-mint transition-colors">{order.gig?.title}</p>
                    <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-gray-900">₹{order.package?.price}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold shadow-sm ${statusColors[order.status]}`}>
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
          className="glass-card p-8"
        >
          <h2 className="font-display font-extrabold text-xl text-gray-900 mb-8 tracking-tight">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/marketplace"
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-mint/40 hover:bg-white hover:shadow-xl hover:shadow-mint/5 hover:translate-x-1 transition-all duration-300 group">
              <div className="w-10 h-10 bg-blue-50/50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ShoppingBag size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Explore Services</p>
                <p className="text-xs text-gray-400 font-medium">Find top student talent</p>
              </div>
            </Link>
            {user?.role === 'SELLER' && (
              <Link to="/seller/create"
                className="flex items-center gap-4 p-4 rounded-2xl border border-mint/10 bg-mint-light/30 hover:border-mint/50 hover:bg-white hover:shadow-xl hover:shadow-mint/10 hover:translate-x-1 transition-all duration-300 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <PlusCircle size={20} className="text-mint" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Create Listing</p>
                  <p className="text-xs text-mint/60 font-semibold">Monetize your skill</p>
                </div>
              </Link>
            )}
            <Link to="/orders"
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-mint/40 hover:bg-white hover:shadow-xl hover:shadow-mint/5 hover:translate-x-1 transition-all duration-300 group">
              <div className="w-10 h-10 bg-purple-50/50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Track Progress</p>
                <p className="text-xs text-gray-400 font-medium">Manage your active work</p>
              </div>
            </Link>
          </div>

          {/* Categories */}
          <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest mt-8 mb-4">Discover Categories</h3>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/marketplace?category=${cat}`}
                className="text-xs px-4 py-2 bg-white text-gray-600 rounded-full border border-gray-100 hover:border-mint/30 hover:text-mint hover:shadow-lg hover:shadow-mint/5 transition-all duration-300 font-bold">
                {cat}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
