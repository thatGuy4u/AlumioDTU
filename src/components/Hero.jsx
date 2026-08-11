import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MovingBorderButton from './MovingBorderButton';
import ShineButton from './ShineButton';
import dtuCampusImg from '../assets/dtu-campus.jpg';

export default function Hero({ onOpenModal }) {
  const statsRef = useRef(null);
  const [countersStarted, setCountersStarted] = useState(false);

  // Counter animation on scroll
  useEffect(() => {
    const statsEl = statsRef.current;
    if (!statsEl) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const statNums = statsEl.querySelectorAll('.stat-num');
          statNums.forEach((el) => {
            const target = parseInt(el.dataset.target);
            let current = 0;
            const inc = target / 80;
            const interval = setInterval(() => {
              current = Math.min(current + inc, target);
              el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '+');
              if (current >= target) clearInterval(interval);
            }, 20);
          });
          observer.disconnect();
        }
      });
    });
    observer.observe(statsEl);

    return () => observer.disconnect();
  }, [countersStarted]);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
  });

  return (
    <section id="hero">
      {/* Blended campus background */}
      <div className="hero-campus-bg" style={{ backgroundImage: `url(${dtuCampusImg})` }} />
      <div className="hero-content">
        <motion.div className="hero-dtu-badge" {...fadeUp(0)}>
          <span className="dtu-dot" />
          <span>Delhi Technological University</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
        >
          Connect Today.<br />
          Lead Tomorrow.
        </motion.h1>

        <motion.p className="hero-sub" {...fadeUp(0.2)}>
          Where the DTU bond continues beyond campus. Connect, mentor & grow together.
        </motion.p>

        <motion.div className="hero-cta" {...fadeUp(0.35)}>
          <MovingBorderButton onClick={() => onOpenModal('signup')}>
            Join Your Network
            <span className="btn-arrow">→</span>
          </MovingBorderButton>
          <ShineButton onClick={() => onOpenModal('login')}>
            Alumni? Log In
          </ShineButton>
        </motion.div>

        <motion.div className="dtu-highlight" {...fadeUp(0.45)}>
          <div className="dtu-hi-item">
            <span className="dot" />Est. 1941 · Rohini, Delhi
          </div>
          <div className="dtu-hi-item">
            <span className="dot" />Formerly Delhi College of Engineering (DCE)
          </div>
        </motion.div>

        <motion.div
          className="stats-strip"
          ref={statsRef}
          {...fadeUp(0.55)}
        >
          <div className="stat-item">
            <div className="stat-num" data-target="2000" data-suffix="+">0</div>
            <div className="stat-label">Alumni Connected</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" data-target="100" data-suffix="+">0</div>
            <div className="stat-label">Mentorships Formed</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" data-target="40" data-suffix="+">0</div>
            <div className="stat-label">Referrals Given</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" data-target="93" data-suffix="%">0</div>
            <div className="stat-label">Would Recommend</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span>Scroll</span>
        <div className="scroll-arrow">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="6" y="0" width="4" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
            <path d="M8 16 L2 10 M8 16 L14 10" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
