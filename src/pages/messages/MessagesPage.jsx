import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useSocket, useSocketEvent } from '../../hooks/useSocket';
import api from '../../utils/apiClient';
import { HiOutlinePaperAirplane, HiOutlineMagnifyingGlass, HiOutlinePlusCircle, HiOutlineXMark } from 'react-icons/hi2';

export default function MessagesPage() {
  const currentUser = useSelector(selectCurrentUser);
  const { conversationId: urlConvoId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(urlConvoId || null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // New Chat modal state
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const userSearchTimeoutRef = useRef(null);

  // Socket.io integration (shared via context)
  const { socket, isConnected } = useSocket();

  // Fetch conversations on mount
  useEffect(() => {
    api.get('/chat/conversations')
      .then(r => { setConversations(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Handle ?to=userId query param — create/find conversation with that user
  const toHandledRef = useRef(false);
  useEffect(() => {
    const toUserId = searchParams.get('to');
    if (!toUserId || toHandledRef.current) return;
    toHandledRef.current = true;

    // Clear the query param from URL
    setSearchParams({}, { replace: true });

    startConversationWith(toUserId);
  }, [searchParams]);

  // Auto-open URL conversation (e.g., /app/messages/:conversationId)
  useEffect(() => {
    if (urlConvoId && conversations.length > 0) {
      loadMessages(urlConvoId);
    }
  }, [urlConvoId, conversations.length]);

  // Start or find a conversation with a specific user
  const startConversationWith = async (recipientId) => {
    try {
      const res = await api.post('/chat/conversations', { recipientId });
      const convo = res.data.data;

      // Add to conversations list if not already present
      setConversations(prev => {
        const exists = prev.find(c => c.id === convo.id);
        if (exists) return prev;
        return [convo, ...prev];
      });

      // Load messages for this conversation
      loadMessages(convo.id);
    } catch (e) {
      console.error('Failed to start conversation:', e);
    }
  };

  const loadMessages = async (convoId) => {
    setActiveConvo(convoId);
    setMsgLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${convoId}/messages`);
      setMessages(res.data.data.messages);
      await api.put(`/chat/conversations/${convoId}/read`);
      setConversations(prev => prev.map(c => c.id === convoId ? { ...c, myUnreadCount: 0 } : c));

      // Join socket room for real-time
      if (socket) {
        socket.emit('join_conversation', convoId);
        socket.emit('mark_read', convoId);
      }
    } catch (e) { console.error(e); }
    setMsgLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Leave previous room when switching conversations
  const prevConvoRef = useRef(null);
  useEffect(() => {
    if (socket && prevConvoRef.current && prevConvoRef.current !== activeConvo) {
      socket.emit('leave_conversation', prevConvoRef.current);
    }
    prevConvoRef.current = activeConvo;
  }, [activeConvo, socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvo) return;

    const content = newMsg.trim();
    setNewMsg('');

    // Optimistic update
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      senderId: currentUser?.id,
      content,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    // Send via socket if connected, otherwise fall back to REST
    if (socket && isConnected) {
      socket.emit('send_message', { conversationId: activeConvo, content });
      socket.emit('stop_typing', activeConvo);
    } else {
      try {
        const res = await api.post(`/chat/conversations/${activeConvo}/messages`, { content });
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => m._optimistic && m.content === content ? res.data.data : m));
      } catch (e) {
        console.error(e);
        // Remove failed optimistic message
        setMessages(prev => prev.filter(m => !m._optimistic));
      }
    }

    setConversations(prev => prev.map(c => c.id === activeConvo ? { ...c, lastContent: content, lastMsgAt: new Date().toISOString() } : c));
  };

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!socket || !activeConvo) return;
    socket.emit('typing', activeConvo);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', activeConvo);
    }, 2000);
  }, [socket, activeConvo]);

  // Socket event listeners
  useSocketEvent(socket, 'new_message', useCallback((message) => {
    // Replace optimistic message or add new one
    setMessages(prev => {
      const hasOptimistic = prev.find(m => m._optimistic && m.content === message.content && m.senderId === message.senderId);
      if (hasOptimistic) {
        return prev.map(m => m === hasOptimistic ? message : m);
      }
      return [...prev, message];
    });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []));

  useSocketEvent(socket, 'user_typing', useCallback(({ conversationId, userId }) => {
    if (conversationId === activeConvo && userId !== currentUser?.id) {
      setTypingUsers(prev => ({ ...prev, [userId]: true }));
    }
  }, [activeConvo, currentUser?.id]));

  useSocketEvent(socket, 'user_stop_typing', useCallback(({ conversationId, userId }) => {
    if (conversationId === activeConvo) {
      setTypingUsers(prev => { const next = { ...prev }; delete next[userId]; return next; });
    }
  }, [activeConvo]));

  // Listen for message notifications for non-active conversations (update unread badges)
  useSocketEvent(socket, 'message_notification', useCallback(({ conversationId, message }) => {
    if (conversationId !== activeConvo) {
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastContent: message.content, lastMsgAt: message.createdAt, myUnreadCount: (c.myUnreadCount || 0) + 1 }
          : c
      ));
    }
  }, [activeConvo]));

  // ── New Chat: search users ──
  const handleUserSearch = (query) => {
    setUserSearch(query);
    if (userSearchTimeoutRef.current) clearTimeout(userSearchTimeoutRef.current);

    if (!query.trim()) {
      setUserResults([]);
      return;
    }

    userSearchTimeoutRef.current = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=10`);
        // Filter out current user from results
        const filtered = (res.data.data.users || []).filter(u => u.id !== currentUser?.id);
        setUserResults(filtered);
      } catch {
        setUserResults([]);
      }
      setUserSearchLoading(false);
    }, 300);
  };

  const handleSelectUser = (userId) => {
    setShowNewChat(false);
    setUserSearch('');
    setUserResults([]);
    startConversationWith(userId);
  };

  const getOtherUser = (convo) => {
    const other = convo.participants?.find(p => p.user?.id !== currentUser?.id);
    const user = other?.user || { name: 'Unknown', avatar: '' };
    // Extract profile info (works for both students and alumni)
    const profile = user.studentProfile || user.alumniProfile || {};
    return { ...user, rollNumber: user.studentProfile?.rollNumber, graduationYear: profile.graduationYear, company: user.alumniProfile?.company };
  };

  const activeConvoData = conversations.find(c => c.id === activeConvo);
  const otherUser = activeConvoData ? getOtherUser(activeConvoData) : null;
  const isTyping = Object.keys(typingUsers).length > 0;

  const filteredConvos = conversations.filter(c => {
    if (!search) return true;
    const other = getOtherUser(c);
    return other.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
          <div className="messages-sidebar-header-actions">
            {isConnected && <span className="socket-connected-dot" title="Real-time connected" />}
            <button className="new-chat-btn" onClick={() => setShowNewChat(true)} title="New conversation">
              <HiOutlinePlusCircle size={22} />
            </button>
          </div>
        </div>
        <div className="messages-search">
          <HiOutlineMagnifyingGlass size={16} />
          <input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="messages-list">
          {loading ? <div className="page-loader" style={{ minHeight: 200 }}><span className="auth-spinner-large" /></div> : (
            filteredConvos.length === 0 ? <p className="messages-empty">No conversations yet</p> : (
              filteredConvos.map(c => {
                const other = getOtherUser(c);
                return (
                  <button key={c.id} className={`message-convo-btn ${activeConvo === c.id ? 'active' : ''}`} onClick={() => loadMessages(c.id)}>
                    <div className="message-convo-avatar">{other.avatar ? <img src={other.avatar} alt="" /> : <span>{other.name?.[0]}</span>}</div>
                    <div className="message-convo-info">
                      <div className="message-convo-name-row">
                        <strong>{other.name}</strong>
                        {(other.rollNumber || other.graduationYear) && (
                          <span className="message-convo-meta">
                            {other.rollNumber}{other.rollNumber && other.graduationYear ? ' · ' : ''}{other.graduationYear && `Class of ${other.graduationYear}`}
                          </span>
                        )}
                      </div>
                      <p>{c.lastContent || 'Start a conversation'}</p>
                    </div>
                    {c.myUnreadCount > 0 && <span className="message-unread-badge">{c.myUnreadCount}</span>}
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="messages-chat">
        {!activeConvo ? (
          <div className="messages-no-active">
            <div className="messages-no-active-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar or start a new one</p>
            <button className="new-chat-start-btn" onClick={() => setShowNewChat(true)}>
              <HiOutlinePlusCircle size={18} /> Start a new chat
            </button>
          </div>
        ) : (
          <>
            <div className="messages-chat-header">
              <div className="message-convo-avatar">{otherUser?.avatar ? <img src={otherUser.avatar} alt="" /> : <span>{otherUser?.name?.[0]}</span>}</div>
              <div className="messages-chat-header-info">
                <div className="messages-chat-header-name-row">
                  <strong>{otherUser?.name}</strong>
                  {(otherUser?.rollNumber || otherUser?.graduationYear) && (
                    <span className="messages-chat-header-meta">
                      {otherUser?.rollNumber}{otherUser?.rollNumber && otherUser?.graduationYear ? ' · ' : ''}{otherUser?.graduationYear && `${otherUser.graduationYear}`}
                    </span>
                  )}
                </div>
                {isTyping && <span className="typing-indicator">typing...</span>}
              </div>
            </div>

            <div className="messages-body">
              {msgLoading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
                <>
                  {messages.length === 0 && (
                    <div className="messages-empty-chat">
                      <p>No messages yet. Say hello! 👋</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isMine = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
                    return (
                      <motion.div
                        key={msg.id || i}
                        className={`message-bubble ${isMine ? 'mine' : 'theirs'}${msg._optimistic ? ' optimistic' : ''}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <p>{msg.content}</p>
                        <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form className="messages-input" onSubmit={sendMessage}>
              <input
                placeholder="Type a message..."
                value={newMsg}
                onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
                autoFocus
              />
              <button type="submit" disabled={!newMsg.trim()}><HiOutlinePaperAirplane size={20} /></button>
            </form>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            className="new-chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewChat(false)}
          >
            <motion.div
              className="new-chat-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="new-chat-modal-header">
                <h3>New Conversation</h3>
                <button className="new-chat-close" onClick={() => setShowNewChat(false)}>
                  <HiOutlineXMark size={20} />
                </button>
              </div>
              <div className="new-chat-search">
                <HiOutlineMagnifyingGlass size={16} />
                <input
                  placeholder="Search users by name..."
                  value={userSearch}
                  onChange={e => handleUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="new-chat-results">
                {userSearchLoading ? (
                  <div className="new-chat-loading"><span className="auth-spinner-large" /></div>
                ) : userSearch && userResults.length === 0 ? (
                  <p className="new-chat-no-results">No users found</p>
                ) : !userSearch ? (
                  <p className="new-chat-hint">Type a name to search for users</p>
                ) : (
                  userResults.map(user => (
                    <button
                      key={user.id}
                      className="new-chat-user-btn"
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <div className="message-convo-avatar">
                        {user.avatar
                          ? <img src={user.avatar} alt="" />
                          : <span>{user.name?.[0]}</span>
                        }
                      </div>
                      <div className="new-chat-user-info">
                        <strong>{user.name}</strong>
                        <span>{user.role}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
