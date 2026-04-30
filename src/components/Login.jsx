import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

const InputField = ({ icon: Icon, type, placeholder, value, onChange, right }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>
      <Icon size={16} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '13px 44px 13px 42px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 12, color: '#e2e8f0', fontSize: '14px',
        outline: 'none', fontFamily: "'DM Sans',sans-serif",
        boxSizing: 'border-box', transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
    />
    {right && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await loginWithEmail(email, password); // added await
      navigate('/dashboard');               // go to dashboard after login
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  // Demo quick-fill
  const demoLogin = () => {
    setEmail('demo@campus.edu');
    setPassword('demo1234');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#070b14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Orbs */}
      {[
        { w:420, h:420, bg:'#6366f1', top:'-120px', left:'-80px'  },
        { w:320, h:320, bg:'#8b5cf6', bottom:'0',   right:'-60px' },
      ].map((o,i)=>(
        <motion.div key={i} animate={{ scale:[1,1.12,1], opacity:[0.12,0.2,0.12] }} transition={{ duration:7+i*2, repeat:Infinity }}
          style={{ position:'fixed', borderRadius:'50%', filter:'blur(70px)', background:o.bg, width:o.w, height:o.h, top:o.top, left:o.left, right:o.right, bottom:o.bottom, pointerEvents:'none' }}
        />
      ))}

      <motion.div
        initial={{ opacity:0, y:28, scale:0.97 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.5, ease:'easeOut' }}
        style={{
          width:'100%', maxWidth:420, position:'relative', zIndex:1,
          background:'rgba(10,14,25,0.82)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,255,255,0.08)', borderRadius:22,
          padding:'36px 36px 32px', boxShadow:'0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 }}>
          <motion.div
            whileHover={{ rotate:12, scale:1.08 }}
            style={{ width:50, height:50, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 0 24px rgba(99,102,241,0.45)' }}
          >
            <GraduationCap size={24} color="#fff" />
          </motion.div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'1.4rem', color:'#f1f5f9', margin:0, marginBottom:5 }}>Welcome back</h1>
          <p style={{ color:'#475569', fontSize:'13px', margin:0 }}>Sign in to your CampusIQ account</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:'13px', marginBottom:18 }}
          >
            <AlertCircle size={14}/> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <InputField icon={Mail} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} />
          <InputField
            icon={Lock} type={showPw?'text':'password'} placeholder="Password"
            value={password} onChange={e=>setPassword(e.target.value)}
            right={
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', display:'flex', alignItems:'center' }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            }
          />

          <div style={{ textAlign:'right' }}>
            <span style={{ color:'#6366f1', fontSize:'12px', cursor:'pointer', fontWeight:500 }}>Forgot password?</span>
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale:1.02, boxShadow:'0 8px 28px rgba(99,102,241,0.45)' }}
            whileTap={{ scale:0.98 }}
            style={{
              padding:'13px', borderRadius:12, border:'none',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff', fontWeight:700, fontSize:'15px', cursor: loading?'not-allowed':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              fontFamily:"'DM Sans',sans-serif",
              boxShadow:'0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16}/></>}
          </motion.button>
        </form>

        {/* Demo */}
        <div style={{ textAlign:'center', marginTop:14 }}>
          <button onClick={demoLogin} style={{ background:'none', border:'none', color:'#4b5563', fontSize:'12px', cursor:'pointer', textDecoration:'underline', fontFamily:"'DM Sans',sans-serif" }}>
            Use demo credentials
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'22px 0' }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
          <span style={{ color:'#374151', fontSize:'12px' }}>OR</span>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
        </div>

        <p style={{ textAlign:'center', color:'#475569', fontSize:'13px', margin:0 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
