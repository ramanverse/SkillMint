import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, MessageSquare, MoreVertical, Paperclip, Search, Send, ShieldCheck, Smile, Zap } from 'lucide-react';
import { io } from 'socket.io-client';
import { API, SOCKET_URL, useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const MotionDiv = motion.div;

const getOtherUser = (conversation, currentUser) => {
  if (!conversation || !currentUser) return null;
  return currentUser.role === 'SELLER' ? conversation.buyer : conversation.seller;
};

const getOtherUserDirect = (conversation, currentUser) => {
  if (!conversation || !currentUser) return null;
  return currentUser.id === conversation.buyerId ? conversation.seller : conversation.buyer;
};

const formatMessageTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sortByRecentActivity = (items) =>
  [...items].sort((a, b) => {
    const aTime = new Date(a.directMessages?.[0]?.createdAt || a.messages?.[0]?.createdAt || a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.directMessages?.[0]?.createdAt || b.messages?.[0]?.createdAt || b.updatedAt || b.createdAt).getTime();
    return bTime - aTime;
  });

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState('direct'); // 'direct' | 'orders'

  // Direct conversations state
  const [directConvos, setDirectConvos] = useState([]);
  const [activeDirectChat, setActiveDirectChat] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [directLoading, setDirectLoading] = useState(true);
  const [directMsgsLoading, setDirectMsgsLoading] = useState(false);

  // Order conversations (existing)
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [error, setError] = useState('');
  const scrollRef = useRef();
  const socketRef = useRef(null);
  const activeDirectChatRef = useRef(null);
  const activeChatRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { activeDirectChatRef.current = activeDirectChat; }, [activeDirectChat]);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const loadDirectConversations = useCallback(async () => {
    try {
      const res = await API.get('/conversations');
      const sorted = sortByRecentActivity(res.data);
      setDirectConvos(sorted);

      // Auto-open conversation if navigated from Contact Client / Message Seller
      const targetId = searchParams.get('conversationId');
      if (targetId) {
        const target = sorted.find(c => c.id === targetId);
        if (target) {
          setTab('direct');
          setActiveDirectChat(target);
        }
        setSearchParams({}); // Clean URL
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDirectLoading(false);
    }
  }, [searchParams, setSearchParams]);

  const loadDirectMessages = useCallback(async (convId) => {
    try {
      setDirectMsgsLoading(true);
      const res = await API.get(`/conversations/${convId}`);
      setDirectMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDirectMsgsLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await API.get('/messages');
      const sorted = sortByRecentActivity(res.data);
      setConversations(sorted);
      setActiveChat((cur) => cur || sorted[0] || null);
    } catch (e) {
      console.error(e);
      setError('Unable to load order conversations.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (orderId) => {
    try {
      setMessagesLoading(true);
      const res = await API.get(`/messages/${orderId}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Socket.io setup
  useEffect(() => {
    if (!user?.id) return;
    loadDirectConversations();
    loadConversations();

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('sm_token') },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('user_online');
      if (activeChatRef.current?.id) socket.emit('join_room', activeChatRef.current.id);
      if (activeDirectChatRef.current?.id) socket.emit('join_direct_room', activeDirectChatRef.current.id);
    });

    socket.on('connect_error', () => {
      setError('Realtime chat is reconnecting...');
    });

    socket.on('online_users', (ids) => setOnlineUsers(new Set(ids)));

    // Order messages
    socket.on('new_message', (msg) => {
      if (activeChatRef.current?.id === msg.orderId) {
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      }
      setConversations((prev) => sortByRecentActivity(prev.map((c) =>
        c.id === msg.orderId ? { ...c, updatedAt: msg.createdAt, messages: [msg] } : c
      )));
    });

    // Direct messages
    socket.on('new_direct_message', (msg) => {
      if (activeDirectChatRef.current?.id === msg.conversationId) {
        setDirectMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      }
      setDirectConvos((prev) => sortByRecentActivity(prev.map((c) =>
        c.id === msg.conversationId ? { ...c, updatedAt: msg.createdAt, directMessages: [msg] } : c
      )));
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [loadConversations, loadDirectConversations, user?.id]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeDirectChat) {
      loadDirectMessages(activeDirectChat.id);
      socketRef.current?.emit('join_direct_room', activeDirectChat.id);
    } else {
      setDirectMessages([]);
    }
  }, [activeDirectChat, loadDirectMessages]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      socketRef.current?.emit('join_room', activeChat.id);
    } else {
      setMessages([]);
    }
  }, [activeChat, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, directMessages]);

  // Filtered conversations for search
  const filteredDirect = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return directConvos;
    return directConvos.filter((c) => {
      const other = getOtherUserDirect(c, user);
      const lastMsg = c.directMessages?.[0]?.message || '';
      return [other?.name, lastMsg].some((v) => v?.toLowerCase().includes(term));
    });
  }, [directConvos, searchTerm, user]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) => {
      const other = getOtherUser(c, user);
      return [other?.name, c.gig?.title, c.messages?.[0]?.message].some((v) => v?.toLowerCase().includes(term));
    });
  }, [conversations, searchTerm, user]);

  // Send message handlers
  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || sending) return;

    const isDirect = tab === 'direct';
    const currentChat = isDirect ? activeDirectChat : activeChat;
    if (!currentChat) return;

    setSending(true);
    setNewMessage('');
    setError('');

    try {
      const socket = socketRef.current;
      if (!socket?.connected) {
        // HTTP fallback
        if (isDirect) {
          const { data } = await API.post(`/conversations/${currentChat.id}/messages`, { message: text });
          setDirectMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data]);
        } else {
          const { data } = await API.post(`/messages/${currentChat.id}`, { message: text });
          setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data]);
        }
        return;
      }

      if (isDirect) {
        await new Promise((resolve, reject) => {
          socket.timeout(7000).emit('send_direct_message', { conversationId: currentChat.id, message: text }, (err, res) => {
            if (err) return reject(new Error('Message timed out'));
            if (!res?.ok) return reject(new Error(res?.error || 'Failed to send'));
            setDirectMessages((prev) => prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]);
            resolve();
          });
        });
      } else {
        await new Promise((resolve, reject) => {
          socket.timeout(7000).emit('send_message', { orderId: currentChat.id, message: text }, (err, res) => {
            if (err) return reject(new Error('Message timed out'));
            if (!res?.ok) return reject(new Error(res?.error || 'Failed to send'));
            setMessages((prev) => prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]);
            resolve();
          });
        });
      }
    } catch (err) {
      setNewMessage(text);
      setError(err.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const currentMessages = tab === 'direct' ? directMessages : messages;
  const currentLoading = tab === 'direct' ? directLoading : ordersLoading;
  const currentMsgsLoading = tab === 'direct' ? directMsgsLoading : messagesLoading;
  const currentActiveChat = tab === 'direct' ? activeDirectChat : activeChat;
  const currentSetActive = tab === 'direct' ? setActiveDirectChat : setActiveChat;
  const currentFiltered = tab === 'direct' ? filteredDirect : filteredOrders;

  const getOtherFromChat = (chat) => tab === 'direct' ? getOtherUserDirect(chat, user) : getOtherUser(chat, user);
  const getLastMsg = (chat) => tab === 'direct' ? chat.directMessages?.[0] : chat.messages?.[0];

  if (currentLoading && tab === 'direct' && ordersLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 lg:w-96 flex flex-col liquid-glass rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5">
          <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white mb-4">Messages</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 bg-gray-50 dark:bg-white/5 rounded-2xl p-1">
            <button
              onClick={() => { setTab('direct'); setSearchTerm(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'direct' ? 'bg-mint text-white shadow-md' : 'text-gray-500 hover:text-mint'}`}
            >
              Direct
            </button>
            <button
              onClick={() => { setTab('orders'); setSearchTerm(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'orders' ? 'bg-mint text-white shadow-md' : 'text-gray-500 hover:text-mint'}`}
            >
              Orders
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-mint/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {currentFiltered.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest leading-loose">
                {tab === 'direct' ? 'No direct messages yet' : 'No order conversations'}
              </p>
              {tab === 'direct' && (
                <p className="text-xs text-gray-400 mt-2">Visit a gig page to message a seller</p>
              )}
            </div>
          ) : (
            currentFiltered.map((chat) => {
              const other = getOtherFromChat(chat);
              const lastMsg = getLastMsg(chat);
              const isActive = currentActiveChat?.id === chat.id;
              const isOnline = onlineUsers.has(other?.id);

              return (
                <button
                  key={chat.id}
                  onClick={() => currentSetActive(chat)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group ${
                    isActive ? 'bg-mint text-white shadow-xl shadow-mint/20' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${isActive ? 'bg-white/20' : 'bg-mint/10 text-mint'}`}>
                      {other?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-obsidian-900 ${isOnline ? 'bg-mint' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-display font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{other?.name || 'Unknown'}</span>
                      <span className="text-[10px] font-bold opacity-60">{formatMessageTime(lastMsg?.createdAt || chat.updatedAt)}</span>
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500'} font-medium`}>
                      {lastMsg?.message || (tab === 'direct' ? 'Start a conversation' : 'New project started')}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col liquid-glass rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
        {currentActiveChat ? (
          <>
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-obsidian-950/40 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-mint/20">
                  {getOtherFromChat(currentActiveChat)?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-gray-900 dark:text-white leading-tight">
                    {getOtherFromChat(currentActiveChat)?.name || 'Unknown'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(getOtherFromChat(currentActiveChat)?.id) ? 'bg-mint animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-mint">
                      {tab === 'direct' ? 'Direct Message' : `Project: ${currentActiveChat.gig?.title || 'Untitled'}`}
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-mint transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="mx-auto flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
                {currentMsgsLoading ? (
                  <div className="py-16 flex justify-center">
                    <div className="w-8 h-8 border-4 border-mint border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <MessageSquare size={36} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-semibold">No messages yet. Start the conversation!</p>
                  </div>
                ) : currentMessages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <MotionDiv
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[70%] group relative">
                        <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium leading-relaxed ${
                          isMe
                            ? 'bg-mint text-white rounded-tr-none shadow-xl shadow-mint/10'
                            : 'bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'
                        }`}>
                          {msg.message}
                        </div>
                        <div className={`flex items-center gap-2 mt-2 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest scale-90 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <Clock size={10} />
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </MotionDiv>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </div>

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
                  disabled={!newMessage.trim() || sending}
                  type="submit"
                  className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white shadow-lg shadow-mint/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={20} fill="currentColor" />
                </button>
              </form>
              <div className="mt-3 px-6 flex items-center gap-2">
                <Zap size={12} className="text-mint animate-pulse" />
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Real-time Messaging • Verified Student Community</p>
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
              {tab === 'direct'
                ? 'Select a conversation or visit any gig page to message a seller directly.'
                : 'Select an order-based conversation from the left to continue collaborating.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
