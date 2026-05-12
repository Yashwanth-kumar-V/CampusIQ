import AnimatedBackground from './AnimatedBackground';
import { useTheme } from './ThemeContext';
import React, { useState, useEffect } from 'react';
import {
  BookOpen, MapPin, Calendar, AlertCircle, TrendingUp, Clock,
  CheckCircle2, Bell, Wrench, Bot, Map, ArrowRight, Zap,
  Activity, Users, FileText, MessageSquare, Navigation,
  ChevronRight, RefreshCw, Star, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, getDocs, Timestamp
} from 'firebase/firestore';

/* ─────────────────────────────────────────────
   Helper: time-of-day greeting
───────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ─────────────────────────────────────────────
   Skeleton shimmer component
───────────────────────────────────────────── */
const Shimmer = ({ w = '100%', h = '18px', r = '6px' }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.6s infinite',
  }} />
);

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, loading, delay = 0 }) => {
  const colors = {
    blue:   { bg: 'rgba(59,130,246,0.14)',  accent: '#3b82f6',  glow: 'rgba(59,130,246,0.28)'  },
    green:  { bg: 'rgba(34,197,94,0.14)',   accent: '#22c55e',  glow: 'rgba(34,197,94,0.28)'   },
    purple: { bg: 'rgba(139,92,246,0.14)',  accent: '#8b5cf6',  glow: 'rgba(139,92,246,0.28)'  },
    orange: { bg: 'rgba(249,115,22,0.14)',  accent: '#f97316',  glow: 'rgba(249,115,22,0.28)'  },
    teal:   { bg: 'rgba(20,184,166,0.14)',  accent: '#14b8a6',  glow: 'rgba(20,184,166,0.28)'  },
  };
  const c = colors[color] || colors.blue;
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 120 }}
      style={{
        background: isDark ? 'rgba(19,25,41,0.90)' : 'rgba(255,255,255,0.92)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{
        borderColor: c.accent + '55',
        boxShadow: `0 0 28px ${c.glow}`,
        y: -2,
      }}
    >
      {/* glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: c.glow, filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{
        width: '46px', height: '46px', borderRadius: '12px',
        background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={c.accent} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? (
          <>
            <Shimmer w="50px" h="28px" r="8px" />
            <div style={{ marginTop: 6 }}><Shimmer w="80px" h="13px" r="4px" /></div>
          </>
        ) : (
          <>
            <h3 style={{
              color: isDark ? '#f1f5f9' : '#0f172a',
              fontSize: '24px', fontWeight: 700, margin: 0, lineHeight: 1,
              fontFamily: "'Outfit', sans-serif",
              WebkitFontSmoothing: 'antialiased',
            }}>
              {value ?? '—'}
            </h3>
            <p style={{
              color: isDark ? '#64748b' : '#475569',
              fontSize: '12px', margin: '4px 0 0', fontWeight: 500,
            }}>{label}</p>
          </>
        )}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Feature card (Map / Services / AI)
───────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, color, onClick, badge, delay = 0 }) => {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 120 }}
      onClick={onClick}
      style={{
        background: isDark ? 'rgba(19,25,41,0.90)' : 'rgba(255,255,255,0.92)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: '18px',
        padding: '22px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.25s',
      }}
      whileHover={{ y: -4, borderColor: color + '55', boxShadow: `0 12px 40px ${color}28` }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{
        position: 'absolute', bottom: '-30px', right: '-30px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: color + '18', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {badge && (
          <span style={{
            background: color + '22', color, border: `1px solid ${color}44`,
            borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600,
          }}>{badge}</span>
        )}
      </div>

      <h3 style={{
        color: isDark ? '#e2e8f0' : '#0f172a',
        fontSize: '15px', fontWeight: 700, margin: '0 0 6px',
        fontFamily: "'Outfit', sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}>{title}</h3>
      <p style={{
        color: isDark ? '#64748b' : '#475569',
        fontSize: '12px', lineHeight: 1.6, margin: '0 0 14px',
      }}>{description}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color }}>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>Open</span>
        <ArrowRight size={13} />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Alert type configs
───────────────────────────────────────────── */
const ALERT_STYLES = {
  maintenance: { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: Wrench   },
  event:       { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: Calendar },
  safety:      { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: Shield   },
  info:        { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: Bell     },
};

/* ─────────────────────────────────────────────
   Status pill
───────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const cfg = {
    pending:      { color: '#f97316', bg: 'rgba(249,115,22,0.15)'   },
    'in-progress':{ color: '#6366f1', bg: 'rgba(99,102,241,0.15)'  },
    completed:    { color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   }, 
    resolved:     { color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   },
  }[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };

  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{status || 'unknown'}</span>
  );
};

/* ─────────────────────────────────────────────
   Main Dashboard Component
───────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [stats, setStats]               = useState({ services: null, resolved: null, pending: null, announcements: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [alerts, setAlerts]             = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [recentServices, setRecentServices]   = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [refreshKey, setRefreshKey]     = useState(0);

  const firstName    = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const avatarLetter = (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  // Theme-aware color helpers
  const tc = {
    cardBg:      isDark ? 'rgba(19,25,41,0.90)'    : 'rgba(255,255,255,0.92)',
    cardBorder:  isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(0,0,0,0.12)',
    heading:     isDark ? '#f1f5f9'                 : '#0f172a',
    subtext:     isDark ? '#94a3b8'                 : '#334155',
    muted:       isDark ? '#64748b'                 : '#475569',
    sectionLabel:isDark ? '#94a3b8'                 : '#475569',
    itemBg:      isDark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.04)',
    itemBorder:  isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)',
    dateBadgeBg: isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.05)',
    dateBadgeBorder: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
    refreshBg:   isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.06)',
    alertText:   isDark ? '#e2e8f0'                 : '#0f172a',
    alertSub:    isDark ? '#64748b'                 : '#475569',
    timestamp:   isDark ? '#475569'                 : '#64748b',
    srItemBg:    isDark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.04)',
    srItemBorder:isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.10)',
    srTitle:     isDark ? '#e2e8f0'                 : '#0f172a',
  };

  /* ── Fetch counts ─────────────────────────── */
  useEffect(() => {
  if (!user) return;
  setStatsLoading(true);
  const srRef = collection(db, 'serviceRequests');

  // Live listener for ALL user requests
  const unsubAll = onSnapshot(
    query(srRef, where('submittedByUid', '==', user.uid)),
    (snap) => {
      const all = snap.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        services:  all.length,
        pending:   all.filter(d => d.status === 'pending').length,
        resolved:  all.filter(d => d.status === 'completed' || d.status === 'resolved').length,
      }));
      setStatsLoading(false);
    }
  );

  // Live listener for announcements count
  const unsubAnn = onSnapshot(
    query(collection(db, 'announcements'), limit(50)),
    (snap) => {
      setStats(prev => ({ ...prev, announcements: snap.size }));
    }
  );

  return () => {
    unsubAll();
    unsubAnn();
  };
}, [user]);

  /* ── Live campus alerts ───────────────────── */
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(4));
    const unsub = onSnapshot(q,
      (snap) => { setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setAlertsLoading(false); },
      () => setAlertsLoading(false)
    );
    return unsub;
  }, []);

  /* ── Recent service requests ──────────────── */
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'serviceRequests'),
      where('submittedByUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsub = onSnapshot(q,
      (snap) => { setRecentServices(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setServicesLoading(false); },
      () => setServicesLoading(false)
    );
    return unsub;
  }, [user]);

  /* ── Time ago ─────────────────────────────── */
  const timeAgo = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff  = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <AnimatedBackground dark={isDark}>
    <div style={{ padding: '24px 32px 48px', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Welcome header ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 0 3px rgba(99,102,241,0.28)',
            fontFamily: "'Outfit', sans-serif",
          }}>{avatarLetter}</div>
          <div>
            <h1 style={{
              color: tc.heading, fontSize: '22px', fontWeight: 700, margin: 0,
              fontFamily: "'Outfit', sans-serif",
              WebkitFontSmoothing: 'antialiased',
            }}>
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p style={{ color: tc.muted, fontSize: '13px', margin: '3px 0 0' }}>
              Here's what's happening across campus today
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.button
            onClick={() => setRefreshKey(k => k + 1)}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', border: `1px solid ${tc.cardBorder}`,
              cursor: 'pointer', background: tc.refreshBg, color: tc.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </motion.button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: tc.dateBadgeBg,
            border: `1px solid ${tc.dateBadgeBorder}`,
            borderRadius: '12px', padding: '8px 14px',
            color: tc.subtext, fontSize: '13px', fontWeight: 500,
          }}>
            <Calendar size={14} color="#6366f1" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ─────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '28px',
      }}>
        <StatCard icon={Wrench}       label="My Service Requests" value={stats.services}      color="blue"   loading={statsLoading} delay={0}    />
        <StatCard icon={Clock}        label="Pending Requests"     value={stats.pending}       color="orange" loading={statsLoading} delay={0.06} />
        <StatCard icon={CheckCircle2} label="Resolved Requests"    value={stats.resolved}      color="green"  loading={statsLoading} delay={0.12} />
        <StatCard icon={Bell}         label="Campus Announcements" value={stats.announcements} color="purple" loading={statsLoading} delay={0.18} />
      </div>

      

      {/* ── Feature Cards ──────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          color: tc.sectionLabel, fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px',
        }}>Core Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FeatureCard
            icon={Map} title="Campus Map" color="#3b82f6" delay={0.05}
            description="Explore building layouts, find rooms, labs, and facilities across campus interactively."
            badge="Interactive"
            onClick={() => navigate('/map')}
          />
          <FeatureCard
            icon={Wrench} title="Services" color="#f97316" delay={0.1}
            description="Submit maintenance requests, track their status, and get updates on service tickets."
            badge={stats.pending > 0 ? `${stats.pending} pending` : undefined}
            onClick={() => navigate('/services')}
          />
          <FeatureCard
            icon={Bot} title="AI Assistant" color="#8b5cf6" delay={0.15}
            description="Ask CampusIQ anything — room locations, staff info, schedules, documents, and more."
            badge="AI Powered"
            onClick={() => navigate('/chatbot')}
          />
        </div>
      </div>

      {/* ── Alerts + Recent Requests ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Campus Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: tc.cardBg,
            border: `1px solid ${tc.cardBorder}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '18px', padding: '22px', minHeight: '260px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{
              color: tc.heading, fontSize: '15px', fontWeight: 700, margin: 0,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: "'Outfit', sans-serif",
              WebkitFontSmoothing: 'antialiased',
            }}>
              <AlertCircle size={16} color="#ef4444" /> Campus Alerts
            </h2>
            <motion.button
              onClick={() => navigate('/services')}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ChevronRight size={13} />
            </motion.button>
          </div>

          {alertsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3].map(i => <Shimmer key={i} h="52px" r="10px" />)}
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ textAlign: 'center', color: tc.muted, fontSize: '13px', paddingTop: '30px' }}>
              <Bell size={28} style={{ marginBottom: '8px', opacity: 0.4, display: 'block', margin: '0 auto 8px' }} />
              No announcements yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map((alert, i) => {
                const type      = alert.type || 'info';
                const s         = ALERT_STYLES[type] || ALERT_STYLES.info;
                const IconComp  = s.icon;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      background: s.bg, borderRadius: '12px', padding: '12px 14px',
                      border: `1px solid ${s.color}30`,
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: s.color + '22', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComp size={14} color={s.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: tc.alertText, fontSize: '13px', margin: 0, fontWeight: 500, lineHeight: 1.4,
                        WebkitFontSmoothing: 'antialiased',
                      }}>
                        {alert.title || alert.message || 'Announcement'}
                      </p>
                      {alert.body && (
                        <p style={{ color: tc.alertSub, fontSize: '11px', margin: '3px 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {alert.body}
                        </p>
                      )}
                      <span style={{ color: tc.timestamp, fontSize: '11px' }}>{timeAgo(alert.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Service Requests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          style={{
            background: tc.cardBg,
            border: `1px solid ${tc.cardBorder}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '18px', padding: '22px', minHeight: '260px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{
              color: tc.heading, fontSize: '15px', fontWeight: 700, margin: 0,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: "'Outfit', sans-serif",
              WebkitFontSmoothing: 'antialiased',
            }}>
              <Activity size={16} color="#6366f1" /> My Recent Requests
            </h2>
            <motion.button
              onClick={() => navigate('/services')}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.28)',
                color: '#818cf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                borderRadius: '8px', padding: '5px 12px',
              }}
            >
              + New
            </motion.button>
          </div>

          {servicesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3].map(i => <Shimmer key={i} h="60px" r="10px" />)}
            </div>
          ) : recentServices.length === 0 ? (
            <div style={{ textAlign: 'center', color: tc.muted, fontSize: '13px', paddingTop: '20px' }}>
              <Wrench size={28} style={{ opacity: 0.4, display: 'block', margin: '0 auto 8px' }} />
              No service requests yet.<br />
              <span onClick={() => navigate('/services')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                Submit your first request →
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentServices.map((sr, i) => (
                <motion.div
                  key={sr.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => navigate('/services')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: tc.srItemBg, borderRadius: '12px', padding: '12px 14px',
                    border: `1px solid ${tc.srItemBorder}`, cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                  whileHover={{ borderColor: 'rgba(99,102,241,0.35)' }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={15} color="#818cf8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: tc.srTitle, fontSize: '13px', margin: 0, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      WebkitFontSmoothing: 'antialiased',
                    }}>
                      {sr.title || sr.category || 'Service Request'}
                    </p>
                    <span style={{ color: tc.timestamp, fontSize: '11px' }}>{timeAgo(sr.createdAt)}</span>
                  </div>
                  <StatusPill status={sr.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── AI tip banner ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{
          marginTop: '20px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.22)'}`,
          borderRadius: '14px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}
      >
        <Zap size={18} color="#818cf8" />
        <p style={{ color: tc.subtext, fontSize: '13px', margin: 0, flex: 1 }}>
          <strong style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}>Pro tip:</strong> Use the{' '}
          <span onClick={() => navigate('/chatbot')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>AI Assistant</span>
          {' '}to instantly find room locations, staff contacts, and document info across campus.
        </p>
        <motion.button
          onClick={() => navigate('/chatbot')}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
            borderRadius: '10px', padding: '8px 16px', color: '#fff',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <MessageSquare size={13} /> Ask AI
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
    </AnimatedBackground>
  );
};

export default Dashboard;