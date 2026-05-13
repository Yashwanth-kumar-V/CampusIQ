// src/components/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Moon, Sun, Monitor, Globe, Palette,
  Volume2, Wifi, Lock, Key, Trash2, Download,
  ChevronRight, Check, Camera, Mail, Phone, BookOpen,
  Eye, EyeOff, RefreshCw, LogOut, Smartphone, AlertTriangle, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { useUserSettings } from '../hooks/useUserSettings';
import { auth } from '../firebase'; // adjust if needed
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

/* ─── Theme-aware color palette ──────────────────────────────────── */
const useColors = (isDark) => ({
  cardBg:        isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
  cardBorder:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  rowBorder:     isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
  sectionHdrBg:  isDark ? 'rgba(99,102,241,0.05)'  : 'rgba(99,102,241,0.06)',
  inputBg:       isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)',
  inputBorder:   isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(0,0,0,0.12)',
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
  themePickerBorder:   isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
  themePickerBg:       isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  themePickerActiveBg: isDark ? 'rgba(99,102,241,0.15)'  : 'rgba(99,102,241,0.12)',
  dangerZoneBg:     isDark ? 'rgba(239,68,68,0.04)'  : 'rgba(239,68,68,0.04)',
  dangerZoneBorder: isDark ? 'rgba(239,68,68,0.20)'  : 'rgba(239,68,68,0.20)',
  dangerZoneHdr:    isDark ? 'rgba(239,68,68,0.10)'  : 'rgba(239,68,68,0.08)',
  securityHdr:  isDark ? 'rgba(16,185,129,0.05)'  : 'rgba(16,185,129,0.06)',
  dataHdr:      isDark ? 'rgba(99,102,241,0.05)'  : 'rgba(99,102,241,0.06)',
  notifHdr:     isDark ? 'rgba(245,158,11,0.05)'  : 'rgba(245,158,11,0.06)',
  btnBorder: (color) => isDark ? `${color}33` : `${color}44`,
  btnBg:     (color) => isDark ? `${color}11` : `${color}15`,
});

/* ─── Reusable Toggle ─────────────────────────────────────────────── */
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

/* ─── SectionCard ─────────────────────────────────────────────────── */
const SectionCard = ({ children, style = {}, c }) => (
  <div style={{
    background: c?.cardBg || 'rgba(255,255,255,0.03)',
    border: `1px solid ${c?.cardBorder || 'rgba(255,255,255,0.07)'}`,
    borderRadius: '16px', overflow: 'hidden', ...style,
  }}>
    {children}
  </div>
);

/* ─── SettingRow ──────────────────────────────────────────────────── */
const SettingRow = ({ icon: Icon, iconColor = '#6366f1', title, subtitle, children, last = false, c }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 20px',
    borderBottom: last ? 'none' : `1px solid ${c?.rowBorder || 'rgba(255,255,255,0.05)'}`,
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      background: `${iconColor}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor,
    }}>
      <Icon size={17} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: c?.label, fontSize: '14px', fontWeight: 500, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ color: c?.sublabel, fontSize: '12px', margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

/* ─── Toast notification ──────────────────────────────────────────── */
const Toast = ({ msg, type = 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      padding: '12px 20px', borderRadius: '12px',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: '#fff', fontWeight: 600, fontSize: '13px',
      boxShadow: `0 8px 24px ${type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
      display: 'flex', alignItems: 'center', gap: '8px',
    }}
  >
    {type === 'success' ? <Check size={15} /> : <AlertTriangle size={15} />}
    {msg}
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN SETTINGS COMPONENT
═══════════════════════════════════════════════════════════════════ */
const Settings = ({ user, setUser }) => {
  const { isDark, toggleTheme } = useTheme();
  const c = useColors(isDark);

  // ── Get current Firebase Auth user ──
  const firebaseUser = auth.currentUser;
  const uid = firebaseUser?.uid;

  // ── Firebase settings hook ──
  const { settings, loading, saving, saveSection, updateField } = useUserSettings(uid);

  // ── Local UI state ──
  const [activeTab, setActiveTab]     = useState('profile');
  const [toast, setToast]             = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm]           = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading]     = useState(false);

  // ── Local profile form (synced from Firebase) ──
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', phone: '', department: '', bio: '', avatarInitials: 'YA',
  });

  // ── Sync profile form when settings load ──
  useEffect(() => {
    if (!loading && settings.profile) {
      setProfileForm({
        name:            settings.profile.name            || firebaseUser?.displayName || '',
        email:           settings.profile.email           || firebaseUser?.email        || '',
        phone:           settings.profile.phone           || '',
        department:      settings.profile.department      || '',
        bio:             settings.profile.bio             || '',
        avatarInitials:  settings.profile.avatarInitials  || getInitials(firebaseUser?.displayName || firebaseUser?.email),
      });
    }
  }, [loading]);

  function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'YA';
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Save Profile ──────────────────────────────────────────────────
  const saveProfile = async () => {
    try {
      const initials = getInitials(profileForm.name);
      await saveSection('profile', { ...profileForm, avatarInitials: initials });
      if (setUser) setUser(prev => ({ ...prev, name: profileForm.name, avatar: initials }));
      setProfileSaved(true);
      showToast('Profile saved successfully!');
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      showToast('Failed to save profile', 'error');
    }
  };

  // ── Appearance helpers ────────────────────────────────────────────
  const handleThemeSelect = async (id) => {
    await updateField('appearance', 'theme', id);
    if (id === 'dark'  && !isDark)  toggleTheme();
    if (id === 'light' && isDark)   toggleTheme();
  };

const handleAccentSelect = async (color) => {
  await updateField('appearance', 'accentColor', color);
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--primary', color);
  document.documentElement.style.setProperty('--primary-light', color + 'cc');
  document.documentElement.style.setProperty('--border-accent', color + '80');
};

const handleFontSize = async (size) => {
  await updateField('appearance', 'fontSize', size);
  const sizeMap = { small: '13px', medium: '15px', large: '17px' };
  document.documentElement.style.setProperty('--font-size-base', sizeMap[size]);
};

  // ── Notification toggle ───────────────────────────────────────────
  const toggleNotif = (key) => (val) => updateField('notifications', key, val);

  // ── Privacy toggle ────────────────────────────────────────────────
  const togglePrivacy = (key) => (val) => updateField('privacy', key, val);

  // ── Account toggle ────────────────────────────────────────────────
  const toggleAccount = (key) => (val) => updateField('account', key, val);

  // ── Change Password via Firebase Auth ────────────────────────────
  const handlePasswordChange = async () => {
    if (pwForm.newPw !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (pwForm.newPw.length < 6)         { showToast('Min 6 characters required', 'error'); return; }
    setPwLoading(true);
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, pwForm.current);
      await reauthenticateWithCredential(firebaseUser, cred);
      await updatePassword(firebaseUser, pwForm.newPw);
      showToast('Password updated!');
      setShowPasswordForm(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e) {
      showToast(e.code === 'auth/wrong-password' ? 'Current password is incorrect' : 'Update failed', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Sign out ──────────────────────────────────────────────────────
  const handleSignOut = () => {
    auth.signOut().catch(() => showToast('Sign out failed', 'error'));
  };

  const tabs = [
    { id: 'profile',       icon: User,    label: 'Profile'       },
    { id: 'appearance',    icon: Palette, label: 'Appearance'    },
    { id: 'notifications', icon: Bell,    label: 'Notifications' },
    { id: 'privacy',       icon: Shield,  label: 'Privacy'       },
    { id: 'account',       icon: Key,     label: 'Account'       },
  ];

  const themes    = [{ id: 'dark', icon: Moon, label: 'Dark' }, { id: 'light', icon: Sun, label: 'Light' }, { id: 'system', icon: Monitor, label: 'System' }];
  const accents   = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const ap        = settings.appearance;
  const notifs    = settings.notifications;
  const privacy   = settings.privacy;
  const account   = settings.account;

  const inputStyle = {
    background: c.inputBg, border: `1px solid ${c.inputBorder}`,
    borderRadius: '8px', color: c.inputColor, fontSize: '13px',
    padding: '7px 12px', width: '200px', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <RefreshCw size={28} color="#6366f1" />
      </motion.div>
    </div>
  );

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: c.heading, margin: 0, marginBottom: '6px' }}>
          Settings
        </h1>
        <p style={{ color: c.subheading, fontSize: '14px', margin: 0 }}>
          Manage your account preferences and campus experience
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Sidebar ── */}
        <SectionCard c={c}>
          {tabs.map((tab, i) => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ x: 3 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                padding: '12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === tab.id ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.10)') : 'transparent',
                borderLeft: activeTab === tab.id ? '3px solid #6366f1' : '3px solid transparent',
                color: activeTab === tab.id ? c.tabActive : c.tabInactive,
                fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
                borderBottom: i < tabs.length - 1 ? c.tabBorder : 'none',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </motion.button>
          ))}
        </SectionCard>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >

            {/* ════ PROFILE ════ */}
            {activeTab === 'profile' && (
              <>
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
                        {settings.profile?.avatarInitials || getInitials(profileForm.name)}
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
                        {profileForm.name || firebaseUser?.displayName || 'Your Name'}
                      </p>
                      <p style={{ color: c.subheading, fontSize: '13px', margin: '3px 0 0' }}>
                        {user?.id || 'STU2024001'} · {profileForm.department || 'Department'}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard c={c}>
                  {[
                    { icon: User,     color: '#6366f1', label: 'Full Name',  key: 'name',       type: 'text'  },
                    { icon: Mail,     color: '#06b6d4', label: 'Email',      key: 'email',      type: 'email' },
                    { icon: Phone,    color: '#10b981', label: 'Phone',      key: 'phone',      type: 'tel'   },
                    { icon: BookOpen, color: '#f59e0b', label: 'Department', key: 'department', type: 'text'  },
                  ].map((field, i, arr) => (
                    <SettingRow key={field.key} icon={field.icon} iconColor={field.color} title={field.label}
                      last={i === arr.length - 1} c={c}
                    >
                      <input type={field.type} value={profileForm[field.key] || ''}
                        onChange={e => setProfileForm(p => ({ ...p, [field.key]: e.target.value }))}
                        style={inputStyle}
                      />
                    </SettingRow>
                  ))}
                  <div style={{ padding: '14px 20px' }}>
                    <p style={{ color: c.bioLabel, fontSize: '12px', marginBottom: '8px' }}>Bio</p>
                    <textarea rows={3} value={profileForm.bio || ''}
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

                <motion.button onClick={saveProfile} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  disabled={saving}
                  style={{
                    padding: '12px 28px', borderRadius: '12px', border: 'none',
                    background: profileSaved ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontWeight: 700, fontSize: '14px', cursor: saving ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: "'DM Sans', sans-serif", alignSelf: 'flex-start',
                    boxShadow: profileSaved ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 20px rgba(99,102,241,0.3)',
                    transition: 'background 0.3s ease',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                    : profileSaved ? <><Check size={16} /> Saved!</>
                    : 'Save Changes'}
                </motion.button>
              </>
            )}

            {/* ════ APPEARANCE ════ */}
            {activeTab === 'appearance' && (
              <SectionCard c={c}>
                {/* Theme */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.rowBorder}` }}>
                  <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Theme</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {themes.map(t => (
                      <motion.button key={t.id} onClick={() => handleThemeSelect(t.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                          border: ap.theme === t.id ? '1px solid #6366f1' : `1px solid ${c.themePickerBorder}`,
                          background: ap.theme === t.id ? c.themePickerActiveBg : c.themePickerBg,
                          color: ap.theme === t.id ? c.tabActive : c.tabInactive,
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
                      <motion.button key={ac} onClick={() => handleAccentSelect(ac)}
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: ac,
                          border: ap.accentColor === ac ? '3px solid #6366f1' : '3px solid transparent',
                          cursor: 'pointer', boxShadow: ap.accentColor === ac ? `0 0 12px ${ac}80` : 'none',
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
                      <button key={s} onClick={() => handleFontSize(s)}
                        style={{
                          padding: '7px 18px', borderRadius: '8px', cursor: 'pointer',
                          border: ap.fontSize === s ? '1px solid #6366f1' : `1px solid ${c.themePickerBorder}`,
                          background: ap.fontSize === s ? c.themePickerActiveBg : 'transparent',
                          color: ap.fontSize === s ? c.tabActive : c.tabInactive,
                          fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize',
                        }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
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
                    <Toggle checked={notifs.push} onChange={toggleNotif('push')} />
                  </SettingRow>
                  <SettingRow icon={Mail} iconColor="#06b6d4" title="Email Notifications" subtitle="Receive important updates via email" c={c}>
                    <Toggle checked={notifs.email} onChange={toggleNotif('email')} color="#06b6d4" />
                  </SettingRow>
                  <SettingRow icon={Phone} iconColor="#10b981" title="SMS Alerts" subtitle="Critical alerts via text message" last c={c}>
                    <Toggle checked={notifs.sms} onChange={toggleNotif('sms')} color="#10b981" />
                  </SettingRow>
                </SectionCard>

                <SectionCard c={c}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.rowBorder}`, background: c.notifHdr }}>
                    <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Notification Types</p>
                  </div>
                  {[
                    { key: 'events',        icon: Globe,    color: '#6366f1', title: 'Events',         sub: 'Campus events and registrations'    },
                    { key: 'maintenance',   icon: Wrench,   color: '#f59e0b', title: 'Maintenance',    sub: 'Service updates and completion'     },
                    { key: 'alerts',        icon: Bell,     color: '#ef4444', title: 'Safety Alerts',  sub: 'Emergency and safety notifications' },
                    { key: 'grades',        icon: BookOpen, color: '#10b981', title: 'Grades',         sub: 'Academic results and feedback'      },
                    { key: 'announcements', icon: Volume2,  color: '#8b5cf6', title: 'Announcements',  sub: 'General campus announcements'       },
                  ].map((n, i, arr) => (
                    <SettingRow key={n.key} icon={n.icon} iconColor={n.color} title={n.title} subtitle={n.sub} last={i === arr.length - 1} c={c}>
                      <Toggle checked={notifs[n.key]} onChange={toggleNotif(n.key)} color={n.color} />
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
                  <SettingRow icon={Key} iconColor="#6366f1" title="Change Password" subtitle="Last changed 30 days ago" last c={c}>
                    <button onClick={() => setShowPasswordForm(!showPasswordForm)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px',
                        border: `1px solid ${c.btnBorder('#6366f1')}`, background: c.btnBg('#6366f1'),
                        color: '#a5b4fc', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {showPasswordForm ? <EyeOff size={13} /> : <Eye size={13} />} Update
                    </button>
                  </SettingRow>

                  {/* Inline password form */}
                  <AnimatePresence>
                    {showPasswordForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            { label: 'Current Password', key: 'current' },
                            { label: 'New Password',     key: 'newPw'   },
                            { label: 'Confirm New',      key: 'confirm' },
                          ].map(f => (
                            <div key={f.key}>
                              <p style={{ color: c.bioLabel, fontSize: '11px', marginBottom: '4px' }}>{f.label}</p>
                              <input type="password" value={pwForm[f.key]}
                                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                              />
                            </div>
                          ))}
                          <button onClick={handlePasswordChange} disabled={pwLoading}
                            style={{
                              padding: '9px 20px', borderRadius: '8px', border: 'none',
                              background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: '13px',
                              cursor: pwLoading ? 'wait' : 'pointer', alignSelf: 'flex-start',
                              fontFamily: "'DM Sans', sans-serif", opacity: pwLoading ? 0.7 : 1,
                            }}
                          >
                            {pwLoading ? 'Updating…' : 'Update Password'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SectionCard>

                <SectionCard c={c}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.rowBorder}`, background: c.dataHdr }}>
                    <p style={{ color: c.sectionLabel, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Data & Visibility</p>
                  </div>
                  <SettingRow icon={Globe} iconColor="#06b6d4" title="Share Location" subtitle="Allow campus services to use your location" c={c}>
                    <Toggle checked={privacy.locationShare} onChange={togglePrivacy('locationShare')} color="#06b6d4" />
                  </SettingRow>
                  <SettingRow icon={Eye} iconColor="#8b5cf6" title="Activity Visible" subtitle="Show your online status to other students" c={c}>
                    <Toggle checked={privacy.activityVisible} onChange={togglePrivacy('activityVisible')} color="#8b5cf6" />
                  </SettingRow>
                  <SettingRow icon={Download} iconColor="#10b981" title="Data Collection" subtitle="Help improve CampusIQ with anonymous usage data" last c={c}>
                    <Toggle checked={privacy.dataCollection} onChange={togglePrivacy('dataCollection')} color="#10b981" />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* ════ ACCOUNT ════ */}
            {activeTab === 'account' && (
              <>
                <SectionCard c={c}>
                  <SettingRow icon={Volume2} iconColor="#f59e0b" title="Sound Effects" subtitle="UI feedback sounds" c={c}>
                    <Toggle checked={account.soundEffects} onChange={toggleAccount('soundEffects')} color="#f59e0b" />
                  </SettingRow>
                  <SettingRow icon={Eye} iconColor="#a78bfa" title="High Contrast" subtitle="Improve visibility for accessibility" c={c}>
                    <Toggle checked={account.highContrast} onChange={toggleAccount('highContrast')} color="#a78bfa" />
                  </SettingRow>
                  <SettingRow icon={Monitor} iconColor="#06b6d4" title="Screen Reader Support" subtitle="Optimised ARIA labels and roles" last c={c}>
                    <Toggle checked={account.screenReader} onChange={toggleAccount('screenReader')} color="#06b6d4" />
                  </SettingRow>
                </SectionCard>

                {/* Danger Zone */}
                <SectionCard c={c} style={{ border: `1px solid ${c.dangerZoneBorder}`, background: c.dangerZoneBg }}>
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${c.dangerZoneHdr}` }}>
                    <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={13} /> Danger Zone
                    </p>
                  </div>
                  <SettingRow icon={LogOut} iconColor="#ef4444" title="Sign Out" subtitle="Sign out from all devices" c={c}>
                    <button onClick={handleSignOut} style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}>Sign Out</button>
                  </SettingRow>
                  <SettingRow icon={Trash2} iconColor="#ef4444" title="Delete Account" subtitle="Permanently remove your account and data" last c={c}>
                    <button onClick={() => {
                      if (window.confirm('Are you sure? This cannot be undone.')) {
                        firebaseUser?.delete().then(() => showToast('Account deleted')).catch(() => showToast('Re-login required first', 'error'));
                      }
                    }} style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.15)',
                      color: '#fca5a5', fontSize: '12px', cursor: 'pointer', fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>Delete</button>
                  </SettingRow>
                </SectionCard>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Settings;