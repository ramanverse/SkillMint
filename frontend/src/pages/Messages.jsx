import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, MoreVertical, Paperclip, Search, Send, ShieldCheck, Smile, Zap } from 'lucide-react';
import { io } from 'socket.io-client';
import { API, SOCKET_URL, useAuth } from '../context/AuthContext';

const MotionDiv = motion.div;

const getOtherUser = (conversation, currentUser) => {
  if (!conversation || !currentUser) return null;
  return currentUser.role === 'SELLER' ? conversation.buyer : conversation.seller;
};

const formatMessageTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sortByRecentActivity = (items) =>
  [...items].sort((a, b) => {
    const aTime = new Date(a.messages?.[0]?.createdAt || a.updatedAt || a.createdAt).getTime();
    const bTime = new Date(b.messages?.[0]?.createdAt || b.updatedAt || b.createdAt).getTime();
    return bTime - aTime;
  });

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [error, setError] = useState('');
  const scrollRef = useRef();
  const socketRef = useRef(null);
  const activeChatRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      setError('');
      const res = await API.get('/messages');
      const sorted = sortByRecentActivity(res.data);
      setConversations(sorted);
      setActiveChat((current) => current || sorted[0] || null);
    } catch (e) {
      console.error(e);
      setError('Unable to load conversations right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (orderId) => {
    try {
      setMessagesLoading(true);
      setError('');
      const res = await API.get(`/messages/${orderId}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
      setError('Unable to load this chat right now.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!user?.id) return;

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
    });

    socket.on('connect_error', () => {
      setError('Realtime chat is reconnecting. Messages can still be sent once the connection returns.');
    });

    socket.on('online_users', (ids) => {
      setOnlineUsers(new Set(ids));
    });

    socket.on('new_message', (msg) => {
      if (activeChatRef.current?.id === msg.orderId) {
        setMessages((prev) => {
          if (prev.some((item) => item.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      setConversations((prev) => sortByRecentActivity(prev.map((conversation) =>
        conversation.id === msg.orderId
          ? { ...conversation, updatedAt: msg.createdAt, messages: [msg] }
          : conversation
      )));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loadConversations, user?.id]);

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
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;

    return conversations.filter((conversation) => {
      const otherUser = getOtherUser(conversation, user);
      const title = conversation.gig?.title || '';
      const lastMessage = conversation.messages?.[0]?.message || '';
      return [otherUser?.name, title, lastMessage].some((value) =>
        value?.toLowerCase().includes(term)
      );
    });
  }, [conversations, searchTerm, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !activeChat || sending) return;

    setSending(true);
    setNewMessage('');
    setError('');

    try {
      const socket = socketRef.current;
      if (!socket?.connected) {
        const { data } = await API.post(`/messages/${activeChat.id}`, { message: text });
        setMessages((prev) => {
          if (prev.some((item) => item.id === data.id)) return prev;
          return [...prev, data];
        });
        setConversations((prev) => sortByRecentActivity(prev.map((conversation) =>
          conversation.id === data.orderId
            ? { ...conversation, updatedAt: data.createdAt, messages: [data] }
            : conversation
        )));
        return;
      }

      await new Promise((resolve, reject) => {
        socket.timeout(7000).emit('send_message', {
          orderId: activeChat.id,
          message: text,
        }, (err, response) => {
          if (err) return reject(new Error('Message timed out'));
          if (!response?.ok) return reject(new Error(response?.error || 'Message could not be sent'));

          setMessages((prev) => {
            if (prev.some((item) => item.id === response.message.id)) return prev;
            return [...prev, response.message];
          });
          resolve();
        });
      });
    } catch (err) {
      console.error(err);
      setNewMessage(text);
      setError(err.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      <div className="w-80 lg:w-96 flex flex-col liquid-glass rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5">
          <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white mb-6">Inbox</h2>
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
          {conversations.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <ShieldCheck size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest leading-loose">No active<br />conversations</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Search size={36} className="mx-auto mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest leading-loose">No matching<br />chats</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation, user);
              const lastMsg = conversation.messages?.[0];
              const isActive = activeChat?.id === conversation.id;
              const isOnline = onlineUsers.has(otherUser?.id);

              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveChat(conversation)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all group ${
                    isActive
                      ? 'bg-mint text-white shadow-xl shadow-mint/20'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${isActive ? 'bg-white/20' : 'bg-mint/10 text-mint'}`}>
                      {otherUser?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-obsidian-900 ${isOnline ? 'bg-mint' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-display font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{otherUser?.name || 'Unknown user'}</span>
                      <span className="text-[10px] font-bold opacity-60">{formatMessageTime(lastMsg?.createdAt || conversation.updatedAt)}</span>
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

      <div className="flex-1 flex flex-col liquid-glass rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
        {activeChat ? (
          <>
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-obsidian-950/40 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-mint/20">
                  {getOtherUser(activeChat, user)?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-gray-900 dark:text-white leading-tight">
                    {getOtherUser(activeChat, user)?.name || 'Unknown user'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(getOtherUser(activeChat, user)?.id) ? 'bg-mint animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-mint">Project: {activeChat.gig?.title || 'Untitled project'}</span>
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

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="mx-auto flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {messagesLoading ? (
                  <div className="py-16 flex justify-center">
                    <div className="w-8 h-8 border-4 border-mint border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <ShieldCheck size={36} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-semibold">No messages yet. Start the conversation.</p>
                  </div>
                ) : messages.map((msg) => {
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
