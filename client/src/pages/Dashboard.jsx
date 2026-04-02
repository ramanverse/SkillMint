import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Star, Clock, ArrowRight, PlusCircle, Package, Zap, Gift, Target, Sparkles, Layout, Search } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Data', 'Business'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, earnings: 0, listings: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, gigsRes] = await Promise.all([
          API.get('/orders'),
          API.get('/gigs?limit=4'),
        ]);
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        setRecentOrders(orders.slice(0, 5));
        const earnings = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + (o.package?.price || 0), 0);
        setStats({
          orders: orders.length,
          earnings,
          reviews: orders.filter(o => o.review).length,
          listings: user?.role === 'SELLER' ? (gigsRes.data?.gigs?.length || 0) : 0,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const statusColors = { 
    PENDING: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', 
    IN_PROGRESS: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', 
    COMPLETED: 'bg-mint/10 dark:bg-mint/20 text-mint-dark dark:text-mint', 
    CANCELLED: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400' 
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-gray-900 dark:text-white tracking-tighter leading-none">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium">
            Your university hustle is scaling. Here is your overview.
          </p>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-3"
        >
           {user?.role === 'SELLER' && (
             <Link to="/seller/create" className="btn-primary py-3.5 px-8 shadow-2xl flex items-center gap-2 group">
                <PlusCircle size={18} />
                <span>New Listing</span>
             </Link>
           )}
           <Link to="/marketplace" className="p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-mint transition-all">
              <Search size={22} />
           </Link>
        </motion.div>
      </div>

      {/* Active Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Earnings Card (Large) */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-2 bento-tile group bento-tile-accent overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
              <div>
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total {user?.role === 'SELLER' ? 'Earnings' : 'Invested'}</p>
                 <h3 className="text-5xl font-display font-extrabold tracking-tighter">₹{stats.earnings}</h3>
              </div>
          </div>
        </motion.div>

        {/* Orders Count */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bento-tile group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
              <ShoppingBag size={24} />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter">{stats.orders}</h3>
          </div>
          <div className="mt-6 flex -space-x-2">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-obsidian-900 bg-gray-200 dark:bg-white/10" />
             ))}
             <div className="w-8 h-8 rounded-full border-2 border-white dark:border-obsidian-900 bg-mint text-[10px] font-bold flex items-center justify-center text-white">+2</div>
          </div>
        </motion.div>

        {/* Rating/Reviews */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bento-tile group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
              <Star size={24} className="fill-current" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Reputation</p>
            <h3 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter">{stats.reviews > 0 ? "4.9/5" : "N/A"}</h3>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-8">{stats.reviews} Total Reviews</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Work / Orders Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                 <Package size={20} className="text-mint" />
                 {user?.role === 'SELLER' ? 'Active Workflow' : 'Project Progress'}
              </h2>
              <Link to="/orders" className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 hover:text-mint transition-colors uppercase tracking-widest">View All →</Link>
           </div>

           <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                ))
              ) : recentOrders.length === 0 ? (
                <div className="liquid-glass rounded-[2.5rem] p-16 text-center border-dashed border-2 border-gray-100 dark:border-white/5">
                   <div className="w-20 h-20 bg-mint/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-mint/20">
                      <Layout size={40} className="text-mint" />
                   </div>
                   <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">
                     {user?.role === 'SELLER' ? 'Empty Queue' : 'No Live Projects'}
                   </p>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-10 max-w-xs mx-auto leading-relaxed">
                     {user?.role === 'SELLER' 
                        ? 'Ready to take on new academic challenges and scale your hustle?' 
                        : 'Ready to find the perfect student talent for your next big project?'}
                   </p>
                   <Link to="/marketplace" className="btn-primary py-4 px-10 rounded-2xl shadow-xl shadow-mint/20 flex items-center gap-2 mx-auto justify-center w-max group">
                      <span>{user?.role === 'SELLER' ? 'Browse Challenges' : 'Hire Talent'}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              ) : (
                recentOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/orders/${order.id}`} className="bento-tile flex items-center gap-6 group hover:border-mint/20">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500">
                         <Zap size={24} className="text-mint" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-lg font-display font-bold text-gray-900 dark:text-white truncate transition-colors group-hover:text-mint leading-tight">{order.gig?.title}</p>
                         <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-2">
                            <Clock size={12} /> Ordered {new Date(order.createdAt).toLocaleDateString()}
                         </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                         <div className="text-lg font-display font-extrabold text-gray-900 dark:text-white tracking-tighter">₹{order.package?.price}</div>
                         <div className={`text-[9px] uppercase tracking-[0.15em] font-extrabold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                            {order.status.replace('_', ' ')}
                         </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        {/* Marketplace Pulse / Quick Actions */}
        <div className="space-y-8">
           <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white px-2">Marketplace Pulse</h2>
           
           <div className="space-y-4">
              <Link to="/marketplace" className="bento-tile block p-6 border-transparent bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 dark:to-obsidian-900 group">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                       <Gift size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900 dark:text-white">Pro Perks</p>
                       <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Exclusive for Students</p>
                    </div>
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-4">Unlock premium badges and lower service fees by maintaining a 4.5+ rating.</p>
                 <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">Learn More <ArrowRight size={12} /></span>
              </Link>

              <div className="bento-tile group p-6">
                 <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Trending Skills</h3>
                 <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(0, 6).map(cat => (
                      <Link key={cat} to={`/marketplace?category=${cat}`} className="text-[10px] font-extrabold px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-mint hover:text-white transition-all transform active:scale-95">
                         {cat}
                      </Link>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
