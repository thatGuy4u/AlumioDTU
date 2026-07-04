import { useEffect, useRef } from 'react';

const steps = [
  { num: 1, title: 'Create Your Profile', desc: 'Sign up as a DTU student or alumni and build your presence.' },
  { num: 2, title: 'Discover Your Network', desc: 'Browse alumni by batch, department, or industry to find your match.' },
  { num: 3, title: 'Connect & Chat', desc: 'Send connection requests and message directly with real-time chat.' },
  { num: 4, title: 'Grow Together', desc: 'Attend events, land jobs through referrals, and give back to the community.' },
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
            const index = Array.from(stepEls).indexOf(e.target);
            e.target.style.transitionDelay = `${index * 0.12}s`;
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
        <div className="section-header">
          <span className="section-tag">Simple process</span>
          <h2 className="section-title">Get Connected in Minutes</h2>
        </div>
        <div className="steps-row" ref={rowRef}>
          {steps.map((s, i) => (
            <div className="step" key={s.num}>
              <div className="step-num-wrap">
                <div className="step-num">{s.num}</div>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
