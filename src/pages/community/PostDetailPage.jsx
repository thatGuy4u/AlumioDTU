import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format, formatDistanceToNow } from 'date-fns';
import {
  HiOutlineArrowLeft, HiOutlineHandThumbUp, HiOutlineChatBubbleOvalLeft,
  HiOutlinePaperAirplane, HiOutlineTrash, HiOutlineArrowUturnLeft,
} from 'react-icons/hi2';

const categoryLabels = { placements: '🎯 Placements', internships: '💼 Internships', higher_studies: '🎓 Higher Studies', startups: '🚀 Startups', general: '💬 General' };

export default function PostDetailPage() {
  const { postId } = useParams();
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPost(res.data.data.post);
      setComments(res.data.data.comments);
      setHasUpvoted(res.data.data.hasUpvoted);
    } catch (e) {
      toast.error('Post not found');
      navigate('/app/community');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPost(); }, [postId]);

  const handleUpvote = async () => {
    try {
      const res = await axios.post(`${API_URL}/community/posts/${postId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPost(p => ({ ...p, upvoteCount: res.data.data.upvoteCount }));
      setHasUpvoted(res.data.data.upvoted);
    } catch { toast.error('Failed'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/community/posts/${postId}/comments`, { content: commentText }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => [...prev, res.data.data]);
      setPost(p => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      setCommentText('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to post comment'); }
    setSubmitting(false);
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/community/posts/${postId}/comments`, { content: replyText, parentCommentId: parentId }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => [...prev, res.data.data]);
      setPost(p => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      setReplyTo(null);
      setReplyText('');
    } catch { toast.error('Failed'); }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/community/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => prev.filter(c => c.id !== commentId));
      setPost(p => ({ ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }));
      toast.success('Comment deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;
  if (!post) return null;

  // Build threaded comments
  const topLevel = comments.filter(c => !c.parentCommentId);
  const replies = comments.filter(c => c.parentCommentId);
  const getReplies = (parentId) => replies.filter(r => r.parentCommentId === parentId);

  const roleBadge = (role) => {
    if (role === 'alumni') return <span className="topbar-role-badge role-alumni">Alumni</span>;
    if (role === 'admin') return <span className="topbar-role-badge role-admin">Admin</span>;
    return <span className="topbar-role-badge role-student">Student</span>;
  };

  return (
    <div className="post-detail-page">
      <button className="onboarding-back-btn" onClick={() => navigate('/app/community')}>
        <HiOutlineArrowLeft size={18} /> Back to Community
      </button>

      <motion.article className="post-detail-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Post Header */}
        <div className="post-detail-header">
          <span className="dash-tag">{categoryLabels[post.category] || post.category}</span>
          <h1>{post.title}</h1>
          <div className="post-detail-author">
            <Link to={`/app/profile/${post.author?.id}`} className="post-author-link">
              <div className="directory-card-avatar small">
                {post.author?.avatar ? <img src={post.author.avatar} alt="" /> : <span>{post.author?.name?.[0]}</span>}
              </div>
              <div>
                <span className="poster-name">{post.author?.name}</span>
                {roleBadge(post.author?.role)}
              </div>
            </Link>
            <span className="post-detail-date">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Post Body */}
        <div className="post-detail-body">
          {post.content.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="post-detail-tags">
            {post.tags.map((t, i) => <span key={i} className="profile-skill-tag">{t}</span>)}
          </div>
        )}

        {/* Actions */}
        <div className="post-detail-actions">
          <button className={`post-action-btn ${hasUpvoted ? 'active' : ''}`} onClick={handleUpvote}>
            <HiOutlineHandThumbUp size={18} />
            <span>{post.upvoteCount || 0} Upvote{post.upvoteCount !== 1 ? 's' : ''}</span>
          </button>
          <span className="post-action-btn disabled">
            <HiOutlineChatBubbleOvalLeft size={18} />
            <span>{post.commentCount || 0} Comment{post.commentCount !== 1 ? 's' : ''}</span>
          </span>
        </div>

        {/* Comments */}
        <div className="post-comments-section">
          <h3>Comments</h3>

          {/* New Comment Form */}
          <form className="post-comment-form" onSubmit={handleComment}>
            <div className="directory-card-avatar small">
              {user?.avatar ? <img src={user.avatar} alt="" /> : <span>{user?.name?.[0]}</span>}
            </div>
            <input className="onboarding-input" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." />
            <button type="submit" className="profile-edit-btn" disabled={submitting || !commentText.trim()}>
              <HiOutlinePaperAirplane size={16} />
            </button>
          </form>

          {/* Comment Thread */}
          <div className="post-comments-list">
            {topLevel.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No comments yet. Be the first!</p>
            )}
            {topLevel.map(c => (
              <div key={c.id} className="post-comment">
                <div className="post-comment-header">
                  <Link to={`/app/profile/${c.author?.id}`} className="post-author-link">
                    <div className="directory-card-avatar tiny">
                      {c.author?.avatar ? <img src={c.author.avatar} alt="" /> : <span>{c.author?.name?.[0]}</span>}
                    </div>
                    <span className="poster-name">{c.author?.name}</span>
                    {roleBadge(c.author?.role)}
                  </Link>
                  <span className="post-detail-date">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="post-comment-content">{c.content}</p>
                <div className="post-comment-actions">
                  <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
                    <HiOutlineArrowUturnLeft size={14} /> Reply
                  </button>
                  {(c.author?.id === user?.id || user?.role === 'admin') && (
                    <button onClick={() => handleDeleteComment(c.id)}>
                      <HiOutlineTrash size={14} /> Delete
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyTo === c.id && (
                  <div className="post-reply-form">
                    <input className="onboarding-input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Reply to ${c.author?.name}...`} onKeyDown={e => e.key === 'Enter' && handleReply(c.id)} />
                    <button className="profile-edit-btn" onClick={() => handleReply(c.id)} disabled={submitting || !replyText.trim()}>
                      <HiOutlinePaperAirplane size={14} />
                    </button>
                  </div>
                )}

                {/* Replies */}
                {getReplies(c.id).map(r => (
                  <div key={r.id} className="post-comment reply">
                    <div className="post-comment-header">
                      <Link to={`/app/profile/${r.author?.id}`} className="post-author-link">
                        <div className="directory-card-avatar tiny">
                          {r.author?.avatar ? <img src={r.author.avatar} alt="" /> : <span>{r.author?.name?.[0]}</span>}
                        </div>
                        <span className="poster-name">{r.author?.name}</span>
                      </Link>
                      <span className="post-detail-date">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="post-comment-content">{r.content}</p>
                    {(r.author?.id === user?.id || user?.role === 'admin') && (
                      <div className="post-comment-actions">
                        <button onClick={() => handleDeleteComment(r.id)}><HiOutlineTrash size={14} /> Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
