import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, User, MoreVertical, Paperclip, Smile, ShieldCheck, Clock, Zap } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  withCredentials: true
});

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    loadConversations();
    socket.emit('user_online', user.id);

    socket.on('new_message', (msg) => {
      if (activeChat && msg.orderId === activeChat.id) {
        setMessages(prev => [...prev, msg]);
      }
      // Update snippet in conversations list
      setConversations(prev => prev.map(c => 
        c.id === msg.orderId ? { ...c, messages: [msg] } : c
      ));
    });

    return () => {
      socket.off('new_message');
    };
  }, [activeChat, user.id]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      socket.emit('join_room', activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await API.get('/messages');
      setConversations(res.data);
      if (res.data.length > 0 && !activeChat) {
        setActiveChat(res.data[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadMessages = async (orderId) => {
    try {
      const res = await API.get(`/messages/${orderId}`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const msgData = {
      orderId: activeChat.id,
      senderId: user.id,
      message: newMessage.trim()
    };

    socket.emit('send_message', msgData);
    setNewMessage('');
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Conversation List */}
      <div className="w-80 lg:w-96 flex flex-col liquid-glass rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5">
           <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white mb-6">Inbox</h2>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search chats..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-mint/20 transition-all font-medium"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
           {conversations.length === 0 ? (
             <div className="p-10 text-center text-gray-400">
                <ShieldCheck size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest leading-loose">No active<br/>conversations</p>
             </div>
           ) : (
             conversations.map((c) => {
               const otherUser = user.role === 'SELLER' ? c.buyer : c.seller;
               const lastMsg = c.messages?.[0];
               const isActive = activeChat?.id === c.id;

               return (
                 <button
                   key={c.id}
                   onClick={() => setActiveChat(c)}
                   className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group ${
                     isActive 
                       ? 'bg-mint text-white shadow-xl shadow-mint/20' 
                       : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                   }`}
                 >
                   <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${isActive ? 'bg-white/20' : 'bg-mint/10 text-mint'}`}>
                        {otherUser.name?.[0].toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-obsidian-900 bg-mint" />
                   </div>
                   <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`font-display font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{otherUser.name}</span>
                        <span className={`text-[10px] font-bold opacity-60`}>12:45 PM</span>
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500'} font-medium`}>
                        {lastMsg?.message || 'Started a new project'}
                      </p>
                   </div>
                 </button>
               );
             })
           )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col liquid-glass rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-obsidian-950/40 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-mint/20">
                    {(user.role === 'SELLER' ? activeChat.buyer : activeChat.seller).name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-gray-900 dark:text-white leading-tight">
                      {user.role === 'SELLER' ? activeChat.buyer.name : activeChat.seller.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-mint">Project: {activeChat.gig?.title}</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-mint transition-colors">
                    <ShieldCheck size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-mint transition-colors">
                    <MoreVertical size={20} />
                  </button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               <div className="flex flex-col gap-6">
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                         <div className={`max-w-[70%] group relative`}>
                            <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium leading-relaxed ${
                              isMe 
                                ? 'bg-mint text-white rounded-tr-none shadow-xl shadow-mint/10' 
                                : 'bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'
                            }`}>
                               {msg.message}
                            </div>
                            <div className={`flex items-center gap-2 mt-2 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest scale-90 ${isMe ? 'justify-end' : 'justify-start'}`}>
                               <Clock size={10} />
                               {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                      </motion.div>
                    );
                  })}
                  <div ref={scrollRef} />
               </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/40 dark:bg-obsidian-950/40 backdrop-blur-xl border-t border-gray-50 dark:border-white/5">
               <form onSubmit={handleSend} className="relative flex items-center gap-4 bg-white dark:bg-obsidian-900 rounded-3xl p-2 shadow-inner border border-gray-100 dark:border-white/5">
                  <button type="button" className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-mint hover:bg-mint/5 transition-all">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0"
                  />
                  <button type="button" className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-mint hover:bg-mint/5 transition-all">
                    <Smile size={20} />
                  </button>
                  <button 
                    disabled={!newMessage.trim()}
                    type="submit" 
                    className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white shadow-lg shadow-mint/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Send size={20} fill="currentColor" />
                  </button>
               </form>
               <div className="mt-3 px-6 flex items-center gap-2">
                  <Zap size={12} className="text-mint animate-pulse" />
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Safe Payments • Verified Student Community</p>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-24 h-24 bg-mint/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-mint/20 animate-float">
                <Send size={48} className="text-mint opacity-40 rotate-12" />
             </div>
             <h3 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-3">Your Secure Workspace</h3>
             <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-8">
                Select a conversation from the left to start collaborating. All messages and transactions are monitored for safety.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
