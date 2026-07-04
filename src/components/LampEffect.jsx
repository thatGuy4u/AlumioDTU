import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LampEffect({ children }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Inject smooth pulse for the spotlight (optional, can be removed)
  useEffect(() => {
    const styleId = 'lamp-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes lamp-glow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.lampWrapper}>
        {/* Top dark gradient – lamp appears from pure black */}
        <div style={styles.topDarkness} />

        {/* Sharp horizontal beam */}
        <motion.div
          initial={{ width: '0rem', opacity: 0, x: '-50%' }}
          animate={inView ? { width: '30rem', opacity: 1, x: '-50%' } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={styles.beamLine}
        />

        {/* Light cone – sharp at top, fading downward */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.3, x: '-50%' }}
          animate={inView ? { opacity: 1, scaleX: 1, x: '-50%' } : {}}
          transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
          style={styles.lightCone}
        />

        {/* Additional focused spotlight (pulsing) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
          animate={inView ? { opacity: 1, scale: 1, x: '-50%' } : {}}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          style={styles.spotlight}
        />

        {/* Bottom fade – light seamlessly melts into background */}
        <div style={styles.bottomFade} />
      </div>

      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#000000',
    zIndex: 1,
  },
  lampWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  topDarkness: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '120px',
    background: 'linear-gradient(to bottom, #000000 60%, transparent 100%)',
    zIndex: 4,
  },
  beamLine: {
    position: 'absolute',
    top: '80px',
    left: '50%',
    height: '1px',                // ultra‑thin core
    background: '#ffffff',
    borderRadius: '1px',
    boxShadow:
      '0 0 20px 4px rgba(255,255,255,0.8), 0 0 60px 10px rgba(255,255,255,0.5), 0 0 120px 20px rgba(255,255,255,0.3)',
    zIndex: 5,
  },
  lightCone: {
    position: 'absolute',
    top: '60px',
    left: '50%',
    width: '900px',
    height: '75vh',
    background:
      'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.02) 55%, transparent 75%)',
    zIndex: 1,
  },
  spotlight: {
    position: 'absolute',
    top: '50px',
    left: '50%',
    width: '500px',
    height: '400px',
    borderRadius: '50%',
    background:
      'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)',
    filter: 'blur(20px)',
    animation: 'lamp-glow 4s ease-in-out infinite',
    zIndex: 2,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, #000000 0%, transparent 100%)',
    zIndex: 3,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
  },
};