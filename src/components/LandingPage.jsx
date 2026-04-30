import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Map, Bot, Cpu, Calendar, Wrench, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

const FloatingOrb = ({ style }) => (
  <motion.div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      opacity: 0.18,
      pointerEvents: 'none',
      ...style,
    }}
    animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.22, 0.15] }}
    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const FeatureCard = ({ icon: Icon, color, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    whileHover={{ y: -5, borderColor: `${color}55` }}
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      cursor: 'default',
      transition: 'border-color 0.3s ease',
    }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={20} />
    </div>
    <div>
      <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{title}</p>
      <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.55 }}>{desc}</p>
    </div>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Map,      color: '#38bdf8', title: 'Smart Campus Map',       desc: 'Navigate buildings, find rooms and track live occupancy.',   delay: 0.55 },
    { icon: Bot,      color: '#a78bfa', title: 'AI Assistant',           desc: 'Ask anything about campus — schedules, staff, documents.',    delay: 0.65 },
    { icon: Cpu,      color: '#34d399', title: 'IoT Monitor',            desc: 'Live environment sensors, energy and device status.',          delay: 0.75 },
    { icon: Calendar, color: '#fb923c', title: 'Events Hub',             desc: 'Discover, register and manage campus events instantly.',       delay: 0.85 },
    { icon: Wrench,   color: '#f472b6', title: 'Service Requests',       desc: 'Log and track maintenance or IT issues with real-time status.',delay: 0.95 },
    { icon: Shield,   color: '#fbbf24', title: 'Secure & Private',       desc: 'Your data stays safe with end-to-end encrypted sessions.',     delay: 1.05 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070b14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Background orbs */}
      <FloatingOrb style={{ width: 500, height: 500, background: '#6366f1', top: '-100px', left: '-80px' }} />
      <FloatingOrb style={{ width: 400, height: 400, background: '#8b5cf6', bottom: '10%', right: '-60px' }} />
      <FloatingOrb style={{ width: 300, height: 300, background: '#06b6d4', top: '40%', left: '45%' }} />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Minimal top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(7,11,20,0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem', background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CampusIQ
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >
            Log In
          </motion.button>
          <motion.button
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >
            Sign Up
          </motion.button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '160px 24px 80px', maxWidth: 720 }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc', fontSize: '12px', fontWeight: 600,
            marginBottom: 28, letterSpacing: '0.04em',
          }}
        >
          <Sparkles size={13} />
          AI-POWERED SMART CAMPUS PLATFORM
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1.1,
            color: '#f1f5f9', marginBottom: 20, letterSpacing: '-0.02em',
          }}
        >
          Your campus,{' '}
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            intelligently
          </span>
          {' '}connected
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}
        >
          CampusIQ brings together navigation, AI assistance, IoT monitoring, events and service requests — all in one seamless platform.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 30px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            Get Started Free <ArrowRight size={17} />
          </motion.button>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 30px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#cbd5e1', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              transition: 'background 0.25s',
            }}
          >
            Already have an account
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          style={{ display: 'flex', gap: 36, marginTop: 52, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[['10K+','Students'], ['50+','Buildings Mapped'], ['99.9%','Uptime']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#a5b4fc', margin: 0 }}>{val}</p>
              <p style={{ color: '#475569', fontSize: '12px', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features grid */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 960, padding: '0 24px 100px' }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
          style={{ textAlign: 'center', color: '#475569', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}
        >
          Everything you need
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          style={{ textAlign: 'center', marginTop: 56 }}
        >
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            padding: '36px 48px', borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#a5b4fc" />
              <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: '14px' }}>Ready to get started?</span>
            </div>
            <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>Join thousands of students already using CampusIQ</p>
            <motion.button
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
            >
              Create Free Account →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
