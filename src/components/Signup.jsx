import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';

const InputField = ({ icon: Icon, type, placeholder, value, onChange, right }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>
      <Icon size={16} />
    </div>
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{
        width: '100%', padding: '12px 44px 12px 42px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 12, color: '#e2e8f0', fontSize: '14px', outline: 'none',
        fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
    />
    {right && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
  </div>
);

const StrengthBar = ({ password }) => {
  const strength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'];
  return password ? (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
      ))}
      <span style={{ color: colors[strength], fontSize: '11px', marginLeft: 6, whiteSpace: 'nowrap' }}>{labels[strength]}</span>
    </div>
  ) : null;
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'Student' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password, role: form.role }); // added await
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200); // go to dashboard
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#070b14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {[
        { w:400,h:400,bg:'#8b5cf6',top:'-100px',right:'-70px' },
        { w:350,h:350,bg:'#06b6d4',bottom:'5%',left:'-50px'  },
      ].map((o,i)=>(
        <motion.div key={i} animate={{ scale:[1,1.15,1], opacity:[0.1,0.18,0.1] }} transition={{ duration:8+i*2, repeat:Infinity }}
          style={{ position:'fixed', borderRadius:'50%', filter:'blur(72px)', background:o.bg, width:o.w, height:o.h, top:o.top, right:o.right, bottom:o.bottom, left:o.left, pointerEvents:'none' }}
        />
      ))}

      <motion.div
        initial={{ opacity:0, y:28, scale:0.97 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.5, ease:'easeOut' }}
        style={{
          width:'100%', maxWidth:440, position:'relative', zIndex:1,
          background:'rgba(10,14,25,0.82)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,255,255,0.08)', borderRadius:22,
          padding:'32px 36px 28px', boxShadow:'0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <motion.div
            whileHover={{ rotate:12, scale:1.08 }}
            style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, boxShadow:'0 0 22px rgba(99,102,241,0.4)' }}
          >
            <GraduationCap size={22} color="#fff" />
          </motion.div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'1.35rem', color:'#f1f5f9', margin:0, marginBottom:4 }}>Create your account</h1>
          <p style={{ color:'#475569', fontSize:'13px', margin:0 }}>Join CampusIQ — it's free</p>
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
          <InputField icon={User}  type="text"     placeholder="Full name"       value={form.name}    onChange={update('name')}    />
          <InputField icon={Mail}  type="email"    placeholder="Email address"   value={form.email}   onChange={update('email')}   />

          {/* Role selector */}
          <div style={{ position:'relative' }}>
            <select
              value={form.role} onChange={update('role')}
              style={{
                width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.09)', borderRadius:12,
                color:'#94a3b8', fontSize:'14px', outline:'none',
                fontFamily:"'DM Sans',sans-serif", appearance:'none', cursor:'pointer',
              }}
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <InputField
              icon={Lock} type={showPw?'text':'password'} placeholder="Password (min 6 chars)"
              value={form.password} onChange={update('password')}
              right={
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', display:'flex', alignItems:'center' }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              }
            />
            <StrengthBar password={form.password} />
          </div>

          <InputField icon={Lock}  type="password" placeholder="Confirm password" value={form.confirm} onChange={update('confirm')} />

          <motion.button
            type="submit" disabled={loading || success}
            whileHover={{ scale:1.02, boxShadow:'0 8px 28px rgba(99,102,241,0.45)' }}
            whileTap={{ scale:0.98 }}
            style={{
              marginTop:4, padding:'13px', borderRadius:12, border:'none',
              background: (loading||success) ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff', fontWeight:700, fontSize:'15px',
              cursor:(loading||success)?'not-allowed':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            {loading ? 'Creating…' : success ? 'Done!' : <><span>Create Account</span><ArrowRight size={16}/></>}
          </motion.button>
        </form>

        <p style={{ textAlign:'center', color:'#475569', fontSize:'13px', margin:'20px 0 0' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
