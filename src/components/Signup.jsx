import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import AnimatedBackground from './AnimatedBackground';
const StrengthBar = ({ password, isDark }) => {
  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'];
  return password ? (
    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= strength ? colors[strength] : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', transition:'background 0.3s' }} />
      ))}
      <span style={{ color: colors[strength], fontSize:'11px', marginLeft:6, whiteSpace:'nowrap' }}>{labels[strength]}</span>
    </div>
  ) : null;
};

const ROLE_CODES = {
  Faculty: '2026',
  Staff:   '2026',
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', role:'Student', code:'' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Theme-aware colors ──
  const c = {
    pageBg:      isDark ? '#070b14'                     : '#f0f4ff',
    cardBg:      isDark ? 'rgba(13,18,33,0.92)'         : 'rgba(255,255,255,0.97)',
    cardBorder:  isDark ? 'rgba(255,255,255,0.08)'      : 'rgba(0,0,0,0.10)',
    inputBg:     isDark ? 'rgba(255,255,255,0.05)'      : 'rgba(0,0,0,0.04)',
    inputBorder: isDark ? 'rgba(255,255,255,0.09)'      : 'rgba(0,0,0,0.12)',
    inputColor:  isDark ? '#e2e8f0'                     : '#0f172a',
    iconColor:   isDark ? '#475569'                     : '#94a3b8',
    titleColor:  isDark ? '#f1f5f9'                     : '#0f172a',
    subColor:    isDark ? '#475569'                     : '#64748b',
    dividerColor:isDark ? 'rgba(255,255,255,0.07)'      : 'rgba(0,0,0,0.08)',
    linkColor:   isDark ? '#475569'                     : '#64748b',
    selectColor: isDark ? '#94a3b8'                     : '#475569',
    toggleBg:    isDark ? 'rgba(255,255,255,0.08)'      : 'rgba(0,0,0,0.06)',
    toggleColor: isDark ? '#94a3b8'                     : '#64748b',
    cardShadow:  isDark ? '0 24px 64px rgba(0,0,0,0.6)': '0 24px 64px rgba(99,102,241,0.12)',
    orb1:        isDark ? '#8b5cf6'                     : '#a78bfa',
    orb2:        isDark ? '#06b6d4'                     : '#38bdf8',
  };

  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = {
    width:'100%', padding:'12px 44px 12px 42px',
    background: c.inputBg,
    border: `1px solid ${c.inputBorder}`,
    borderRadius:12, color: c.inputColor, fontSize:'14px',
    outline:'none', fontFamily:"'DM Sans',sans-serif",
    boxSizing:'border-box', transition:'border-color 0.2s, background 0.3s, color 0.3s',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.role !== 'Student') {
    if (!form.code) { setError(`Access code is required for ${form.role} accounts`); return; }
    if (form.code !== ROLE_CODES[form.role]) { setError(`Invalid access code for ${form.role}`); return; }
}
    setLoading(true);
    try {
      await signup({ name:form.name, email:form.email, password:form.password, role:form.role });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <AnimatedBackground dark={isDark}>
      

      {/* Theme toggle */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}
        style={{
          position:'fixed', top:16, right:16, zIndex:200,
          width:38, height:38, borderRadius:'50%',
          border:`1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
          cursor:'pointer', background: c.toggleBg, color: c.toggleColor,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'background 0.3s, color 0.3s',
        }}
      >
        {isDark ? <Sun size={16}/> : <Moon size={16}/>}
      </motion.button>

      

      {/* Card */}
      {/* Center wrapper */}
<div
  style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  }}
>
  {/* Card */}
  <motion.div
        initial={{ opacity:0, y:28, scale:0.97 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.5, ease:'easeOut' }}
        style={{
          width:'100%', maxWidth:440, position:'relative', zIndex:1,
          background: c.cardBg,
          backdropFilter:'blur(24px)',
          border:`1px solid ${c.cardBorder}`,
          borderRadius:22,
          padding:'32px 36px 28px',
          boxShadow: c.cardShadow,
          transition:'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        }}
      >
        
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <motion.div whileHover={{ rotate:12, scale:1.08 }}
            style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, boxShadow:'0 0 22px rgba(99,102,241,0.4)' }}
          >
            <GraduationCap size={22} color="#fff" />
          </motion.div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'1.35rem', color: c.titleColor, margin:0, marginBottom:4, transition:'color 0.3s' }}>
            Create your account
          </h1>
          <p style={{ color: c.subColor, fontSize:'13px', margin:0, transition:'color 0.3s' }}>
            Join CampusIQ — it's free
          </p>
        </div>

        {/* Success */}
        {success && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:12, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399', fontSize:'14px', marginBottom:16 }}
          >
            <CheckCircle2 size={16}/> Account created! Redirecting…
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:'13px', marginBottom:16 }}
          >
            <AlertCircle size={14}/> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Name */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: c.iconColor, pointerEvents:'none' }}><User size={16}/></div>
            <input type="text" placeholder="Full name" value={form.name} onChange={update('name')}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor=c.inputBorder}
            />
          </div>

          {/* Email */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: c.iconColor, pointerEvents:'none' }}><Mail size={16}/></div>
            <input type="email" placeholder="Email address" value={form.email} onChange={update('email')}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor=c.inputBorder}
            />
          </div>

          {/* Role */}
          <select value={form.role} onChange={update('role')}
            style={{
              width:'100%', padding:'12px 14px',
              background: c.inputBg,
              border:`1px solid ${c.inputBorder}`,
              borderRadius:12, color: c.selectColor, fontSize:'14px',
              outline:'none', fontFamily:"'DM Sans',sans-serif",
              appearance:'none', cursor:'pointer',
              transition:'background 0.3s, color 0.3s, border-color 0.2s',
            }}
          >
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Staff">Staff</option>
          </select>

          {/* Access code — only shown for Faculty/Staff */}
{form.role !== 'Student' && (
  <div style={{ position:'relative' }}>
    <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: c.iconColor, pointerEvents:'none' }}>
      <Lock size={16}/>
    </div>
    <input
      type="text"
      placeholder={`Enter ${form.role} access code`}
      value={form.code}
      onChange={update('code')}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
      onBlur={e => e.target.style.borderColor=c.inputBorder}
    />
  </div>
)}

          {/* Password */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: c.iconColor, pointerEvents:'none' }}><Lock size={16}/></div>
              <input type={showPw ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password} onChange={update('password')}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor=c.inputBorder}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color: c.iconColor, cursor:'pointer', display:'flex', alignItems:'center' }}
              >
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <StrengthBar password={form.password} isDark={isDark} />
          </div>

          {/* Confirm password */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: c.iconColor, pointerEvents:'none' }}><Lock size={16}/></div>
            <input type="password" placeholder="Confirm password" value={form.confirm} onChange={update('confirm')}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor=c.inputBorder}
            />
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={loading || success}
            whileHover={{ scale:1.02, boxShadow:'0 8px 28px rgba(99,102,241,0.45)' }}
            whileTap={{ scale:0.98 }}
            style={{
              marginTop:4, padding:'13px', borderRadius:12, border:'none',
              background: (loading||success) ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff', fontWeight:700, fontSize:'15px',
              cursor:(loading||success)?'not-allowed':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              fontFamily:"'DM Sans',sans-serif",
              boxShadow:'0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            {loading ? 'Creating…' : success ? 'Done!' : <><span>Create Account</span><ArrowRight size={16}/></>}
          </motion.button>
        </form>

        <p style={{ textAlign:'center', color: c.linkColor, fontSize:'13px', margin:'20px 0 0', transition:'color 0.3s' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </p>
      </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default Signup;