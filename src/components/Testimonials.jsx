import { useEffect, useRef } from 'react';

const testimonials = [
  {
    quote: '"Within a week on AlumioDTU I had coffee with three DTU alumni. One of them referred me to my dream company."',
    avatar: 'P',
    name: 'Priya Sharma',
    role: 'Final Year, CS — DTU Delhi',
  },
  {
    quote: '"As a DTU alumni, giving back now feels structured and rewarding. Mentorship dashboard is a game changer."',
    avatar: 'R',
    name: 'Rahul Mehta',
    role: 'Batch of 2018, Google',
  },
  {
    quote: '"The job board with alumni referrals got me three interviews in a month. Absolutely brilliant."',
    avatar: 'A',
    name: 'Aisha Khan',
    role: 'Final Year, ECE — DTU',
  },
];

export default function Testimonials() {
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const cards = el.querySelectorAll('.testi-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal');
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="testimonials">
      <div className="section-tag">Real stories</div>
      <h2 className="section-title">DTU Alumni & Students Love Us</h2>
      <div className="testi-grid" ref={gridRef}>
        {testimonials.map((t, i) => (
          <div className="testi-card" key={i}>
            <p className="testi-quote">{t.quote}</p>
            <div className="testi-author">
              <div className="testi-avatar">{t.avatar}</div>
              <div>
                <div className="testi-name">{t.name}</div>
                <div className="testi-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
