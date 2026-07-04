import { useEffect, useRef } from 'react';

const features = [
  {
    icon: '🔗',
    title: 'Smart Alumni Matching',
    desc: 'Filter alumni by batch year, department, company, and city — find the right person to connect with in seconds.',
    tag: 'Precision Search',
  },
  {
    icon: '🎯',
    title: 'Mentorship Hub',
    desc: 'Structured 1-on-1 mentorship programs with scheduling, goal tracking, and session notes.',
    tag: 'Structured Programs',
  },
  {
    icon: '💼',
    title: 'Exclusive Job Board',
    desc: 'Alumni-posted jobs, referrals, and internships exclusive to the DTU network.',
    tag: 'Referral Network',
  },
  {
    icon: '📅',
    title: 'Events & Reunions',
    desc: 'Virtual and in-person event management — from networking dinners to global alumni meets.',
    tag: 'Virtual & IRL',
  },
  {
    icon: '💬',
    title: 'Community Forums',
    desc: 'Domain-specific discussion boards for career advice, startup ideas, and research collaboration.',
    tag: 'Niche Boards',
  },
  {
    icon: '🗺️',
    title: 'Alumni World Map',
    desc: 'Visualize where your DTU network is spread across the globe. Find alumni in your city.',
    tag: 'Interactive Globe',
  },
];

export default function Features() {
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const cards = el.querySelectorAll('.feature-card');
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
    return () => observer.disconnect();
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
          <div className="feature-card" key={i}>
            <div className="feature-icon-wrap">
              <div className="feature-icon">{f.icon}</div>
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <span className="feature-tag">{f.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
