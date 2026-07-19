import { useRef, useEffect } from 'react';

/**
 * MovingBorderButton — orbiting white light around the button border
 * Uses canvas to draw a bright spot that traces the full rectangular perimeter
 */
export default function MovingBorderButton({
  children,
  onClick,
  className = '',
  borderRadius = '50px',
  duration = 2500,
  style: customStyle = {},
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();

    const startTime = performance.now();

    const animate = (time) => {
      animRef.current = requestAnimationFrame(animate);

      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const elapsed = time - startTime;
      const progress = (elapsed % duration) / duration;

      // Trace the perimeter of the rounded rectangle
      // Perimeter: 2*(W-2r) + 2*(H-2r) + 2*pi*r where r is corner radius
      const r = Math.min(parseFloat(borderRadius) || 25, W / 2, H / 2);
      const straightW = W - 2 * r;
      const straightH = H - 2 * r;
      const cornerLen = (Math.PI / 2) * r;
      const perimeter = 2 * straightW + 2 * straightH + 4 * cornerLen;

      let dist = progress * perimeter;
      let px, py;

      // Top edge (left to right)
      if (dist < straightW) {
        px = r + dist;
        py = 0;
      }
      // Top-right corner
      else if (dist < straightW + cornerLen) {
        const angle = (dist - straightW) / r;
        px = W - r + r * Math.sin(angle);
        py = r - r * Math.cos(angle);
      }
      // Right edge (top to bottom)
      else if (dist < straightW + cornerLen + straightH) {
        const d = dist - straightW - cornerLen;
        px = W;
        py = r + d;
      }
      // Bottom-right corner
      else if (dist < straightW + 2 * cornerLen + straightH) {
        const angle = (dist - straightW - cornerLen - straightH) / r;
        px = W - r + r * Math.cos(angle);
        py = H - r + r * Math.sin(angle);
      }
      // Bottom edge (right to left)
      else if (dist < 2 * straightW + 2 * cornerLen + straightH) {
        const d = dist - straightW - 2 * cornerLen - straightH;
        px = W - r - d;
        py = H;
      }
      // Bottom-left corner
      else if (dist < 2 * straightW + 3 * cornerLen + straightH) {
        const angle = (dist - 2 * straightW - 2 * cornerLen - straightH) / r;
        px = r - r * Math.sin(angle);
        py = H - r + r * Math.cos(angle);
      }
      // Left edge (bottom to top)
      else if (dist < 2 * straightW + 3 * cornerLen + 2 * straightH) {
        const d = dist - 2 * straightW - 3 * cornerLen - straightH;
        px = 0;
        py = H - r - d;
      }
      // Top-left corner
      else {
        const angle = (dist - 2 * straightW - 3 * cornerLen - 2 * straightH) / r;
        px = r - r * Math.cos(angle);
        py = r - r * Math.sin(angle);
      }

      // Draw the glowing spot
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, 60);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.25)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    };

    animRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [duration, borderRadius]);

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        borderRadius,
        padding: '1.6px',
        background: 'transparent',
        overflow: 'hidden',
        cursor: 'pointer',
        border: 'none',
        display: 'inline-flex',
        boxShadow: '0 2px 5px rgba(12, 166, 204, 0.5), 0 2px 20px rgba(0,110,0,0.9)',
        ...customStyle,
      }}
    >
      {/* Animated border canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Static subtle border underneath */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          border: '1px solid rgba(255,255,255,0.2)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Inner content */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: `calc(${borderRadius} - 2px)`,
          background: '#000000',
          padding: '15px 36px',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '0.92rem',
          color: '#ffffff',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {children}
      </span>
    </button>
  );
}
