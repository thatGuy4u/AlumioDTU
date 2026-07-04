import { useEffect, useRef } from 'react';

/**
 * ShineButton — Metal shine sweep effect
 * A bright highlight sweeps from one edge to the other like polished metal
 */
export default function ShineButton({
  children,
  onClick,
  className = '',
  borderRadius = '50px',
  duration = 2000,
  style: customStyle = {},
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    const styleId = 'shine-btn-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes metal-shine-sweep {
        0% { left: -50%; }
        40% { left: 120%; }
        100% { left: 120%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        borderRadius,
        padding: '15px 36px',
        background: 'transparent',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: '0.92rem',
        color: '#ffffff',
        transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 0 15px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.4)',
        ...customStyle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Metal shine sweep overlay */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          width: '35%',
          height: '140%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, rgba(255,255,255,0.03) 80%, transparent 100%)',
          transform: 'skewX(-20deg)',
          animation: `metal-shine-sweep ${duration}ms ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </span>
    </button>
  );
}
