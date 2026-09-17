import { useEffect, useRef } from 'react';

const features = [
  {
    icon: '🔗',
    title: 'Smart Alumni Matching',
    desc: 'Filter alumni by batch year, department, company, and city — find the right person to connect with in seconds.',
    tag: 'Precision Search',
    bg: '/images/features/matching.jpg',
  },
  {
    icon: '🎯',
    title: 'Mentorship Hub',
    desc: 'Structured 1-on-1 mentorship programs with scheduling, goal tracking, and session notes.',
    tag: 'Structured Programs',
    bg: '/images/features/mentorship.jpg',
  },
  {
    icon: '💼',
    title: 'Exclusive Job Board',
    desc: 'Alumni-posted jobs, referrals, and internships exclusive to the DTU network.',
    tag: 'Referral Network',
    bg: '/images/features/jobs.jpg',
  },
  {
    icon: '📅',
    title: 'Events & Reunions',
    desc: 'Virtual and in-person event management — from networking dinners to global alumni meets.',
    tag: 'Virtual & IRL',
    bg: '/images/features/events.jpg',
  },
  {
    icon: '💬',
    title: 'Community Forums',
    desc: 'Domain-specific discussion boards for career advice, startup ideas, and research collaboration.',
    tag: 'Niche Boards',
    bg: '/images/features/forums.jpg',
  },
  {
    icon: '🗺️',
    title: 'Alumni World Map',
    desc: 'Visualize where your DTU network is spread across the globe. Find alumni in your city.',
    tag: 'Interactive Globe',
    bg: '/images/features/worldmap.jpg',
  },
];

export default function Features() {
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const cards = el.querySelectorAll('.feature-card-container');

    /* ---- Equalize card heights across all rows ---- */
    const equalizeHeights = () => {
      cards.forEach((c) => (c.style.minHeight = ''));   // reset first
      let maxH = 0;
      cards.forEach((c) => { maxH = Math.max(maxH, c.scrollHeight); });
      cards.forEach((c) => (c.style.minHeight = `${maxH}px`));
    };
    equalizeHeights();
    window.addEventListener('resize', equalizeHeights);

    /* ---- Scroll-reveal observer ---- */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Stagger the reveal based on the card's index
            const index = Array.from(cards).indexOf(e.target);
            e.target.style.transitionDelay = `${index * 0.08}s`;
            e.target.classList.add('reveal');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    cards.forEach((card) => observer.observe(card));

    /* ---- Mobile auto-flip on scroll ---- */
    const isMobile = () => window.innerWidth < 768;
    let flipObserver = null;

    const setupFlipObserver = () => {
      // Clean up any previous observer
      if (flipObserver) {
        flipObserver.disconnect();
        cards.forEach((c) => c.classList.remove('flipped'));
      }

      if (!isMobile()) return;

      flipObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('flipped');
            } else {
              e.target.classList.remove('flipped');
            }
          });
        },
        { threshold: 0.6 }
      );

      cards.forEach((card) => flipObserver.observe(card));
    };

    setupFlipObserver();
    window.addEventListener('resize', setupFlipObserver);

    return () => {
      observer.disconnect();
      if (flipObserver) flipObserver.disconnect();
      window.removeEventListener('resize', equalizeHeights);
      window.removeEventListener('resize', setupFlipObserver);
    };
  }, []);

  return (
    <section id="features">
      <div className="section-header">
        <span className="section-tag">What we offer</span>
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-desc">
          AlumioDTU bridges the gap between graduating students and the powerful DTU alumni community.
        </p>
      </div>
      <div className="features-grid" ref={gridRef}>
        {features.map((f, i) => (
          <div className="feature-card-container" key={i}>
            <div className="feature-card">
              {/* Front face — icon + title only */}
              <div className="feature-card-front">
                <img src={f.bg} alt="" className="feature-card-bg" loading="lazy" />
                <div className="feature-icon-wrap">
                  <div className="feature-icon">{f.icon}</div>
                </div>
                <h3>{f.title}</h3>
              </div>
              {/* Back face — full details */}
              <div className="feature-card-back">
                <img src={f.bg} alt="" className="feature-card-bg" loading="lazy" />
                <div className="feature-icon-wrap">
                  <div className="feature-icon">{f.icon}</div>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-tag">{f.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
