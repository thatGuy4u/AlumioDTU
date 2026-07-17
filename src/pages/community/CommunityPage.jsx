import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL, POST_CATEGORIES } from '../../utils/constants';
import { HiOutlineArrowTrendingUp, HiOutlineChatBubbleOvalLeft, HiOutlinePlusCircle, HiOutlineHandThumbUp, HiHandThumbUp } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function CommunityPage() {
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [upvotedIds, setUpvotedIds] = useState(new Set());

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 15, sort });
    if (category !== 'all') params.set('category', category);
    const res = await axios.get(`${API_URL}/community/posts?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    setPosts(res.data.data.posts); setPagination(res.data.data.pagination);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(page); }, [page, category, sort]);

  const handleUpvote = async (postId) => {
    const res = await axios.post(`${API_URL}/community/posts/${postId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvoteCount: res.data.data.upvoteCount } : p));
    setUpvotedIds(prev => {
      const next = new Set(prev);
      if (res.data.data.upvoted) {
        next.add(postId);
      } else {
        next.delete(postId);
      }
      return next;
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const payload = { ...newPost, tags: newPost.tags ? newPost.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [] };
    await axios.post(`${API_URL}/community/posts`, payload, { headers: { Authorization: `Bearer ${token}` } });
    setShowCreate(false); setNewPost({ title: '', content: '', category: 'general', tags: '' }); fetchPosts(1);
  };

  return (
    <div className="community-page">
      <div className="directory-header">
        <div><h1>Community <span className="text-gold">Forum</span></h1><p>Share knowledge, ask questions, and connect with peers</p></div>
        <button className="auth-submit-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setShowCreate(!showCreate)}><HiOutlinePlusCircle size={18} /> New Post</button>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <motion.form className="create-post-form" onSubmit={handleCreatePost} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <input className="onboarding-input" placeholder="Post title..." value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} required />
          <textarea className="onboarding-textarea" placeholder="Write your post..." rows={4} value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} required />
          <div className="onboarding-row">
            <select className="onboarding-input" value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}>
              {POST_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
            <input className="onboarding-input" placeholder="Tags (comma-separated)" value={newPost.tags} onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="onboarding-back-btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '8px 24px' }}>Publish →</button>
          </div>
        </motion.form>
      )}

      {/* Category Tabs & Sort */}
      <div className="community-controls">
        <div className="tab-bar" style={{ flex: 1 }}>
          <button className={`tab-btn ${category === 'all' ? 'active' : ''}`} onClick={() => { setCategory('all'); setPage(1); }}>All</button>
          {POST_CATEGORIES.map(c => <button key={c.value} className={`tab-btn ${category === c.value ? 'active' : ''}`} onClick={() => { setCategory(c.value); setPage(1); }}>{c.icon} {c.label}</button>)}
        </div>
        <select className="onboarding-input" style={{ width: 'auto' }} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
          <option value="newest">Newest</option><option value="trending">Trending</option><option value="oldest">Oldest</option>
        </select>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <motion.div className="community-posts" variants={container} initial="hidden" animate="show">
          {posts.map(p => {
            const isUpvoted = upvotedIds.has(p.id);
            return (
              <motion.div key={p.id} className="community-post-card" variants={item}>
                <div className="post-vote-col">
                  <button className={`post-upvote-btn ${isUpvoted ? 'active' : ''}`} onClick={() => handleUpvote(p.id)}>
                    {isUpvoted ? <HiHandThumbUp size={18} /> : <HiOutlineHandThumbUp size={18} />}
                  </button>
                  <span className="post-vote-count">{p.upvoteCount}</span>
                </div>
                <div className="post-content-col">
                  <Link to={`/app/community/${p.id}`} className="post-title">{p.title}</Link>
                  <p className="post-excerpt">{p.content.slice(0, 160)}{p.content.length > 160 ? '...' : ''}</p>
                  <div className="post-meta">
                    <span className="post-author">{p.author?.name}</span>
                    <span className="dash-tag" style={{ fontSize: '0.68rem' }}>{p.category.replace('_', '-')}</span>
                    <span className="post-comments"><HiOutlineChatBubbleOvalLeft size={12} /> {p.commentCount}</span>
                    <span className="post-time">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  {p.tags?.length > 0 && <div className="post-tags">{p.tags.slice(0, 4).map((t, i) => <span key={i} className="post-tag">#{t}</span>)}</div>}
                </div>
              </motion.div>
            );
          })}
          {posts.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No posts yet. Be the first to start a discussion!</p>}
        </motion.div>
      )}
      {pagination.pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button><span>Page {page} of {pagination.pages}</span><button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next →</button></div>}
    </div>
  );
}
