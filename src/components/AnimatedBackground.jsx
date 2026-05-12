import React, { useEffect, useRef } from 'react';

/**
 * AnimatedBackground — CampusIQ 3D Canvas Background
 *
 * Usage (wrap any page):
 *   import AnimatedBackground from './AnimatedBackground';
 *
 *   const MyPage = () => (
 *     <AnimatedBackground dark={dark}>
 *       <YourPageContent />
 *     </AnimatedBackground>
 *   );
 *
 * Props:
 *   dark      {boolean}  — true = dark theme, false = light theme (default: true)
 *   children  {node}     — your page content rendered on top
 *   style     {object}   — optional extra styles for the wrapper div
 */
const AnimatedBackground = ({ dark = true, children, style = {} }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX / W, y: e.clientY / H };
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Stars ─────────────────────────────────────────
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      size: 0.5 + Math.random() * 1.2,
      alpha: 0.1 + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    // ── Orbs ──────────────────────────────────────────
    const orbs = Array.from({ length: 7 }, (_, i) => ({
      x: 0.1 + (i * 0.15) % 0.9,
      y: 0.1 + (i * 0.23) % 0.8,
      r: 60 + i * 30,
      color: i % 3 === 0 ? [99, 102, 241] : i % 3 === 1 ? [139, 92, 246] : [56, 189, 248],
      speed: 0.08 + i * 0.03,
      phase: i * 1.3,
      drift: i * 0.7,
    }));

    // ── Particles ─────────────────────────────────────
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      size: 1 + Math.random() * 2,
      speed: 0.04 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    // ── Aurora layers ─────────────────────────────────
    const auroraLayers = [
      { color1: [99, 102, 241], color2: [139, 92, 246], speed: 0.18, amp: 0.12, phase: 0 },
      { color1: [56, 189, 248], color2: [99, 102, 241], speed: 0.13, amp: 0.09, phase: 2.1 },
      { color1: [192, 132, 252], color2: [56, 189, 248], speed: 0.22, amp: 0.07, phase: 4.3 },
    ];

    // ── Draw functions ────────────────────────────────
    function drawStars(t) {
      stars.forEach(s => {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.speed + s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });
    }

    function drawAurora(t, mouse) {
      const auroraAlpha = dark ? 1 : 0.35;
      auroraLayers.forEach((l, li) => {
        ctx.save();
        ctx.globalAlpha = (0.07 - li * 0.015) * auroraAlpha;
        ctx.beginPath();
        const baseY = H * (0.18 + li * 0.14);
        const mx = (mouse.x - 0.5) * 40;
        for (let i = 0; i <= W; i += 4) {
          const px = i / W;
          const wave1 = Math.sin(px * 3.5 + t * l.speed + l.phase) * l.amp * H;
          const wave2 = Math.sin(px * 7 + t * l.speed * 1.7 + l.phase) * l.amp * 0.4 * H;
          const mxOff = mx * Math.sin(px * Math.PI);
          const y = baseY + wave1 + wave2 + mxOff;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.lineTo(W, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, `rgb(${l.color1.join(',')})`);
        grad.addColorStop(0.5, `rgb(${l.color2.join(',')})`);
        grad.addColorStop(1, `rgb(${l.color1.join(',')})`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });
    }

    function drawOrbs(t, mouse) {
      orbs.forEach(o => {
        const mx = (mouse.x - 0.5) * 30;
        const my = (mouse.y - 0.5) * 20;
        const ox = o.x * W + Math.sin(t * o.speed + o.phase) * 40 + mx;
        const oy = o.y * H + Math.cos(t * o.speed * 0.8 + o.drift) * 30 + my;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, `rgba(${o.color.join(',')},0.18)`);
        g.addColorStop(0.5, `rgba(${o.color.join(',')},0.06)`);
        g.addColorStop(1, `rgba(${o.color.join(',')},0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
    }

    function drawGrid(t, mouse) {
      const horizon = H * 0.52 + Math.sin(t * 0.3) * 8;
      const vp = { x: W * 0.5 + (mouse.x - 0.5) * 60, y: horizon };
      const gridAlpha = dark ? 1 : 0.4;

      // Vertical lines
      const numV = 22;
      for (let i = 0; i <= numV; i++) {
        const x = (i / numV) * W;
        const alpha = (0.04 + 0.06 * Math.sin((i / numV) * Math.PI)) * gridAlpha;
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(x, H + 20);
        ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Horizontal scrolling lines
      const numH = 18;
      for (let i = 0; i < numH; i++) {
        const p = i / numH;
        const perspective = Math.pow(p, 2.2);
        const y = horizon + (H - horizon + 40) * perspective;
        const scrollOff = (t * 18) % ((H - horizon + 40) / numH);
        const yy = y + scrollOff * Math.pow(p, 1.5);
        if (yy > H) continue;
        const xLeft = vp.x + (0 - vp.x) * (yy - horizon) / (H + 40 - horizon);
        const xRight = vp.x + (W - vp.x) * (yy - horizon) / (H + 40 - horizon);
        const alpha = (0.03 + 0.07 * perspective) * gridAlpha;
        ctx.beginPath();
        ctx.moveTo(xLeft, yy);
        ctx.lineTo(xRight, yy);
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    function drawParticles(t) {
      const colorOptions = [[99, 102, 241], [139, 92, 246], [56, 189, 248]];
      particles.forEach((p, i) => {
        const px = (p.x + Math.sin(t * p.speed + p.phase) * 0.02) * W;
        const py = (p.y + Math.cos(t * p.speed * 0.7 + p.phase) * 0.015) * H;
        const c = colorOptions[i % 3];
        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(t * p.speed * 2 + p.phase));
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.join(',')},${alpha})`;
        ctx.fill();
      });
    }

    function drawVignette() {
      const bg = dark ? '7,11,20' : '240,244,255';
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
      g.addColorStop(0, `rgba(${bg},0)`);
      g.addColorStop(1, `rgba(${bg},0.7)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Render loop ───────────────────────────────────
    function render() {
      tRef.current += 0.012;
      const t = tRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = dark ? '#070b14' : '#f0f4ff';
      ctx.fillRect(0, 0, W, H);

      drawStars(t);
      drawAurora(t, mouse);
      drawOrbs(t, mouse);
      drawGrid(t, mouse);
      drawParticles(t);
      drawVignette();

      rafRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [dark]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dark ? '#070b14' : '#f0f4ff',
        color: dark ? '#f1f5f9' : '#0f172a',
        fontFamily: "'DM Sans', sans-serif",
        overflowX: 'hidden',
        transition: 'background 0.3s, color 0.3s',
        position: 'relative',
        ...style,
      }}
    >
      {/* 3D Canvas — fixed, behind everything */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Page content — sits on top of canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;