import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import AnimatedBackground from './AnimatedBackground';

const Login = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Theme-aware colors ──
  const c = {
    cardBg:       isDark ? 'rgba(13,18,33,0.85)'        : 'rgba(255,255,255,0.92)',
    cardBorder:   isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.10)',
    inputBg:      isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.04)',
    inputBorder:  isDark ? 'rgba(255,255,255,0.09)'     : 'rgba(0,0,0,0.12)',
    inputColor:   isDark ? '#e2e8f0'                    : '#0f172a',
    iconColor:    isDark ? '#475569'                    : '#94a3b8',
    titleColor:   isDark ? '#f1f5f9'                    : '#0f172a',
    subColor:     isDark ? '#475569'                    : '#64748b',
    dividerColor: isDark ? 'rgba(255,255,255,0.07)'     : 'rgba(0,0,0,0.08)',
    dividerText:  isDark ? '#374151'                    : '#94a3b8',
    linkColor:    isDark ? '#475569'                    : '#64748b',
    toggleBg:     isDark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.06)',
    toggleColor:  isDark ? '#94a3b8'                    : '#64748b',
    cardShadow:   isDark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 24px 64px rgba(99,102,241,0.12)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const demoLogin = () => {
    setEmail('demo@campus.edu');
    setPassword('demo1234');
  };

  return (
    // ✅ AnimatedBackground handles the full-page bg + canvas
    // ✅ No extra wrapper div with background — that was hiding the canvas
    <AnimatedBackground dark={isDark}>

      {/* Theme toggle — fixed top right */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 200,
          width: 38, height: 38, borderRadius: '50%',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
          cursor: 'pointer', background: c.toggleBg, color: c.toggleColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.3s, color 0.3s',
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </motion.button>

      {/* Center the card on screen */}
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        // ✅ NO background here — let the canvas show through
      }}>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            width: '100%', maxWidth: 420,
            background: c.cardBg,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${c.cardBorder}`,
            borderRadius: 22,
            padding: '36px 36px 32px',
            boxShadow: c.cardShadow,
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              style={{
                width: 50, height: 50, borderRadius: 14,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14, boxShadow: '0 0 24px rgba(99,102,241,0.45)',
              }}
            >
              <GraduationCap size={24} color="#fff" />
            </motion.div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '1.4rem', color: c.titleColor, margin: 0, marginBottom: 5 }}>
              Welcome back
            </h1>
            <p style={{ color: c.subColor, fontSize: '13px', margin: 0 }}>
              Sign in to your CampusIQ account
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px', marginBottom: 18 }}
            >
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: c.iconColor, pointerEvents: 'none' }}>
                <Mail size={16} />
              </div>
              <input
                type="email" placeholder="Email address"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '13px 44px 13px 42px',
                  background: c.inputBg,
                  border: `1px solid ${c.inputBorder}`,
                  borderRadius: 12, color: c.inputColor, fontSize: '14px',
                  outline: 'none', fontFamily: "'DM Sans',sans-serif",
                  boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.3s, color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor = c.inputBorder}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: c.iconColor, pointerEvents: 'none' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '13px 44px 13px 42px',
                  background: c.inputBg,
                  border: `1px solid ${c.inputBorder}`,
                  borderRadius: 12, color: c.inputColor, fontSize: '14px',
                  outline: 'none', fontFamily: "'DM Sans',sans-serif",
                  boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.3s, color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor = c.inputBorder}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: c.iconColor, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#6366f1', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '13px', borderRadius: 12, border: 'none',
                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}
            >
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          {/* Demo */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={demoLogin}
              style={{ background: 'none', border: 'none', color: c.subColor, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', fontFamily: "'DM Sans',sans-serif" }}
            >
              Use demo credentials
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: c.dividerColor }} />
            <span style={{ color: c.dividerText, fontSize: '12px' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: c.dividerColor }} />
          </div>

          <p style={{ textAlign: 'center', color: c.linkColor, fontSize: '13px', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;