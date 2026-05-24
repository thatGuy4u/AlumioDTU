import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CinematicIntro.css';

const INTRO_LINES = [
  { text: 'Every year, students enter college with ambition...', isFinal: false },
  { text: '...but very little real guidance.', isFinal: false },
  { text: 'Valuable opportunities stay locked inside private circles.', isFinal: false },
  { text: 'Many students never reach their potential...', isFinal: false },
  { text: '...simply because they lacked the right mentorship.', isFinal: false },
  { text: 'AlumioDTU changes that.', isFinal: true },
];

const LINE_DURATION = 3000; 
const TOTAL_DURATION = INTRO_LINES.length * LINE_DURATION;

export default function CinematicIntro({ onComplete }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeoutRef = useRef(null);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 200, 66, ${p.opacity})`;
        ctx.fill();
      });

      // Draw subtle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245, 200, 66, ${0.03 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Line progression
  useEffect(() => {
    if (isExiting) return;

    if (currentLine < INTRO_LINES.length) {
      timeoutRef.current = setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
      }, LINE_DURATION);
    } else {
      // All lines done, begin exit
      timeoutRef.current = setTimeout(() => {
        handleExit();
      }, 400);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentLine, isExiting]);

  const handleExit = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    // Wait for exit animation to complete
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [isExiting, onComplete]);

  const handleSkip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    handleExit();
  }, [handleExit]);

  const progress = Math.min(((currentLine) / INTRO_LINES.length) * 100, 100);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="cinematic-intro"
          key="intro"
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Background orbs */}
          <div className="intro-bg-orb intro-bg-orb--1" />
          <div className="intro-bg-orb intro-bg-orb--2" />
          <div className="intro-bg-orb intro-bg-orb--3" />

          {/* Particle canvas */}
          <canvas ref={canvasRef} className="intro-particles" />

          {/* Text */}
          <div className="intro-text-container">
            <AnimatePresence mode="wait">
              {currentLine < INTRO_LINES.length && (
                <motion.p
                  key={currentLine}
                  className={`intro-line ${INTRO_LINES[currentLine].isFinal ? 'intro-line--final' : ''}`}
                  initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {INTRO_LINES[currentLine].text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Skip button */}
          <motion.button
            className="skip-intro-btn"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            aria-label="Skip intro"
          >
            Skip Intro
          </motion.button>

          {/* Progress bar */}
          <div className="intro-progress" style={{ width: `${progress}%` }} />
        </motion.div>
      ) : (
        /* Exit overlay that fades out */
        <motion.div
          key="exit-overlay"
          className="cinematic-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ pointerEvents: 'none' }}
        >
          <div className="intro-bg-orb intro-bg-orb--1" />
          <div className="intro-bg-orb intro-bg-orb--2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
