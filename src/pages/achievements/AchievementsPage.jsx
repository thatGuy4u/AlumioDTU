import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineTrophy, HiOutlineSparkles } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AchievementsPage() {
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab] = useState('my');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (tab === 'my') {
          const res = await axios.get(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
          setAchievements(res.data.data.achievements || []);
        } else {
          const res = await axios.get(`${API_URL}/users/leaderboard?limit=20`, { headers: { Authorization: `Bearer ${token}` } });
          setLeaderboard(res.data.data.leaderboard || []);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [tab, token]);

  const totalPoints = achievements.reduce((s, a) => s + (a.points || 0), 0);

  return (
    <div className="achievements-page">
      <div className="directory-header">
        <div><h1><HiOutlineTrophy style={{ display: 'inline' }} /> <span className="text-gold">Achievements</span></h1><p>Track your progress and see how you stack up</p></div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Badges</button>
        <button className={`tab-btn ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>Leaderboard</button>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <motion.div variants={container} initial="hidden" animate="show">
          {tab === 'my' && (
            <>
              {/* Total Points Banner */}
              <motion.div className="achievements-banner" variants={item}>
                <HiOutlineSparkles size={28} className="text-gold" />
                <div><h2>{totalPoints} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>points earned</span></h2><p>{achievements.length} badge{achievements.length !== 1 ? 's' : ''} unlocked</p></div>
              </motion.div>

              <div className="achievements-grid">
                {achievements.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No achievements yet. Start engaging with the community to earn badges!</p>}
                {achievements.map((a, i) => (
                  <motion.div key={a.id || i} className="achievement-card" variants={item}>
                    <div className="achievement-icon">{a.icon || '🏅'}</div>
                    <h3>{a.title}</h3>
                    <p>{a.description}</p>
                    <span className="achievement-pts">+{a.points} pts</span>
                    <span className="achievement-date">{new Date(a.earnedAt).toLocaleDateString()}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {tab === 'leaderboard' && (
            <div className="leaderboard">
              {leaderboard.map((entry, i) => (
                <motion.div key={entry.userId} className={`leaderboard-row ${entry.userId === user?.id ? 'is-me' : ''}`} variants={item}>
                  <span className="leaderboard-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <div className="leaderboard-avatar">{entry.user?.avatar ? <img src={entry.user.avatar} alt="" /> : <span>{entry.user?.name?.[0]}</span>}</div>
                  <div className="leaderboard-info">
                    <strong>{entry.user?.name} {entry.userId === user?.id ? '(You)' : ''}</strong>
                    <span className={`topbar-role-badge role-${entry.user?.role}`}>{entry.user?.role}</span>
                  </div>
                  <div className="leaderboard-stats">
                    <span className="leaderboard-points">{entry.totalPoints} pts</span>
                    <span className="leaderboard-badges">{entry.badgeCount} badges</span>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No leaderboard data yet.</p>}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
