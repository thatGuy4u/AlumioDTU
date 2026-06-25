import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlinePaperAirplane, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function MessagesPage() {
  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/chat/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setConversations(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const loadMessages = async (convoId) => {
    setActiveConvo(convoId);
    setMsgLoading(true);
    try {
      const res = await axios.get(`${API_URL}/chat/conversations/${convoId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data.data.messages);
      await axios.put(`${API_URL}/chat/conversations/${convoId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setConversations(prev => prev.map(c => c.id === convoId ? { ...c, myUnreadCount: 0 } : c));
    } catch (e) { console.error(e); }
    setMsgLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvo) return;
    try {
      const res = await axios.post(`${API_URL}/chat/conversations/${activeConvo}/messages`, { content: newMsg.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, res.data.data]);
      setNewMsg('');
      setConversations(prev => prev.map(c => c.id === activeConvo ? { ...c, lastContent: newMsg.trim(), lastMsgAt: new Date().toISOString() } : c));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) { console.error(e); }
  };

  const getOtherUser = (convo) => {
    const other = convo.participants?.find(p => p.user?.id !== currentUser?.id);
    return other?.user || { name: 'Unknown', avatar: '' };
  };

  const activeConvoData = conversations.find(c => c.id === activeConvo);
  const otherUser = activeConvoData ? getOtherUser(activeConvoData) : null;

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
                      <strong>{other.name}</strong>
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
            <p>Choose a conversation from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
            <div className="messages-chat-header">
              <div className="message-convo-avatar">{otherUser?.avatar ? <img src={otherUser.avatar} alt="" /> : <span>{otherUser?.name?.[0]}</span>}</div>
              <div><strong>{otherUser?.name}</strong></div>
            </div>

            <div className="messages-body">
              {msgLoading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
                <>
                  {messages.map((msg, i) => {
                    const isMine = msg.senderId === currentUser?.id || msg.sender?.id === currentUser?.id;
                    return (
                      <motion.div key={msg.id || i} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
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
              <input placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} autoFocus />
              <button type="submit" disabled={!newMsg.trim()}><HiOutlinePaperAirplane size={20} /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
