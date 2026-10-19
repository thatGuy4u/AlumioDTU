import { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineXMark,
} from 'react-icons/hi2';
import './OnboardingTour.css';

const TOUR_STORAGE_KEY = 'alumiodtu_tour_completed';

/* ─── Step definitions ─────────────────────────────────── */
const BW_ACCENT = 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))';

const tourSteps = [
  {
    id: 'welcome',
    type: 'modal',
    title: 'Welcome to AlumioDTU',
    description: "Let's take a quick tour to show you around — it only takes a minute.",
    accent: BW_ACCENT,
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Navigation',
    description: 'Your command center — every feature is one click away.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'dashboard',
    target: '[data-tour="link-dashboard"]',
    title: 'Dashboard',
    description: 'Activity stats, upcoming events, and quick actions in one place.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'profile',
    target: '[data-tour="link-profile"]',
    title: 'Profile',
    description: 'Showcase your skills, experience, and achievements.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'directory',
    target: '[data-tour="link-directory"]',
    title: 'Directory',
    description: 'Browse and connect with alumni and students.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'mentorship',
    target: '[data-tour="link-mentorship"]',
    title: 'Mentorship',
    description: 'Find mentors or become one for career guidance.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'messages',
    target: '[data-tour="link-messages"]',
    title: 'Messages',
    description: 'Real-time private chat with the community.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'jobs',
    target: '[data-tour="link-jobs"]',
    title: 'Jobs & Internships',
    description: 'Exclusive opportunities shared by DTU alumni.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'community',
    target: '[data-tour="link-community"]',
    title: 'Community',
    description: 'Discussions, knowledge sharing, and networking.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'events',
    target: '[data-tour="link-events"]',
    title: 'Events',
    description: 'Reunions, workshops, webinars, and more.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'achievements',
    target: '[data-tour="link-achievements"]',
    title: 'Achievements',
    description: 'Earn badges and get recognized for contributions.',
    position: 'right',
    accent: BW_ACCENT,
  },
  {
    id: 'search',
    target: '[data-tour="search"]',
    title: 'Search',
    description: 'Find alumni, jobs, events — instantly from anywhere.',
    position: 'bottom',
    accent: BW_ACCENT,
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    description: 'Real-time alerts for messages, events, and more.',
    position: 'bottom-end',
    accent: BW_ACCENT,
  },
  {
    id: 'theme',
    target: '[data-tour="theme-toggle"]',
    title: 'Theme',
    description: 'Switch between dark and light mode.',
    position: 'bottom-end',
    accent: BW_ACCENT,
  },
  {
    id: 'complete',
    type: 'modal',
    title: "You're All Set",
    description: "Start exploring AlumioDTU. Happy connecting!",
    accent: BW_ACCENT,
  },
];

/* ─── Helpers ──────────────────────────────────────────── */
function getTooltipPosition(targetEl, position) {
  if (!targetEl) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const rect = targetEl.getBoundingClientRect();
  const gap = 14;
  const tooltipWidth = 300;
  const tooltipHeight = 180;

  switch (position) {
    case 'right':
      return {
        top: `${Math.max(16, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - 16))}px`,
        left: `${Math.max(16, Math.min(rect.right + gap, window.innerWidth - tooltipWidth - 16))}px`,
      };
    case 'left':
      return {
        top: `${Math.max(16, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - 16))}px`,
        left: `${Math.max(16, rect.left - tooltipWidth - gap)}px`,
      };
    case 'bottom':
      return {
        top: `${Math.max(16, Math.min(rect.bottom + gap, window.innerHeight - tooltipHeight - 16))}px`,
        left: `${Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16))}px`,
      };
    case 'bottom-end':
      return {
        top: `${Math.max(16, Math.min(rect.bottom + gap, window.innerHeight - tooltipHeight - 16))}px`,
        left: `${Math.max(16, Math.min(rect.right - tooltipWidth, window.innerWidth - tooltipWidth - 16))}px`,
      };
    case 'top':
      return {
        top: `${Math.max(16, rect.top - tooltipHeight - gap)}px`,
        left: `${Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16))}px`,
      };
    default:
      return {
        top: `${Math.max(16, Math.min(rect.bottom + gap, window.innerHeight - tooltipHeight - 16))}px`,
        left: `${Math.max(16, Math.min(rect.left, window.innerWidth - tooltipWidth - 16))}px`,
      };
  }
}

/* ─── Spotlight SVG overlay ────────────────────────────── */
function SpotlightOverlay({ targetEl }) {
  if (!targetEl) return null;

  const rect = targetEl.getBoundingClientRect();
  const padding = 8;
  const x = rect.left - padding;
  const y = rect.top - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;
  const r = 12;

  return (
    <svg className="tour-spotlight-svg" width="100%" height="100%">
      <defs>
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={r} ry={r} fill="black" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.72)"
        mask="url(#tour-spotlight-mask)"
      />
      {/* Animated glow ring around the spotlighted element */}
      <rect
        className="tour-spotlight-ring"
        x={x - 2}
        y={y - 2}
        width={w + 4}
        height={h + 4}
        rx={r + 2}
        ry={r + 2}
        fill="none"
        stroke="url(#tour-ring-gradient)"
        strokeWidth="2"
      />
      <defs>
        <linearGradient id="tour-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Main Tour Component ─────────────────────────────── */
export default function OnboardingTour() {
  const user = useSelector(selectCurrentUser);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetEl, setTargetEl] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({});
  const tooltipRef = useRef(null);

  const userId = user?.id || user?._id;

  // Listen for manual trigger to restart tour
  useEffect(() => {
    const handleStart = () => {
      setCurrentStep(0);
      setIsActive(true);
    };
    window.addEventListener('start-onboarding-tour', handleStart);
    return () => window.removeEventListener('start-onboarding-tour', handleStart);
  }, []);

  // Check if tour should auto-show for first-time users
  useEffect(() => {
    if (!userId) return;
    const completedKey = `${TOUR_STORAGE_KEY}_${userId}`;
    const completed = localStorage.getItem(completedKey);
    if (!completed) {
      // Small delay so the layout paints first
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  // Position the tooltip whenever the step or window size changes
  const updatePosition = useCallback(() => {
    const step = tourSteps[currentStep];
    if (!step || step.type === 'modal') {
      setTargetEl(null);
      setTooltipPos({});
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      setTargetEl(el);
      setTooltipPos(getTooltipPosition(el, step.position));
      // Scroll into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setTargetEl(null);
      setTooltipPos({});
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return undefined;
    const rafId = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, updatePosition]);

  const completeTour = useCallback(() => {
    if (userId) {
      localStorage.setItem(`${TOUR_STORAGE_KEY}_${userId}`, 'true');
    }
    setIsActive(false);
    setCurrentStep(0);
  }, [userId]);

  const handleNext = useCallback(() => {
    let next = currentStep + 1;
    // Skip steps whose target element doesn't exist
    while (next < tourSteps.length) {
      const s = tourSteps[next];
      if (s.type === 'modal' || !s.target || document.querySelector(s.target)) break;
      next++;
    }
    if (next < tourSteps.length) {
      setCurrentStep(next);
    } else {
      completeTour();
    }
  }, [currentStep, completeTour]);

  const handlePrev = useCallback(() => {
    let prev = currentStep - 1;
    // Skip steps whose target element doesn't exist
    while (prev >= 0) {
      const s = tourSteps[prev];
      if (s.type === 'modal' || !s.target || document.querySelector(s.target)) break;
      prev--;
    }
    if (prev >= 0) {
      setCurrentStep(prev);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeTour();
  }, [completeTour]);

  // Keyboard navigation: Esc to skip, Arrow keys to navigate
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') completeTour();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, completeTour, handleNext, handlePrev]);

  const handleDotClick = (index) => {
    setCurrentStep(index);
  };

  if (!isActive) return null;

  const visibleSteps = tourSteps.filter(
    (s) => s.type === 'modal' || !s.target || !!document.querySelector(s.target)
  );
  const step = tourSteps[currentStep] || visibleSteps[0];
  const isModal = step?.type === 'modal';
  const visibleIndex = visibleSteps.findIndex((s) => s.id === step?.id);
  const currentNum = visibleIndex >= 0 ? visibleIndex + 1 : currentStep + 1;
  const totalNum = visibleSteps.length || tourSteps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = visibleIndex === visibleSteps.length - 1 || currentStep === tourSteps.length - 1;
  const progress = (currentNum / totalNum) * 100;

  return (
    <AnimatePresence>
      {isActive && step && (
        <Motion.div
          className="tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dark backdrop with spotlight cutout */}
          {!isModal && targetEl ? (
            <SpotlightOverlay targetEl={targetEl} />
          ) : (
            <div className="tour-modal-backdrop" />
          )}

          {/* Tooltip / Modal card */}
          <AnimatePresence mode="wait">
            <Motion.div
              key={step.id}
              ref={tooltipRef}
              className={`tour-card ${isModal ? 'tour-card--modal' : 'tour-card--tooltip'}`}
              style={!isModal ? tooltipPos : undefined}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Top accent bar */}
              <div className="tour-card-accent" style={{ background: step.accent }} />

              {/* Close / Skip button */}
              <button
                type="button"
                className="tour-close-btn"
                onClick={handleSkip}
                title="Skip tour"
              >
                <HiOutlineXMark size={18} />
              </button>

              {/* Content */}
              <h3 className="tour-card-title">{step.title}</h3>
              <p className="tour-card-desc">{step.description}</p>

              {/* Progress bar */}
              <div className="tour-progress-bar">
                <Motion.div
                  className="tour-progress-fill"
                  style={{ background: step.accent }}
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Step dots */}
              <div className="tour-dots">
                {visibleSteps.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tour-dot ${s.id === step.id ? 'active' : ''} ${i < visibleIndex ? 'completed' : ''}`}
                    onClick={() => {
                      const idx = tourSteps.findIndex((ts) => ts.id === s.id);
                      if (idx >= 0) handleDotClick(idx);
                    }}
                    title={`Step ${i + 1}: ${s.title}`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="tour-nav">
                <button
                  type="button"
                  className="tour-btn tour-btn--skip"
                  onClick={handleSkip}
                >
                  Skip Tour
                </button>

                <div className="tour-nav-main">
                  {!isFirstStep && (
                    <button
                      type="button"
                      className="tour-btn tour-btn--prev"
                      onClick={handlePrev}
                    >
                      <HiOutlineArrowLeft size={16} />
                      Back
                    </button>
                  )}

                  <button
                    type="button"
                    className="tour-btn tour-btn--next"
                    onClick={handleNext}
                    style={{ background: step.accent }}
                  >
                    {isFirstStep
                      ? "Let's Go!"
                      : isLastStep
                        ? 'Finish'
                        : 'Next'}
                    <HiOutlineArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Step counter */}
              <span className="tour-step-counter">
                {currentNum} / {totalNum}
              </span>
            </Motion.div>
          </AnimatePresence>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
