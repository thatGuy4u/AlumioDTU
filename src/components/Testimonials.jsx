import { useEffect, useRef } from 'react';
import ThreeDMarquee from './ThreeDMarquee';

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

// Text snippets for the 3D marquee grid — reviews, stats, praise
const marqueeTexts = [
  '"Best alumni platform I\'ve ever used. Period."',
  '"Got my first referral within 48 hours of signing up."',
  '2000+ alumni connected worldwide',
  '"The mentorship program changed my career trajectory."',
  '"Finally a platform that actually works for DTU grads."',
  '100+ mentorships formed this year',
  '"I found my co-founder through AlumioDTU."',
  '"Networking has never been this easy."',
  '93% would recommend to a friend',
  '"The events feature is absolutely top-notch."',
  '"Real connections, not just LinkedIn adds."',
  '40+ referrals given last month',
  '"As a 2015 batch alumni, I love giving back."',
  '"The community forums are incredibly active."',
  '"Job board is leagues ahead of anything else."',
  '"Connected with 5 seniors in my first week."',
  '"DTU network is now truly global."',
  '"Mentorship dashboard is pure brilliance."',
  '"Got an internship at Google through this."',
  '"The UI is gorgeous. Very premium feel."',
  '"Wish we had this when I was in college."',
  '"Every DTU student needs this platform."',
  '"Alumni world map is such a cool feature."',
  '"Finally reconnected with my batchmates."',
  '"The structured mentorship is a game changer."',
  '"From campus to career — AlumioDTU bridges it."',
  '"Events and reunions are now so easy to organize."',
  '"My mentor from here helped me ace my interviews."',
  '"Transparent, efficient, and beautifully designed."',
  '"This is what alumni relations should look like."',
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
            const index = Array.from(cards).indexOf(e.target);
            e.target.style.transitionDelay = `${index * 0.1}s`;
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
      <div className="section-header">
        <span className="section-tag">Real stories</span>
        <h2 className="section-title">DTU Alumni & Students Love Us</h2>
      </div>

      {/* 3D Marquee with text cards */}
      <div style={{ marginBottom: '56px' }}>
        <ThreeDMarquee texts={marqueeTexts} />
      </div>

      <div className="testi-grid" ref={gridRef}>
        {testimonials.map((t, i) => (
          <div className="testi-card" key={i}>
            <div className="testi-quote-mark">"</div>
            <p className="testi-quote">{t.quote}</p>
            <div className="testi-author">
              <div className="testi-avatar-ring">
                <div className="testi-avatar">{t.avatar}</div>
              </div>
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
