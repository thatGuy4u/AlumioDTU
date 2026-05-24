import { useEffect, useRef } from 'react';

const steps = [
  { num: 1, title: 'Create Your Profile', desc: 'Sign up as a DTU student or alumni.' },
  { num: 2, title: 'Discover Your Network', desc: 'Browse alumni by batch, department, or industry.' },
  { num: 3, title: 'Connect & Chat', desc: 'Send connection requests, message directly.' },
  { num: 4, title: 'Grow Together', desc: 'Attend events, apply for jobs via referrals.' },
];

export default function HowItWorks() {
  const rowRef = useRef(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const stepEls = el.querySelectorAll('.step');
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

    stepEls.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how">
      <div className="how-inner">
        <div className="section-tag">Simple process</div>
        <h2 className="section-title">Get Connected in Minutes</h2>
        <div className="steps-row" ref={rowRef}>
          {steps.map((s) => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
