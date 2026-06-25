import { useEffect, useRef } from 'react';

/**
 * AlumioDTU — Alumni Constellation Network
 *
 * A living network of connected nodes (alumni ↔ students) with:
 * - Flowing connection threads in teal & gold
 * - Depth-layered stars and drifting aurora bands
 * - Mouse-reactive parallax on the central hub
 * - Pulses that travel along edges like messages between peers
 */
export default function ThreeBackground({ visible = true }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let W = 0;
    let H = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // ─── Network nodes ───
    const NODE_COUNT = 95;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18 * depth,
        vy: (Math.random() - 0.5) * 0.18 * depth,
        r: (1.2 + Math.random() * 2.8) * depth,
        depth,
        hue: Math.random() > 0.55 ? 'gold' : 'teal',
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.8 + Math.random() * 1.5,
      });
    }

    // ─── Background stars ───
    const stars = Array.from({ length: 320 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.15 + Math.random() * 0.9,
      a: 0.08 + Math.random() * 0.35,
      tw: Math.random() * Math.PI * 2,
      ts: 0.4 + Math.random() * 1.8,
    }));

    // ─── Pulse packets travelling along edges ───
    const pulses = [];
    const MAX_PULSES = 40;

    function spawnPulse(a, b) {
      if (pulses.length >= MAX_PULSES) return;
      pulses.push({
        ax: a.x, ay: a.y, bx: b.x, by: b.y,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.006,
        hue: Math.random() > 0.4 ? 'gold' : 'teal',
      });
    }

    // ─── Aurora bands ───
    const auroras = [
      { y: 0.18, amp: 0.06, speed: 0.0007, hue: [0, 212, 200] },
      { y: 0.72, amp: 0.05, speed: -0.0005, hue: [245, 200, 66] },
      { y: 0.45, amp: 0.04, speed: 0.0004, hue: [100, 180, 255] },
    ];

    let time = 0;

    function drawAurora(t) {
      for (const band of auroras) {
        ctx.beginPath();
        const baseY = band.y * H;
        ctx.moveTo(0, baseY);
        for (let x = 0; x <= W; x += 8) {
          const y = baseY
            + Math.sin(x * 0.004 + t * band.speed * 1000) * band.amp * H
            + Math.sin(x * 0.009 + t * 2) * band.amp * H * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        const [r, g, b] = band.hue;
        const grad = ctx.createLinearGradient(0, baseY - 60, 0, baseY + 120);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},0.035)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.012;

      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.035;
      m.y += (m.ty - m.y) * 0.035;

      const hubX = W * 0.5 + (m.x - 0.5) * 55;
      const hubY = H * 0.42 + (m.y - 0.5) * 35;
      const linkDist = Math.min(W, H) * 0.14;

      // Base fill
      const bgGrad = ctx.createRadialGradient(hubX, hubY, 0, hubX, hubY, Math.max(W, H) * 0.75);
      bgGrad.addColorStop(0, '#0c1235');
      bgGrad.addColorStop(0.45, '#080e28');
      bgGrad.addColorStop(1, '#040612');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      drawAurora(time);

      // Stars
      for (const s of stars) {
        const tw = Math.sin(time * s.ts + s.tw) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 210, 255, ${s.a * (0.4 + tw * 0.6)})`;
        ctx.fill();
      }

      // Hub glow
      const hubPulse = Math.sin(time * 0.9) * 0.12 + 1;
      const hubGrad = ctx.createRadialGradient(hubX, hubY, 0, hubX, hubY, 220 * hubPulse);
      hubGrad.addColorStop(0, `rgba(0, 212, 200, ${0.09 * hubPulse})`);
      hubGrad.addColorStop(0.35, `rgba(245, 200, 66, ${0.04 * hubPulse})`);
      hubGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hubGrad;
      ctx.fillRect(hubX - 250, hubY - 250, 500, 500);

      // Update node positions (gentle drift + slight pull toward hub)
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        const dx = hubX - n.x;
        const dy = hubY - n.y;
        const dist = Math.hypot(dx, dy) || 1;
        n.vx += (dx / dist) * 0.002 * n.depth;
        n.vy += (dy / dist) * 0.002 * n.depth;
        n.vx *= 0.998;
        n.vy *= 0.998;

        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      }

      // Draw connections
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > linkDist) continue;

          const strength = 1 - d / linkDist;
          const isGold = a.hue === 'gold' || b.hue === 'gold';
          const [r, g, bCol] = isGold ? [245, 200, 66] : [0, 212, 200];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${r},${g},${bCol},${strength * 0.22 * a.depth})`;
          ctx.lineWidth = strength * 1.2;
          ctx.stroke();

          if (Math.random() < 0.0008 * strength) spawnPulse(a, b);
        }
      }

      // Hub spokes to nearby nodes
      for (const n of nodes) {
        const d = Math.hypot(n.x - hubX, n.y - hubY);
        if (d > linkDist * 1.6) continue;
        const strength = 1 - d / (linkDist * 1.6);
        ctx.beginPath();
        ctx.moveTo(hubX, hubY);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = `rgba(0, 212, 200, ${strength * 0.12})`;
        ctx.lineWidth = strength * 1.5;
        ctx.stroke();
      }

      // Travelling pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const px = p.ax + (p.bx - p.ax) * p.t;
        const py = p.ay + (p.by - p.ay) * p.t;
        const [r, g, b] = p.hue === 'gold' ? [245, 200, 66] : [0, 212, 200];
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
        ctx.fill();
      }

      // Draw nodes
      for (const n of nodes) {
        const pulse = Math.sin(time * n.pulseSpeed + n.phase) * 0.35 + 0.65;
        const [r, g, b] = n.hue === 'gold' ? [245, 200, 66] : [0, 212, 200];
        const alpha = 0.35 + pulse * 0.45 * n.depth;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.12})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      // Central hub node
      const coreR = 5 + Math.sin(time * 1.2) * 1.5;
      ctx.beginPath();
      ctx.arc(hubX, hubY, coreR * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 200, ${0.08 * hubPulse})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hubX, hubY, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.55 * hubPulse})`;
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';

      // Vignette for readability
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(4, 6, 18, 0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }

    animate();

    const onMouse = (e) => {
      mouseRef.current.tx = e.clientX / W;
      mouseRef.current.ty = e.clientY / H;
    };
    const onTouch = (e) => {
      if (e.touches[0]) {
        mouseRef.current.tx = e.touches[0].clientX / W;
        mouseRef.current.ty = e.touches[0].clientY / H;
      }
    };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
        opacity: visible ? 0.55 : 0,
      }}
    />
  );
}
