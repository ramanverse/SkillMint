import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, CreditCard, Tag, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API } from '../../context/AuthContext';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/requests/my');
      setRequests(data);
    } catch (err) {
      setError('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/requests/${id}`);
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete request');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="p-8"><div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-gray-900 tracking-tighter">My Service Briefs</h1>
          <p className="text-gray-500 font-medium">Manage the gig requests you've posted for students.</p>
        </div>
        <Link 
          to="/requests/post" 
          className="btn-primary flex items-center gap-2 py-3.5 px-6 shadow-xl shadow-mint/20"
        >
          <Plus size={18} /> Post New Brief
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-24 bento-tile bg-gray-50/50 border-dashed">
          <Info size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-lg font-bold text-gray-400">You haven't posted any requests yet.</p>
          <p className="text-sm text-gray-300 mt-2">Post a brief to get custom offers from talented students.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {requests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bento-tile p-6 group hover:border-mint/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-mint/10 text-mint rounded-lg uppercase tracking-widest whitespace-nowrap">
                      {req.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${req.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {req.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-extrabold text-gray-900 group-hover:text-mint transition-colors truncate">
                    {req.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1 mt-1 max-w-xl">
                    {req.description}
                  </p>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-gray-50">
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Budget</p>
                    <p className="text-lg font-display font-extrabold text-gray-900">₹{req.budget}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={deleting === req.id}
                    className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    title="Delete Request"
                  >
                    {deleting === req.id ? <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" /> : <Trash2 size={20} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
