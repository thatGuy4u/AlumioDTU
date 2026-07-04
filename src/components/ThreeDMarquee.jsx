import { useMemo, useEffect, useRef, useState } from 'react';

export default function ThreeDMarquee({ texts = [], className = '' }) {
  const [columnHeight, setColumnHeight] = useState(0);
  const measureRef = useRef(null);

  // Split texts into 4 columns (single copy for measurement)
  const singleColumns = useMemo(() => {
    const cols = 4;
    const result = Array.from({ length: cols }, () => []);
    texts.forEach((text, i) => result[i % cols].push(text));
    return result;
  }, [texts]);

  // Duplicate content for seamless looping (two copies)
  const columns = useMemo(
    () => singleColumns.map(col => [...col, ...col]),
    [singleColumns]
  );

  // Measure the height of one copy after mount or when texts change
  useEffect(() => {
    if (!measureRef.current) return;
    // Use the first column's measurement (all columns have same structure)
    const height = measureRef.current.scrollHeight;
    if (height > 0) setColumnHeight(height);
  }, [singleColumns]);

  // Inject keyframes (unchanged)
  useEffect(() => {
    const styleId = 'marquee-keyframes';
    let el = document.getElementById(styleId);
    if (el) el.remove();
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes marquee-scroll-up {
        from { transform: translateY(0); }
        to { transform: translateY(-50%); }
      }
      @keyframes marquee-scroll-down {
        from { transform: translateY(-50%); }
        to { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  if (texts.length === 0) return null;

  return (
    <div
      className={className}
      style={{
        ...styles.outer,
        // Dynamic height based on measured single-copy height + vertical padding
        height: columnHeight ? columnHeight + 24 : 'auto',
        // Hide content until height is measured to avoid flicker
        visibility: columnHeight ? 'visible' : 'hidden',
      }}
    >
      {/* Hidden measurement block – one copy of the first column */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '100%',
          display: 'flex',
          gap: '12px',
          padding: '12px',
        }}
        aria-hidden="true"
      >
        {singleColumns.map((col, colIdx) => (
          <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {col.map((text, textIdx) => (
              <div key={textIdx} style={styles.textCard}>
                <p style={styles.textContent}>{text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.perspective}>
        <div style={styles.grid}>
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              style={{
                ...styles.column,
                height: columnHeight || 'auto',   // Exactly one copy tall
                overflow: 'hidden',              // Clip the scrolling inner wrapper
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: `${colIdx % 2 === 0 ? 'marquee-scroll-up' : 'marquee-scroll-down'} ${20 + colIdx * 5}s linear infinite`,
                  willChange: 'transform',
                }}
              >
                {col.map((text, textIdx) => (
                  <div key={textIdx} style={styles.textCard}>
                    <p style={styles.textContent}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fade edges (unchanged) */}
      <div style={styles.fadeTop} />
      <div style={styles.fadeBottom} />
      <div style={styles.fadeLeft} />
      <div style={styles.fadeRight} />
    </div>
  );
}

const styles = {
  outer: {
    position: 'relative',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    overflow: 'hidden',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.02)',
    // Border removed
    boxShadow: '0 0 15px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.3)',
  },
  perspective: {
    width: '100%',
    height: '100%',
    perspective: '900px',
    perspectiveOrigin: '50% 50%',
    overflow: 'hidden',
  },
  grid: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    height: '100%',
    transform: 'rotateX(18deg) scale(1.08)',
    transformStyle: 'preserve-3d',
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  textCard: {
    flexShrink: 0,
    borderRadius: '14px',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    // Border removed
    padding: '20px 16px',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 0 8px rgba(255,255,255,0.02), 0 4px 16px rgba(0,0,0,0.2)',
  },
  textContent: {
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.88rem',
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 400,
    letterSpacing: '0.01em',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(to bottom, #000000, transparent)',
    pointerEvents: 'none',
    zIndex: 5,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(to top, #000000, transparent)',
    pointerEvents: 'none',
    zIndex: 5,
  },
  fadeLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '80px',
    background: 'linear-gradient(to right, #000000, transparent)',
    pointerEvents: 'none',
    zIndex: 5,
  },
  fadeRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '80px',
    background: 'linear-gradient(to left, #000000, transparent)',
    pointerEvents: 'none',
    zIndex: 5,
  },
};