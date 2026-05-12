import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Map, Bot, Wrench, ArrowRight, Sparkles,
  Sun, Moon, ChevronDown, CheckCircle, Clock, Rocket,
  Camera, Package, Users, Database, Smartphone, Globe,
  Bell, BarChart3, Github, Linkedin, Mail
} from 'lucide-react';

// ── Theme hook ────────────────────────────────────────
const useTheme = () => {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark];
};

// ── 3D Animated Canvas Background ────────────────────
const ThreeDBackground = ({ dark }) => {
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

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      size: 0.5 + Math.random() * 1.2,
      alpha: 0.1 + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    // Orbs
    const orbs = Array.from({ length: 7 }, (_, i) => ({
      x: 0.1 + (i * 0.15) % 0.9,
      y: 0.1 + (i * 0.23) % 0.8,
      r: 60 + i * 30,
      color: i % 3 === 0 ? [99, 102, 241] : i % 3 === 1 ? [139, 92, 246] : [56, 189, 248],
      speed: 0.08 + i * 0.03,
      phase: i * 1.3,
      drift: i * 0.7,
    }));

    // Particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      size: 1 + Math.random() * 2,
      speed: 0.04 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    const auroraLayers = [
      { color1: [99, 102, 241], color2: [139, 92, 246], speed: 0.18, amp: 0.12, phase: 0 },
      { color1: [56, 189, 248], color2: [99, 102, 241], speed: 0.13, amp: 0.09, phase: 2.1 },
      { color1: [192, 132, 252], color2: [56, 189, 248], speed: 0.22, amp: 0.07, phase: 4.3 },
    ];

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
      const auroraAlpha = dark ? 1 : 0.4;
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
      const gridAlpha = dark ? 1 : 0.5;

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

    function render() {
      tRef.current += 0.012;
      const t = tRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, W, H);
      const bgColor = dark ? '#070b14' : '#f0f4ff';
      ctx.fillStyle = bgColor;
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
  );
};

// ── Section label ─────────────────────────────────────
const SectionLabel = ({ children, dark }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 14px', borderRadius: 20,
    background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    border: `1px solid ${dark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.25)'}`,
    color: dark ? '#a5b4fc' : '#4f46e5',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: 20,
  }}>
    <Sparkles size={11} /> {children}
  </div>
);

// ── Working module card ───────────────────────────────
const ModuleCard = ({ icon: Icon, color, title, desc, features, delay, dark }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -6 }}
    style={{
      background: dark ? 'rgba(13,18,33,0.7)' : 'rgba(255,255,255,0.9)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 20,
      padding: '28px 24px',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    }} />
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, marginBottom: 16,
    }}>
      <Icon size={24} />
    </div>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: dark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
      color: '#10b981', fontSize: 11, fontWeight: 700,
      marginBottom: 12,
    }}>
      <CheckCircle size={10} /> Live
    </div>
    <h3 style={{
      fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.2rem',
      color: dark ? '#f1f5f9' : '#0f172a', marginBottom: 8,
    }}>{title}</h3>
    <p style={{ color: dark ? '#64748b' : '#475569', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 16 }}>{desc}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {features.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: dark ? '#94a3b8' : '#475569' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
          {f}
        </div>
      ))}
    </div>
  </motion.div>
);

// ── Future feature pill ───────────────────────────────
const FuturePill = ({ icon: Icon, label, dark }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.04 }}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', borderRadius: 12,
      background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      color: dark ? '#64748b' : '#94a3b8',
      fontSize: '0.84rem', fontWeight: 500,
    }}
  >
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: dark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: dark ? '#818cf8' : '#6366f1',
    }}>
      <Icon size={14} />
    </div>
    {label}
    <div style={{
      marginLeft: 'auto', padding: '2px 7px', borderRadius: 10,
      background: dark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)',
      color: '#f59e0b', fontSize: 10, fontWeight: 700,
    }}>Soon</div>
  </motion.div>
);

// ── Team card ─────────────────────────────────────────
const TeamCard = ({ initials, name, role, color, delay, dark }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 24px',
      background: dark ? 'rgba(13,18,33,0.7)' : 'rgba(255,255,255,0.9)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 20, backdropFilter: 'blur(20px)',
      gap: 12,
    }}
  >
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem', fontWeight: 800, color: '#fff',
      fontFamily: "'Outfit', sans-serif",
      boxShadow: `0 0 24px ${color}40`,
    }}>{initials}</div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: dark ? '#f1f5f9' : '#0f172a', marginBottom: 4 }}>{name}</p>
      <p style={{ fontSize: '0.8rem', color: dark ? '#64748b' : '#94a3b8' }}>{role}</p>
    </div>
  </motion.div>
);

// ── Main LandingPage ──────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bg = dark ? '#070b14' : '#f0f4ff';
  const text = dark ? '#f1f5f9' : '#0f172a';
  const sub = dark ? '#64748b' : '#475569';

  const modules = [
    {
      icon: Map, color: '#38bdf8', title: 'Smart Campus Map',
      desc: 'Navigate every corner of your campus with our interactive building map. Find rooms, track occupancy, and get directions in seconds.',
      features: ['Interactive building & room finder', 'Live occupancy indicators', 'Department-wise navigation', 'Nearby facilities locator'],
      delay: 0.1,
    },
    {
      icon: Wrench, color: '#f472b6', title: 'Service Requests',
      desc: 'Log maintenance issues, IT problems, and campus service requests with real-time tracking from submission to resolution.',
      features: ['One-click issue reporting', 'Priority-based tracking', 'Real-time status updates', 'Department assignment system'],
      delay: 0.2,
    },
    {
      icon: Bot, color: '#a78bfa', title: 'AI Campus Assistant',
      desc: 'Ask anything about campus — staff contacts, document submissions, room locations, and free-time schedules. Powered by intelligent data lookup.',
      features: ['Natural language queries', 'Staff directory & HOD finder', 'Document submission routing', 'Free time & schedule lookup'],
      delay: 0.3,
    },
  ];

  const future = [
    { icon: Camera, label: 'Image-Based Issue Reporting' },
    { icon: Package, label: 'Smart Lost & Found Management' },
    { icon: Users, label: 'Visitor Portal Integration' },
    { icon: Database, label: 'College Systems Integration' },
    { icon: Smartphone, label: 'Mobile Application' },
    { icon: Globe, label: 'Multi-Tenancy & SaaS' },
    { icon: Bell, label: 'Real-Time Push Notifications' },
    { icon: BarChart3, label: 'Admin Analytics Dashboard' },
  ];

  const team = [
    { initials: 'V', name: 'YASHWANTH KUMAR', role: 'Frontend and backend developer', color: '#6366f1', delay: 0.1 },
    { initials: 'J', name: 'KANIJA FATHIMA', role: 'Frontend developer', color: '#8b5cf6', delay: 0.2 },
    { initials: 'B', name: 'BHUVANESHWARI', role: 'Frontend developer', color: '#06b6d4', delay: 0.3 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', transition: 'background 0.3s, color 0.3s' }}>

      {/* ── 3D Canvas Background (replaces old Particles) ── */}
      <ThreeDBackground dark={dark} />

      {/* ── Navbar ── */}
      <motion.nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: '12px 32px',
          background: scrolled
            ? (dark ? 'rgba(7,11,20,0.92)' : 'rgba(240,244,255,0.92)')
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.05rem', background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CampusIQ
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Features', 'Roadmap', 'Team'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: '0.88rem', fontWeight: 500,
              color: dark ? '#94a3b8' : '#475569', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = dark ? '#f1f5f9' : '#0f172a'}
              onMouseLeave={e => e.target.style.color = dark ? '#94a3b8' : '#475569'}
            >{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.button
            onClick={() => setDark(!dark)}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
              color: dark ? '#94a3b8' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 18px', borderRadius: 10, border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: 'transparent', color: dark ? '#94a3b8' : '#475569', fontSize: '0.86rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >Log In</motion.button>

          <motion.button onClick={() => navigate('/signup')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >Sign Up</motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px' }}>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 20, background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', border: `1px solid ${dark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`, color: dark ? '#a5b4fc' : '#4f46e5', fontSize: 12, fontWeight: 700, marginBottom: 28, letterSpacing: '0.05em' }}
        >
          <Sparkles size={12} /> AI-POWERED SMART CAMPUS PLATFORM
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(2.6rem,5.5vw,4rem)', lineHeight: 1.08, marginBottom: 20, letterSpacing: '-0.03em', color: text }}
        >
          Your campus,{' '}
          <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            intelligently
          </span>
          {' '}connected
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          style={{ color: sub, fontSize: '1.08rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 540 }}
        >
          CampusIQ unifies campus navigation, service management, and AI assistance into one seamless platform — built by students, for students.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}
        >
          <motion.button onClick={() => navigate('/signup')} whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
          >Get Started Free <ArrowRight size={17} /></motion.button>

          <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 14, border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: dark ? '#cbd5e1' : '#334155', fontWeight: 600, fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >Already have an account</motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[['3', 'Live Modules'], ['21+', 'Staff Records'], ['100%', 'Free to Use']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: dark ? '#a5b4fc' : '#6366f1', margin: 0 }}>{val}</p>
              <p style={{ color: sub, fontSize: '12px', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: sub, cursor: 'pointer' }}
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel dark={dark}>Currently Live</SectionLabel>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '-0.02em', color: text, marginBottom: 12 }}>
            Three powerful modules, ready now
          </h2>
          <p style={{ color: sub, fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Built, tested, and deployed — these modules are live and working for every student on campus.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {modules.map(m => <ModuleCard key={m.title} {...m} dark={dark} />)}
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section id="roadmap" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SectionLabel dark={dark}>Coming Soon</SectionLabel>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '-0.02em', color: text, marginBottom: 12 }}>
            Future implementation roadmap
          </h2>
          <p style={{ color: sub, fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            We're just getting started. Here's what's coming next for CampusIQ.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 12, marginBottom: 32,
          background: dark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${dark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)'}`,
        }}>
          <Rocket size={16} color="#f59e0b" />
          <span style={{ color: '#f59e0b', fontSize: '0.86rem', fontWeight: 600 }}>Active development — next features shipping soon</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, color: sub, fontSize: '0.8rem' }}>
            <Clock size={13} /> In Progress
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {future.map(f => <FuturePill key={f.label} {...f} dark={dark} />)}
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" style={{ position: 'relative', zIndex: 1, padding: '80px 24px 100px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SectionLabel dark={dark}>The Team</SectionLabel>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '-0.02em', color: text, marginBottom: 12 }}>
            Built with ❤️ by
          </h2>
          <p style={{ color: sub, fontSize: '1rem' }}>The developers behind CampusIQ</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20, marginBottom: 48 }}>
          {team.map(t => <TeamCard key={t.name} {...t} dark={dark} />)}
        </div>

        <div style={{
          textAlign: 'center', padding: '32px', borderRadius: 20,
          background: dark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
          border: `1px solid ${dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <GraduationCap size={18} color={dark ? '#818cf8' : '#6366f1'} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: dark ? '#a5b4fc' : '#4f46e5' }}>CampusIQ — Smart Campus Platform</span>
          </div>
          <p style={{ color: sub, fontSize: '0.84rem', marginBottom: 20 }}>
            A final year project built to modernise campus life through technology.
          </p>
          <motion.button onClick={() => navigate('/signup')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >Create Free Account →</motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={13} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: dark ? '#475569' : '#94a3b8' }}>CampusIQ</span>
        </div>
        <p style={{ color: dark ? '#374151' : '#94a3b8', fontSize: '0.8rem' }}>
          © 2025 CampusIQ. Built for campus, by campus.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;