import React, { useState } from 'react';
import {
  User, Bell, Shield, Moon, Sun, Monitor, Globe, Palette,
  Volume2, VolumeX, Wifi, Lock, Key, Trash2, Download,
  ChevronRight, Check, Camera, Mail, Phone, BookOpen,
  Eye, EyeOff, RefreshCw, LogOut, Smartphone, AlertTriangle, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';

/* ─── Theme-aware helpers ─────────────────────────────────────────── */
const useColors = (isDark) => ({
  // Surfaces
  cardBg:        isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
  cardBorder:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  rowBorder:     isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
  sectionHdrBg:  isDark ? 'rgba(99,102,241,0.05)'  : 'rgba(99,102,241,0.06)',
  inputBg:       isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)',
  inputBorder:   isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(0,0,0,0.12)',
  toggleOffBg:   isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(0,0,0,0.12)',

  // Text
  heading:       isDark ? '#f1f5f9'  : '#0f172a',
  subheading:    isDark ? '#6b7280'  : '#64748b',
  label:         isDark ? '#e2e8f0'  : '#1e293b',
  sublabel:      isDark ? '#6b7280'  : '#64748b',
  sectionLabel:  isDark ? '#9ca3af'  : '#64748b',
  inputColor:    isDark ? '#e2e8f0'  : '#0f172a',
  bioLabel:      isDark ? '#9ca3af'  : '#64748b',
  tabActive:     isDark ? '#a5b4fc'  : '#4f46e5',
  tabInactive:   isDark ? '#6b7280'  : '#64748b',
  tabBorder:     isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)',
  themePickerBorder:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
  themePickerBg:        isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  themePickerActiveBg:  isDark ? 'rgba(99,102,241,0.15)'  : 'rgba(99,102,241,0.12)',
  fontSizeBorder:       isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
  fontSizeBg:           isDark ? 'transparent'            : 'transparent',

  // Special
  dangerZoneBg:     isDark ? 'rgba(239,68,68,0.04)'  : 'rgba(239,68,68,0.04)',
  dangerZoneBorder: isDark ? 'rgba(239,68,68,0.20)'  : 'rgba(239,68,68,0.20)',
  dangerZoneHdr:    isDark ? 'rgba(239,68,68,0.10)'  : 'rgba(239,68,68,0.08)',
  preferenceItem:   isDark ? 'rgba(255,255,255,0.025)': 'rgba(0,0,0,0.03)',
  notifHdrGreen:    isDark ? 'rgba(245,158,11,0.05)'  : 'rgba(245,158,11,0.06)',
  notifHdrBlue:     isDark ? 'rgba(16,185,129,0.05)'  : 'rgba(16,185,129,0.06)',
  securityHdr:      isDark ? 'rgba(16,185,129,0.05)'  : 'rgba(16,185,129,0.06)',
  dataHdr:          isDark ? 'rgba(99,102,241,0.05)'  : 'rgba(99,102,241,0.06)',
  btnBorder: (color) => isDark ? `${color}33` : `${color}44`,
  btnBg:     (color) => isDark ? `${color}11` : `${color}15`,
});

/* ─── Toggle ────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, color = '#6366f1' }) => (
  <motion.button
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
      background: checked ? color : 'rgba(180,180,180,0.3)',
      position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.25s ease',
      boxShadow: checked ? `0 0 12px ${color}55` : 'none',
    }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.span
      animate={{ x: checked ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      style={{
        position: 'absolute', top: '2px', width: '20px', height: '20px',
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)', display: 'block',
      }}
    />
  </motion.button>
);

/* ─── SectionCard ────────────────────────────────────────────────── */
const SectionCard = ({ children, style = {}, c }) => (
  <div style={{
    background: c?.cardBg || 'rgba(255,255,255,0.03)',
    border: `1px solid ${c?.cardBorder || 'rgba(255,255,255,0.07)'}`,
    borderRadius: '16px',
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

/* ─── SettingRow ─────────────────────────────────────────────────── */
const SettingRow = ({ icon: Icon, iconColor = '#6366f1', title, subtitle, children, last = false, c }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 20px',
    borderBottom: last ? 'none' : c?.rowBorder ? `1px solid ${c.rowBorder}` : '1px solid rgba(255,255,255,0.05)',
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      background: `${iconColor}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: iconColor,
    }}>
      <Icon size={17} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: c?.label || '#e2e8f0', fontSize: '14px', fontWeight: 500, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ color: c?.sublabel || '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

/* ─── Settings Component ─────────────────────────────────────────── */
const Settings = ({ user, setUser }) => {
  const { isDark, toggleTheme } = useTheme();
  const c = useColors(isDark);

  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [profileForm, setProfileForm] = useState({
    name:       user?.name || 'Alex Johnson',
    email:      'alex.johnson@campus.edu',
    phone:      '+1 234 567 890',
    department: 'Computer Science & Engineering',
    bio:        'Passionate about tech and innovation.',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const saveProfile = () => {
    setProfileSaved(true);
    if (setUser) setUser(prev => ({ ...prev, name: profileForm.name }));
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Appearance
  const [theme, setTheme]           = useState(isDark ? 'dark' : 'light');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [fontSize, setFontSize]     = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactMode, setCompactMode]     = useState(false);

  const themes = [
    { id: 'dark',   icon: Moon,    label: 'Dark'   },
    { id: 'light',  icon: Sun,     label: 'Light'  },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  const handleThemeSelect = (id) => {
    setTheme(id);
    if (id === 'dark'  && !isDark)  toggleTheme();
    if (id === 'light' && isDark)   toggleTheme();
  };

  const accents = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  // Notifications
  const [notifs, setNotifs] = useState({
    push: true, email: true, sms: false,
    events: true, maintenance: true, alerts: true,
    grades: false, announcements: true,
  });

  // Privacy
  const [twoFA,            setTwoFA]            = useState(false);
  const [locationShare,    setLocationShare]    = useState(true);
  const [activityVisible,  setActivityVisible]  = useState(true);
  const [dataCollection,   setDataCollection]   = useState(true);
  const [showPassword,     setShowPassword]     = useState(false);

  // Accessibility
  const [highContrast,  setHighContrast]  = useState(false);
  const [screenReader,  setScreenReader]  = useState(false);
  const [soundEffects,  setSoundEffects]  = useState(true);

  const tabs = [
    { id: 'profile',       icon: User,    label: 'Profile'       },
    { id: 'appearance',    icon: Palette, label: 'Appearance'    },
    { id: 'notifications', icon: Bell,    label: 'Notifications' },
    { id: 'privacy',       icon: Shield,  label: 'Privacy'       },
    { id: 'account',       icon: Key,     label: 'Account'       },
  ];

  const containerVariants = {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800,
          color: c.heading, margin: 0, marginBottom: '6px',
        }}>Settings</h1>
        <p style={{ color: c.subheading, fontSize: '14px', margin: 0 }}>
          Manage your account preferences and campus experience
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Sidebar Tabs ── */}
        <SectionCard c={c}>
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: 3 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                padding: '12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === tab.id
                  ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.10)')
                  : 'transparent',
                borderLeft: activeTab === tab.id ? '3px solid #6366f1' : '3px solid transparent',
                color: activeTab === tab.id ? c.tabActive : c.tabInactive,
                fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
                borderBottom: i < tabs.length - 1 ? c.tabBorder : 'none',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
              )}
            </motion.button>
          ))}
        </SectionCard>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >

            {/* ════ PROFILE ════ */}
            {activeTab === 'profile' && (
              <>
                {/* Avatar card */}
                <SectionCard c={c}>
                  <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '76px', height: '76px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '26px', fontWeight: 700, color: '#fff',
                        border: '3px solid rgba(99,102,241,0.4)',
                        boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                      }}>
                        {user?.avatar || 'YA'}
                      </div>
                      <button style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: '#6366f1', border: `2px solid ${isDark ? '#0a0e1a' : '#f0f2f8'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff',
                      }}>
                        <Camera size={12} />
                      </button>
                    </div>
                    <div>
                      <p style={{ color: c.heading, fontWeight: 700, fontSize: '17px', margin: 0 }}>
                        {profileForm.name}
                      </p>
                      <p style={{ color: c.subheading, fontSize: '13px', margin: '3px 0 0' }}>
                        {user?.id || 'STU2024001'} · {profileForm.department}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                {/* Form */}
                <SectionCard c={c}>
                  {[
                    { icon: User,     color: '#6366f1', label: 'Full Name',  key: 'name',       type: 'text'  },
                    { icon: Mail,     color: '#06b6d4', label: 'Email',      key: 'email',      type: 'email' },
                    { icon: Phone,    color: '#10b981', label: 'Phone',      key: 'phone',      type: 'tel'   },
                    { icon: BookOpen, color: '#f59e0b', label: 'Department', key: 'department', type: 'text'  },
                  ].map((field, i, arr) => (
                    <SettingRow
                      key={field.key}
                      icon={field.icon}
                      iconColor={field.color}
                      title={field.label}
                      last={i === arr.length - 1}
                      c={c}
                    >
                      <input
                        type={field.type}
                        value={profileForm[field.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [field.key]: e.target.value }))}
                        style={{
                          background: c.inputBg,
                          border: `1px solid ${c.inputBorder}`,
                          borderRadius: '8px', color: c.inputColor, fontSize: '13px',
                          padding: '7px 12px', width: '200px', outline: 'none',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      />
                    </SettingRow>
                  ))}

                  {/* Bio */}
                  <div style={{ padding: '14px 20px' }}>
                    <p style={{ color: c.bioLabel, fontSize: '12px', marginBottom: '8px' }}>Bio</p>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                      style={{
                        width: '100%', background: c.inputBg,
                        border: `1px solid ${c.inputBorder}`, borderRadius: '10px',
                        color: c.inputColor, fontSize: '13px', padding: '10px 14px',
                        outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif",
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </SectionCard>

                <motion.button
                  onClick={saveProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '12px 28px', borderRadius: '12px', border: 'none',
                    background: profileSaved ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: profileSaved ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 20px rgba(99,102,241,0.3)',
                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                    alignSelf: 'flex-start',
                  }}
                >
                  {profileSaved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
                </motion.button>
              </>
            )}

            {/* ════ APPEARANCE ════ */}
            {activeTab === 'appearance' && (
              <SectionCard c={c}>
                {/* Theme picker */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.rowBorder}` }}>
                  <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Theme</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {themes.map(t => (
                      <motion.button
                        key={t.id}
                        onClick={() => handleThemeSelect(t.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                          border: theme === t.id ? '1px solid #6366f1' : `1px solid ${c.themePickerBorder}`,
                          background: theme === t.id ? c.themePickerActiveBg : c.themePickerBg,
                          color: theme === t.id ? c.tabActive : c.tabInactive,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          fontSize: '12px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <t.icon size={20} />
                        {t.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.rowBorder}` }}>
                  <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Accent Color</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {accents.map(ac => (
                      <motion.button
                        key={ac}
                        onClick={() => setAccentColor(ac)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: ac,
                          border: accentColor === ac ? '3px solid #6366f1' : '3px solid transparent',
                          cursor: 'pointer',
                          boxShadow: accentColor === ac ? `0 0 12px ${ac}80` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.rowBorder}` }}>
                  <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Font Size</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['small', 'medium', 'large'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        style={{
                          padding: '7px 18px', borderRadius: '8px', cursor: 'pointer',
                          border: fontSize === s ? '1px solid #6366f1' : `1px solid ${c.fontSizeBorder}`,
                          background: fontSize === s ? c.themePickerActiveBg : 'transparent',
                          color: fontSize === s ? c.tabActive : c.tabInactive,
                          fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <SettingRow icon={RefreshCw} iconColor="#8b5cf6" title="Reduced Motion" subtitle="Minimize animations throughout the UI" c={c}>
                  <Toggle checked={reducedMotion} onChange={setReducedMotion} />
                </SettingRow>
                <SettingRow icon={Monitor} iconColor="#06b6d4" title="Compact Mode" subtitle="Denser layout with smaller spacing" last c={c}>
                  <Toggle checked={compactMode} onChange={setCompactMode} />
                </SettingRow>
              </SectionCard>
            )}

            {/* ════ NOTIFICATIONS ════ */}
            {activeTab === 'notifications' && (
              <>
                <SectionCard c={c}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.rowBorder}`, background: c.sectionHdrBg }}>
                    <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Delivery Channels</p>
                  </div>
                  <SettingRow icon={Smartphone} iconColor="#6366f1" title="Push Notifications" subtitle="Get alerts directly on your device" c={c}>
                    <Toggle checked={notifs.push} onChange={v => setNotifs(p => ({ ...p, push: v }))} />
                  </SettingRow>
                  <SettingRow icon={Mail} iconColor="#06b6d4" title="Email Notifications" subtitle="Receive important updates via email" c={c}>
                    <Toggle checked={notifs.email} onChange={v => setNotifs(p => ({ ...p, email: v }))} color="#06b6d4" />
                  </SettingRow>
                  <SettingRow icon={Phone} iconColor="#10b981" title="SMS Alerts" subtitle="Critical alerts via text message" last c={c}>
                    <Toggle checked={notifs.sms} onChange={v => setNotifs(p => ({ ...p, sms: v }))} color="#10b981" />
                  </SettingRow>
                </SectionCard>

                <SectionCard c={c}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.rowBorder}`, background: c.notifHdrGreen }}>
                    <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Notification Types</p>
                  </div>
                  {[
                    { key: 'events',        icon: Globe,    color: '#6366f1', title: 'Events',        sub: 'Campus events and registrations'    },
                    { key: 'maintenance',   icon: Wrench,   color: '#f59e0b', title: 'Maintenance',   sub: 'Service updates and completion'     },
                    { key: 'alerts',        icon: Bell,     color: '#ef4444', title: 'Safety Alerts', sub: 'Emergency and safety notifications' },
                    { key: 'grades',        icon: BookOpen, color: '#10b981', title: 'Grades',        sub: 'Academic results and feedback'      },
                    { key: 'announcements', icon: Volume2,  color: '#8b5cf6', title: 'Announcements', sub: 'General campus announcements', last: true },
                  ].map(n => (
                    <SettingRow key={n.key} icon={n.icon} iconColor={n.color} title={n.title} subtitle={n.sub} last={n.last} c={c}>
                      <Toggle checked={notifs[n.key]} onChange={v => setNotifs(p => ({ ...p, [n.key]: v }))} color={n.color} />
                    </SettingRow>
                  ))}
                </SectionCard>
              </>
            )}

            {/* ════ PRIVACY ════ */}
            {activeTab === 'privacy' && (
              <>
                <SectionCard c={c}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.rowBorder}`, background: c.securityHdr }}>
                    <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Security</p>
                  </div>
                  <SettingRow icon={Shield} iconColor="#10b981" title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" c={c}>
                    <Toggle checked={twoFA} onChange={setTwoFA} color="#10b981" />
                  </SettingRow>
                  <SettingRow icon={Key} iconColor="#6366f1" title="Change Password" subtitle="Last changed 30 days ago" last c={c}>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px',
                        border: `1px solid ${c.btnBorder('#6366f1')}`,
                        background: c.btnBg('#6366f1'),
                        color: '#a5b4fc', fontSize: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />} Update
                    </button>
                  </SettingRow>
                </SectionCard>

                <SectionCard c={c}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.rowBorder}`, background: c.dataHdr }}>
                    <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Data & Visibility</p>
                  </div>
                  <SettingRow icon={Globe} iconColor="#06b6d4" title="Share Location" subtitle="Allow campus services to use your location" c={c}>
                    <Toggle checked={locationShare} onChange={setLocationShare} color="#06b6d4" />
                  </SettingRow>
                  <SettingRow icon={Eye} iconColor="#8b5cf6" title="Activity Visible" subtitle="Show your online status to other students" c={c}>
                    <Toggle checked={activityVisible} onChange={setActivityVisible} color="#8b5cf6" />
                  </SettingRow>
                  <SettingRow icon={Download} iconColor="#10b981" title="Data Collection" subtitle="Help improve CampusIQ with anonymous usage data" last c={c}>
                    <Toggle checked={dataCollection} onChange={setDataCollection} color="#10b981" />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* ════ ACCOUNT ════ */}
            {activeTab === 'account' && (
              <>
                <SectionCard c={c}>
                  {[
                    { icon: Download, color: '#06b6d4', title: 'Export My Data',   sub: 'Download a copy of all your data', action: 'Export' },
                    { icon: Wifi,     color: '#10b981', title: 'Connected Devices', sub: '2 devices currently signed in',    action: 'Manage' },
                    { icon: Globe,    color: '#8b5cf6', title: 'Language & Region', sub: 'English (US) · IST (UTC+5:30)',     action: 'Change' },
                  ].map((item, i) => (
                    <SettingRow key={i} icon={item.icon} iconColor={item.color} title={item.title} subtitle={item.sub} c={c}>
                      <button style={{
                        padding: '7px 14px', borderRadius: '8px',
                        border: `1px solid ${c.btnBorder(item.color)}`,
                        background: c.btnBg(item.color),
                        color: item.color, fontSize: '12px', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>{item.action}</button>
                    </SettingRow>
                  ))}

                  <SettingRow icon={Volume2} iconColor="#f59e0b" title="Sound Effects" subtitle="UI feedback sounds" c={c}>
                    <Toggle checked={soundEffects} onChange={setSoundEffects} color="#f59e0b" />
                  </SettingRow>
                  <SettingRow icon={Eye} iconColor="#a78bfa" title="High Contrast" subtitle="Improve visibility for accessibility" c={c}>
                    <Toggle checked={highContrast} onChange={setHighContrast} color="#a78bfa" />
                  </SettingRow>
                  <SettingRow icon={Monitor} iconColor="#06b6d4" title="Screen Reader Support" subtitle="Optimised ARIA labels and roles" last c={c}>
                    <Toggle checked={screenReader} onChange={setScreenReader} color="#06b6d4" />
                  </SettingRow>
                </SectionCard>

                {/* Danger zone */}
                <SectionCard c={c} style={{
                  border: `1px solid ${c.dangerZoneBorder}`,
                  background: c.dangerZoneBg,
                }}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.dangerZoneHdr}` }}>
                    <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={13} /> Danger Zone
                    </p>
                  </div>
                  <SettingRow icon={LogOut} iconColor="#ef4444" title="Sign Out" subtitle="Sign out from all devices" c={c}>
                    <button style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                      fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}>Sign Out</button>
                  </SettingRow>
                  <SettingRow icon={Trash2} iconColor="#ef4444" title="Delete Account" subtitle="Permanently remove your account and data" last c={c}>
                    <button style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.4)',
                      background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                      fontSize: '12px', cursor: 'pointer', fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>Delete</button>
                  </SettingRow>
                </SectionCard>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Settings;