import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, User, ArrowLeft, ShoppingCart, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

const TIER_LABELS = { basic: '🌱 Basic', standard: '⚡ Standard', premium: '👑 Premium' };
const TIER_COLORS = {
  basic: 'border-gray-200 bg-white',
  standard: 'border-mint bg-mint/5 ring-2 ring-mint/30',
  premium: 'border-amber-300 bg-amber-50/40',
};

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('basic');
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showSuccess, setShowSuccess] = useState(searchParams.get('created') === 'true');

  useEffect(() => {
    API.get(`/gigs/${id}`)
      .then(r => setGig(r.data))
      .catch(() => navigate('/marketplace'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const selectedPkg = gig?.packages?.find(p => p.type === selectedTier);

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedPkg) return;
    setOrdering(true);
    setOrderError('');
    try {
      const { data } = await API.post('/orders', { gigId: gig.id, packageId: selectedPkg.id });
      navigate(`/orders/${data.id}`);
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="aspect-video bg-gray-200 rounded-2xl mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded w-full" />)}
        </div>
      </div>
    );
  }

  if (!gig) return null;

  const reviews = gig.orders?.filter(o => o.review).map(o => o.review) || [];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Created success toast */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 bg-mint text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-mint/30"
        >
          <CheckCircle size={20} />
          <span className="font-medium">Your listing is live! 🎉</span>
          <button onClick={() => setShowSuccess(false)} className="ml-auto opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
        </motion.div>
      )}

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-mint mb-5 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Gig Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <span className="text-xs font-medium text-mint bg-mint/10 px-3 py-1 rounded-full">{gig.category}</span>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900 mt-3 leading-tight">{gig.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white font-bold text-sm">
                  {gig.user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{gig.user?.name}</span>
              </div>
              {avgRating && (
                <div className="flex items-center gap-1">
                  <Star size={14} fill="#f59e0b" className="text-amber-400" />
                  <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
                  <span className="text-sm text-gray-400">({reviews.length})</span>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-mint/15 to-emerald-100 shadow-md">
            {gig.images?.[0] ? (
              <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                {{'Design': '🎨', 'Development': '💻', 'Writing': '✍️', 'Marketing': '📊'}[gig.category] || '📦'}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-900 mb-3">About this gig</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{gig.description}</p>
            {gig.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {gig.tags.map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Seller */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">About the seller</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {gig.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{gig.user?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{gig.user?.bio || 'Passionate student freelancer.'}</p>
                {gig.user?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {gig.user.skills.map(s => (
                      <span key={s} className="text-xs bg-mint/10 text-mint px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">
                Reviews <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
              </h2>
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={13} fill={j < r.rating ? '#f59e0b' : 'none'} className={j < r.rating ? 'text-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Card */}
        <div className="space-y-4 lg:sticky lg:top-8 self-start">
          {/* Package Tabs */}
          <div className="glass-card overflow-hidden">
            <div className="flex border-b border-gray-100">
              {gig.packages?.map(pkg => (
                <button
                  key={pkg.type}
                  onClick={() => setSelectedTier(pkg.type)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                    selectedTier === pkg.type ? 'text-mint border-b-2 border-mint bg-mint/5' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {pkg.type}
                </button>
              ))}
            </div>

            {selectedPkg && (
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-2xl text-gray-900">₹{selectedPkg.price}</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{selectedPkg.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Clock size={12} /> {selectedPkg.deliveryTime} day{selectedPkg.deliveryTime !== 1 ? 's' : ''}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">{selectedPkg.description}</p>

                {orderError && (
                  <p className="text-sm text-red-500 mb-3">{orderError}</p>
                )}

                {user?.id === gig.userId ? (
                  <div className="text-center text-sm text-gray-500 py-2">This is your listing</div>
                ) : (
                  <button
                    id="order-now-btn"
                    onClick={handleOrder}
                    disabled={ordering}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60"
                  >
                    {ordering
                      ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <><ShoppingCart size={18} /> Order Now</>
                    }
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
