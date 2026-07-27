import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import {
  HiOutlineArrowLeft, HiOutlineHandThumbUp, HiHandThumbUp,
  HiOutlineChatBubbleOvalLeft,
  HiOutlinePaperAirplane, HiOutlineTrash, HiOutlineArrowUturnLeft,
  HiOutlineFlag,
} from 'react-icons/hi2';
import ReportModal from '../../components/ReportModal';

const categoryLabels = { placements: '🎯 Placements', internships: '💼 Internships', higher_studies: '🎓 Higher Studies', startups: '🚀 Startups', general: '💬 General' };

// ─── Role badge helper (stable, outside component) ───
function RoleBadge({ role }) {
  if (role === 'alumni') return <span className="topbar-role-badge role-alumni">Alumni</span>;
  if (role === 'admin') return <span className="topbar-role-badge role-admin">Admin</span>;
  return <span className="topbar-role-badge role-student">Student</span>;
}

// ─── Single Comment (extracted, stable component) ───
function CommentItem({ comment, userId, userRole, onReply, onDelete }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText);
    setReplyText('');
    setShowReply(false);
    setSubmitting(false);
  };

  // Soft-deleted comment — show placeholder, preserve thread structure
  if (comment.isDeleted) {
    const byAdmin = comment.content === '[deleted by admin]';
    return (
      <div className={`post-comment deleted ${byAdmin ? 'deleted-by-admin' : ''}`}>
        <div className="post-comment-header">
          <span className="deleted-comment-label">{byAdmin ? '🛡️ [removed]' : '🗑️ [deleted]'}</span>
        </div>
        <p className="post-comment-content deleted-text">
          {byAdmin ? 'This comment has been removed by a moderator' : 'This comment has been deleted by the user'}
        </p>
      </div>
    );
  }

  return (
    <div className="post-comment">
      <div className="post-comment-header">
        <Link to={`/app/profile/${comment.author?.id}`} className="post-author-link">
          <div className="directory-card-avatar tiny">
            {comment.author?.avatar ? <img src={comment.author.avatar} alt="" /> : <span>{comment.author?.name?.[0]}</span>}
          </div>
          <span className="poster-name">{comment.author?.name}</span>
          <RoleBadge role={comment.author?.role} />
        </Link>
        <span className="post-detail-date">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
      </div>
      <p className="post-comment-content">{comment.content}</p>
      <div className="post-comment-actions">
        <button onClick={() => setShowReply(!showReply)}>
          <HiOutlineArrowUturnLeft size={14} /> Reply
        </button>
        {(comment.author?.id === userId || userRole === 'admin') && (
          <button onClick={() => onDelete(comment.id)}>
            <HiOutlineTrash size={14} /> Delete
          </button>
        )}
        {comment.author?.id !== userId && (
          <button className="report-btn" onClick={() => setShowReport(true)}>
            <HiOutlineFlag size={14} /> Report
          </button>
        )}
      </div>

      {/* Reply form — state is LOCAL to this component, no parent re-render on keystroke */}
      {showReply && (
        <div className="post-reply-form">
          <input
            className="onboarding-input"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author?.name}...`}
            onKeyDown={e => e.key === 'Enter' && handleSubmitReply()}
            autoFocus
          />
          <button className="profile-edit-btn" onClick={handleSubmitReply} disabled={submitting || !replyText.trim()}>
            <HiOutlinePaperAirplane size={14} />
          </button>
        </div>
      )}

      {/* Report modal for this comment */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        contentType="comment"
        contentId={comment.id}
        targetName={`${comment.author?.name}'s comment`}
      />
    </div>
  );
}

// ─── Recursive comment thread (extracted, stable component) ───
function CommentThread({ comment, allComments, userId, userRole, onReply, onDelete, depth = 0 }) {
  const children = allComments.filter(c => c.parentCommentId === comment.id);

  return (
    <div className={`comment-thread depth-${Math.min(depth, 6)}`}>
      <CommentItem
        comment={comment}
        userId={userId}
        userRole={userRole}
        onReply={onReply}
        onDelete={onDelete}
      />

      {children.length > 0 && (
        <div className="comment-children">
          {children.map(child => (
            <CommentThread
              key={child.id}
              comment={child}
              allComments={allComments}
              userId={userId}
              userRole={userRole}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ───
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
  const [submitting, setSubmitting] = useState(false);
  const [showReportPost, setShowReportPost] = useState(false);

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

  // Callback for nested replies — stable reference via useCallback
  const handleReply = useCallback(async (parentId, replyContent) => {
    try {
      const res = await axios.post(`${API_URL}/community/posts/${postId}/comments`, { content: replyContent, parentCommentId: parentId }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => [...prev, res.data.data]);
      setPost(p => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
    } catch { toast.error('Failed'); }
  }, [postId, token]);

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      const res = await axios.delete(`${API_URL}/community/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      const wasSoftDeleted = res.data.data?.softDeleted;

      if (wasSoftDeleted) {
        // Soft-delete: mark as deleted in state, keep in array to preserve thread hierarchy
        const deletedContent = res.data.data?.deletedByAdmin ? '[deleted by admin]' : '[deleted]';
        setComments(prev => prev.map(c =>
          c.id === commentId
            ? { ...c, isDeleted: true, content: deletedContent, author: null }
            : c
        ));
      } else {
        // Hard-delete: remove from array (and any orphaned children)
        setComments(prev => {
          const idsToRemove = new Set();
          const collectIds = (id) => {
            idsToRemove.add(id);
            prev.filter(c => c.parentCommentId === id).forEach(c => collectIds(c.id));
          };
          collectIds(commentId);
          return prev.filter(c => !idsToRemove.has(c.id));
        });
      }

      setPost(p => ({ ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }));
      toast.success('Comment deleted');
    } catch { toast.error('Failed'); }
  }, [token]);

  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;
  if (!post) return null;

  const topLevel = comments.filter(c => !c.parentCommentId);

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
                <RoleBadge role={post.author?.role} />
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
            {hasUpvoted ? <HiHandThumbUp size={18} /> : <HiOutlineHandThumbUp size={18} />}
            <span>{post.upvoteCount || 0} Upvote{post.upvoteCount !== 1 ? 's' : ''}</span>
          </button>
          <span className="post-action-btn disabled">
            <HiOutlineChatBubbleOvalLeft size={18} />
            <span>{post.commentCount || 0} Comment{post.commentCount !== 1 ? 's' : ''}</span>
          </span>
          {post.author?.id !== user?.id && (
            <button className="post-action-btn" onClick={() => setShowReportPost(true)}>
              <HiOutlineFlag size={18} />
              <span>Report</span>
            </button>
          )}
        </div>

        {/* Report Post Modal */}
        <ReportModal
          isOpen={showReportPost}
          onClose={() => setShowReportPost(false)}
          contentType="post"
          contentId={post.id}
          targetName={post.title}
        />

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

          {/* Threaded Comments — Reddit-style */}
          <div className="post-comments-list">
            {topLevel.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No comments yet. Be the first!</p>
            )}
            {topLevel.map(c => (
              <CommentThread
                key={c.id}
                comment={c}
                allComments={comments}
                userId={user?.id}
                userRole={user?.role}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                depth={0}
              />
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
