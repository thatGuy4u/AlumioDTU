import { useEffect, useRef, useState } from 'react';

const phrases = ['Connect with Alumni.', 'Find Your Mentor.', 'Land That Referral.', 'Build Your Legacy.'];

export default function Hero({ onOpenModal }) {
  const typedRef = useRef(null);
  const statsRef = useRef(null);
  const [countersStarted, setCountersStarted] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;

    let pi = 0, ci = 0, deleting = false;
    let timeout;

    function typeLoop() {
      const current = phrases[pi];
      if (!deleting) {
        el.innerHTML = '<span class="accent">' + current.slice(0, ci + 1) + '</span>';
        ci++;
        if (ci === current.length) {
          deleting = true;
          timeout = setTimeout(typeLoop, 1800);
          return;
        }
      } else {
        el.innerHTML = '<span class="accent">' + current.slice(0, ci - 1) + '</span>';
        ci--;
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      timeout = setTimeout(typeLoop, deleting ? 42 : 80);
    }
    typeLoop();

    return () => clearTimeout(timeout);
  }, []);

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
              el.textContent = Math.floor(current).toLocaleString() + (el.dataset.target === '92' ? '%' : '+');
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

  return (
    <section id="hero">
      <div className="hero-dtu-badge">
        <span className="dtu-dot"></span>Delhi Technological University
      </div>
      <h1 className="hero-title">
        <span ref={typedRef} id="typed-text"></span>
        <span className="cursor" id="cursor"></span>
      </h1>
      <p className="hero-sub">
        Where the DTU bond continues beyond campus. Connect, mentor, grow — together.
      </p>
      <div className="hero-cta">
        <button className="btn-primary" onClick={() => onOpenModal('signup')}>Join Your Network →</button>
        <button className="btn-ghost" onClick={() => onOpenModal('login')}>Alumni? Log In</button>
      </div>
      <div className="dtu-highlight">
        <div className="dtu-hi-item"><span className="dot"></span>Est. 1941 · Rohini, Delhi</div>
        <div className="dtu-hi-item"><span className="dot"></span>Formerly Delhi College of Engineering (DCE)</div>
      </div>
      <div className="stats-strip" ref={statsRef}>
        <div className="stat-item">
          <div className="stat-num" data-target="2000">0</div>
          <div className="stat-label">Alumni Connected</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="100">0</div>
          <div className="stat-label">Mentorships Formed</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="40">0</div>
          <div className="stat-label">Referrals</div>
        </div>
        <div className="stat-item">
          <div className="stat-num" data-target="92">0</div>
          <div className="stat-label">% Would Recommend</div>
        </div>
      </div>
      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="arrow"></div>
      </div>
    </section>
  );
}
