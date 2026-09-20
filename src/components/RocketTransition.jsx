import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

/* ───── Smoke particle that trails along the curtain edge ───── */
function SmokeParticle({ delay, x, size, opacity, duration }) {
  return (
    <motion.div
      className="rocket-smoke-particle"
      style={{
        width: size,
        height: size,
        left: `calc(50% + ${x}px)`,
        top: 0,
      }}
      initial={{ opacity: 0, y: 0, scale: 0.2 }}
      animate={{
        opacity: [0, opacity, opacity * 0.7, 0],
        y: [0, 40, 120, 240],
        scale: [0.3, 1.4, 2.8, 5],
        x: [0, x * 0.4, x * 1.5, x * 3],
      }}
      transition={{ duration, delay, ease: 'easeOut' }}
    />
  );
}

/* ───── Spark embers from the exhaust ───── */
function SparkParticle({ delay, angle, speed }) {
  const rad = (angle * Math.PI) / 180;
  const endX = Math.cos(rad) * speed;
  const endY = Math.sin(rad) * speed;

  return (
    <motion.div
      className="rocket-spark"
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: [1, 0.7, 0],
        x: [0, endX * 0.5, endX],
        y: [0, endY * 0.5, endY],
        scale: [1, 0.4, 0],
      }}
      transition={{
        duration: 0.5 + Math.random() * 0.3,
        delay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: 0.3 + Math.random() * 0.4,
      }}
    />
  );
}

/* ───── Twinkling star field ───── */
const stars = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2,
  animDelay: Math.random() * 2,
  animDuration: 1 + Math.random() * 2,
}));

function StarField() {
  return (
    <div className="rocket-starfield">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="rocket-star"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: s.animDuration,
            delay: s.animDelay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ───── Pre-generate particle data (stable across re-renders) ───── */
const smokeData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  delay: i * 0.02,
  x: (Math.random() - 0.5) * 400,
  size: 50 + Math.random() * 130,
  opacity: 0.18 + Math.random() * 0.28,
  duration: 1.4 + Math.random() * 1.2,
}));

const sparkData = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  delay: Math.random() * 0.3,
  angle: 60 + Math.random() * 60,
  speed: 25 + Math.random() * 50,
}));

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function RocketTransition({ isActive, onComplete, userName }) {
  const [visible, setVisible] = useState(false);
  const curtainControls = useAnimationControls();
  const rocketControls = useAnimationControls();
  const completeCalled = useRef(false);

  // Total duration of the single continuous sweep (seconds)
  const TOTAL_DURATION = 4.0;

  const runSequence = useCallback(async () => {
    completeCalled.current = false;
    const vh = window.innerHeight;

    // Rocket: continuous sweep from below viewport → center → above viewport
    // No pauses — one fluid motion with acceleration
    rocketControls.start({
      y: [0, -(vh * 0.55), -(vh * 1.5)],
      transition: {
        duration: TOTAL_DURATION,
        ease: [0.22, 0.68, 0.36, 1],
        times: [0, 0.35, 1],
      },
    });

    // Curtain: dark panel slides up, following behind the rocket
    // Starts slightly after the rocket, sweeps the whole viewport height + extra
    await curtainControls.start({
      y: [0, 0, -(vh * 1.15)],
      transition: {
        duration: TOTAL_DURATION,
        ease: [0.32, 0.72, 0.38, 1],
        times: [0, 0.3, 1],
      },
    });

    // Animation done — fire completion
    if (!completeCalled.current) {
      completeCalled.current = true;
      onComplete?.();
    }
  }, [rocketControls, curtainControls, onComplete, TOTAL_DURATION]);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      // Kick off the animation on next frame so DOM has rendered
      requestAnimationFrame(() => {
        runSequence();
      });
    }
  }, [isActive, runSequence]);

  // Cleanup after exit animation
  const handleExitComplete = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible && !isActive) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isActive && (
        <motion.div
          className="rocket-transition-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* ── Dark curtain that slides up ── */}
          <motion.div
            className="rocket-curtain"
            animate={curtainControls}
            style={{ y: 0 }}
          >
            <StarField />

            {/* Welcome flash text */}
            <motion.div
              className="rocket-launch-text"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 1.05] }}
              transition={{
                duration: TOTAL_DURATION * 0.7,
                times: [0, 0.2, 0.6, 1],
                ease: 'easeInOut',
              }}
            >
              <span className="rocket-welcome-text">
                {userName ? `Welcome, ${userName}!` : 'Launching...'}
              </span>
              <span className="rocket-subtext">Preparing your dashboard</span>
            </motion.div>

            {/* ── Rocket ── */}
            <motion.div
              className="rocket-container"
              animate={rocketControls}
              style={{ y: 0 }}
            >
              <div className="rocket-body">
                <div className="rocket-glow" />

                <svg viewBox="0 0 120 200" width="120" height="200" className="rocket-svg">
                  <defs>
                    <linearGradient id="rktBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e8eaf6" />
                      <stop offset="50%" stopColor="#c5cae9" />
                      <stop offset="100%" stopColor="#9fa8da" />
                    </linearGradient>
                    <linearGradient id="rktNose" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="100%" stopColor="#ee5a24" />
                    </linearGradient>
                    <linearGradient id="rktFin" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#00f2fe" />
                    </linearGradient>
                    <linearGradient id="rktWin" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#74b9ff" />
                      <stop offset="100%" stopColor="#0984e3" />
                    </linearGradient>
                  </defs>
                  <path d="M60 10 L40 60 L80 60 Z" fill="url(#rktNose)" />
                  <rect x="40" y="58" width="40" height="90" rx="4" fill="url(#rktBody)" />
                  <rect x="40" y="70" width="40" height="4" fill="#ff6b6b" opacity="0.6" />
                  <rect x="40" y="130" width="40" height="4" fill="#ff6b6b" opacity="0.6" />
                  <circle cx="60" cy="100" r="12" fill="#0a1628" stroke="#4facfe" strokeWidth="2.5" />
                  <circle cx="60" cy="100" r="8" fill="url(#rktWin)" opacity="0.9" />
                  <circle cx="56" cy="96" r="3" fill="rgba(255,255,255,0.5)" />
                  <path d="M40 130 L20 165 L40 155 Z" fill="url(#rktFin)" />
                  <path d="M80 130 L100 165 L80 155 Z" fill="url(#rktFin)" />
                  <path d="M55 148 L60 170 L65 148 Z" fill="#ff6b6b" />
                </svg>

                {/* Exhaust flame — always on, intensifies */}
                <div className="rocket-exhaust rocket-exhaust--active">
                  <div className="rocket-flame rocket-flame--outer" />
                  <div className="rocket-flame rocket-flame--mid" />
                  <div className="rocket-flame rocket-flame--inner" />
                  <div className="rocket-flame rocket-flame--core" />
                </div>

                {/* Sparks */}
                <div className="rocket-sparks-container">
                  {sparkData.map((s) => (
                    <SparkParticle key={s.id} {...s} />
                  ))}
                </div>

                {/* Smoke — trails beneath the exhaust */}
                <div className="rocket-smoke-container">
                  {smokeData.map((p) => (
                    <SmokeParticle key={p.id} {...p} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Curtain bottom edge glow ── */}
            <div className="rocket-curtain-edge" />
          </motion.div>

          {/* ── Bright reveal layer behind the curtain ── */}
          <div className="rocket-reveal-layer" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
