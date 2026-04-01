import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Package, Clock, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth, API } from '../context/AuthContext';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-amber-600 bg-amber-50', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600 bg-blue-50', icon: AlertCircle },
  COMPLETED: { label: 'Completed', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then(r => {
        setOrder(r.data);
        setMessages(r.data.messages || []);
        setReviewDone(!!r.data.review);
      })
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Socket.io
  useEffect(() => {
    if (!order) return;
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join_room', id);
    socket.emit('user_online', user?.id);

    socket.on('new_message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => { socket.disconnect(); };
  }, [order, id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      socketRef.current?.emit('send_message', {
        orderId: id,
        senderId: user.id,
        message: text,
      });
    } catch { setInput(text); }
    finally { setSending(false); }
  };

  const updateStatus = async (status) => {
    try {
      const { data } = await API.patch(`/orders/${id}/status`, { status });
      setOrder(prev => ({ ...prev, status: data.status }));
    } catch (err) { console.error(err); }
  };

  const submitReview = async () => {
    try {
      await API.post(`/orders/${id}/review`, reviewForm);
      setReviewDone(true);
      setShowReview(false);
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-3 border-mint border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!order) return null;

  const isSeller = user?.id === order.sellerId;
  const isBuyer = user?.id === order.buyerId;
  const other = isSeller ? order.buyer : order.seller;
  const cfg = STATUS_CONFIG[order.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-gray-900 truncate">{order.gig?.title}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm text-gray-500">
                {isSeller ? `Buyer: ${order.buyer?.name}` : `Seller: ${order.seller?.name}`}
              </span>
              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                <StatusIcon size={11} /> {cfg.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-bold text-mint text-lg">₹{order.package?.price}</span>
            {/* Status actions */}
            {isSeller && order.status === 'PENDING' && (
              <button onClick={() => updateStatus('IN_PROGRESS')}
                className="btn-primary text-xs px-3 py-1.5">Accept</button>
            )}
            {isSeller && order.status === 'IN_PROGRESS' && (
              <button onClick={() => updateStatus('COMPLETED')}
                className="btn-primary text-xs px-3 py-1.5">Mark Complete</button>
            )}
            {isBuyer && order.status === 'COMPLETED' && !reviewDone && (
              <button onClick={() => setShowReview(true)}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Star size={12} /> Review</button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full">
        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {/* Order info card at top */}
            <div className="bg-gradient-to-r from-mint/10 to-emerald-50 border border-mint/20 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mint/20 flex items-center justify-center">
                  <Package size={18} className="text-mint" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{order.package?.name} Package</p>
                  <p className="text-xs text-gray-500">{order.package?.deliveryTime} day delivery · ₹{order.package?.price}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {msg.sender?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      isMe ? 'bg-mint text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.message}
                      <div className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                id="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="input-mint flex-1 py-2.5"
              />
              <button
                id="chat-send"
                type="submit"
                disabled={!input.trim() || sending}
                className="btn-primary px-4 py-2.5 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          >
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Leave a Review</h2>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewForm(p => ({ ...p, rating: n }))}>
                  <Star size={28} fill={n <= reviewForm.rating ? '#f59e0b' : 'none'} className={n <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              className="input-mint resize-none h-24 mb-4"
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReview(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitReview} className="btn-primary flex-1">Submit Review</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
