// src/components/NotificationPanel.jsx
// Drop-in notification dropdown for the CampusIQ navbar bell icon.
// Reads/writes from Firestore: users/{uid}/notifications/{docId}
// Usage in Navigation.jsx — see instructions at the bottom of this file.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, X, Calendar,
  Wrench, AlertTriangle, BookOpen, Volume2, Globe,
  RefreshCw, BellOff, Filter
} from 'lucide-react';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase'; // adjust path if needed

/* ─── Notification type config ───────────────────────────────────── */
const TYPE_CONFIG = {
  event:        { icon: Calendar,      color: '#6366f1', label: 'Event'        },
  maintenance:  { icon: Wrench,        color: '#f59e0b', label: 'Maintenance'  },
  alert:        { icon: AlertTriangle, color: '#ef4444', label: 'Safety Alert' },
  grade:        { icon: BookOpen,      color: '#10b981', label: 'Grade'        },
  announcement: { icon: Volume2,       color: '#8b5cf6', label: 'Announcement' },
  general:      { icon: Globe,         color: '#06b6d4', label: 'General'      },
};

/* ─── Relative time helper ───────────────────────────────────────── */
function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff  = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Single notification row ────────────────────────────────────── */
const NotifItem = ({ notif, onRead, onDelete, isDark }) => {
  const cfg  = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1,  x: 0  }}
      exit={{    opacity: 0,  x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '13px 16px',
        background: notif.read
          ? 'transparent'
          : isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.05)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.05)'
          : '1px solid rgba(0,0,0,0.06)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s',
      }}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div style={{
          position: 'absolute', top: '14px', left: '6px',
          width: '6px', height: '6px', borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 6px ${cfg.color}`,
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: `${cfg.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.color,
      }}>
        <Icon size={16} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: cfg.color,
            background: `${cfg.color}18`, padding: '2px 7px', borderRadius: '20px',
          }}>{cfg.label}</span>
          <span style={{
            fontSize: '11px', color: isDark ? '#6b7280' : '#94a3b8',
            marginLeft: 'auto', whiteSpace: 'nowrap',
          }}>{timeAgo(notif.createdAt)}</span>
        </div>
        <p style={{
          margin: 0, fontSize: '13px', fontWeight: notif.read ? 400 : 600,
          color: isDark ? '#e2e8f0' : '#0f172a',
          lineHeight: '1.4',
        }}>{notif.title}</p>
        {notif.body && (
          <p style={{
            margin: '3px 0 0', fontSize: '12px',
            color: isDark ? '#6b7280' : '#64748b',
            lineHeight: '1.4',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{notif.body}</p>
        )}
      </div>

      {/* Delete btn */}
      <motion.button
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          color: isDark ? '#4b5563' : '#94a3b8', flexShrink: 0,
          borderRadius: '6px', display: 'flex', alignItems: 'center',
        }}
      >
        <X size={13} />
      </motion.button>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN NOTIFICATION PANEL
═══════════════════════════════════════════════════════════════════ */
const NotificationPanel = ({ uid, isDark }) => {
  const [open,         setOpen]         = useState(false);
  const [notifications,setNotifications]= useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all'); // all | unread
  const panelRef = useRef(null);

  /* ── Real-time Firestore listener ─────────────────────────────── */
  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [uid]);

  /* ── Close on outside click ───────────────────────────────────── */
  useEffect(() => {
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Actions ──────────────────────────────────────────────────── */
  const markRead = useCallback(async (id) => {
    await updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true });
  }, [uid]);

  const deleteNotif = useCallback(async (id) => {
    await deleteDoc(doc(db, 'users', uid, 'notifications', id));
  }, [uid]);

  const markAllRead = useCallback(async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'users', uid, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  }, [uid, notifications]);

  const clearAll = useCallback(async () => {
    const batch = writeBatch(db);
    notifications.forEach(n => {
      batch.delete(doc(db, 'users', uid, 'notifications', n.id));
    });
    await batch.commit();
  }, [uid, notifications]);

  /* ── Derived ─────────────────────────────────────────────────── */
  const unreadCount   = notifications.filter(n => !n.read).length;
  const filtered      = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const badgeColor    = isDark ? '#ef4444' : '#ef4444';
  const panelBg       = isDark ? '#0f1623' : '#ffffff';
  const panelBorder   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const headerBg      = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const textPrimary   = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#6b7280' : '#64748b';
  const emptyColor    = isDark ? '#374151' : '#cbd5e1';

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>

      {/* ── Bell Button ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', width: '38px', height: '38px',
          borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: open
            ? (isDark ? 'rgba(99,102,241,0.20)' : 'rgba(99,102,241,0.12)')
            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#a5b4fc' : (isDark ? '#9ca3af' : '#64748b'),
          transition: 'all 0.2s',
        }}
      >
        {/* Animated bell shake on new notifs */}
        <motion.div
          animate={unreadCount > 0 ? {
            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
          } : {}}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
        >
          <Bell size={17} />
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: '2px', right: '2px',
                minWidth: '16px', height: '16px', borderRadius: '8px',
                background: badgeColor, color: '#fff',
                fontSize: '9px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px', lineHeight: 1,
                border: isDark ? '2px solid #0a0e1a' : '2px solid #fff',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1   }}
            exit={{    opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: '380px', maxHeight: '520px',
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              borderRadius: '18px',
              boxShadow: isDark
                ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 24px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              zIndex: 9999,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >

            {/* Header */}
            <div style={{
              padding: '16px 18px 12px',
              background: headerBg,
              borderBottom: `1px solid ${panelBorder}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#6366f1" />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: textPrimary }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {unreadCount > 0 && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={markAllRead} title="Mark all read"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '8px', border: 'none',
                        background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <CheckCheck size={12} /> All read
                    </motion.button>
                  )}
                  {notifications.length > 0 && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={clearAll} title="Clear all"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '8px', border: 'none',
                        background: 'rgba(239,68,68,0.10)', color: '#f87171',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} /> Clear
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'all',    label: `All (${notifications.length})`    },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    style={{
                      padding: '5px 14px', borderRadius: '20px', border: 'none',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      background: filter === f.id
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: filter === f.id ? '#fff' : textSecondary,
                      transition: 'all 0.2s',
                    }}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {/* Notification list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <RefreshCw size={22} color="#6366f1" />
                  </motion.div>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <BellOff size={36} color={emptyColor} style={{ marginBottom: '12px' }} />
                  <p style={{ color: textSecondary, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                  </p>
                  <p style={{ color: isDark ? '#4b5563' : '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>
                    {filter === 'unread' ? 'No unread notifications.' : "You're all clear for now."}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map(notif => (
                    <NotifItem
                      key={notif.id}
                      notif={notif}
                      onRead={markRead}
                      onDelete={deleteNotif}
                      isDark={isDark}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '10px 18px',
                borderTop: `1px solid ${panelBorder}`,
                background: headerBg,
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '12px', color: textSecondary }}>
                  {notifications.length} total · {unreadCount} unread
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;

/*
 ╔══════════════════════════════════════════════════════════════╗
 ║            HOW TO ADD TO YOUR Navigation.jsx                ║
 ╠══════════════════════════════════════════════════════════════╣
 ║                                                              ║
 ║  1. Import at the top:                                       ║
 ║     import NotificationPanel from './NotificationPanel';     ║
 ║                                                              ║
 ║  2. Get uid from your auth context — e.g.:                   ║
 ║     const { user } = useAuth();                              ║
 ║     const uid = user?.uid;                                   ║
 ║                                                              ║
 ║  3. REMOVE your existing bell button and replace with:       ║
 ║     <NotificationPanel uid={uid} isDark={isDark} />          ║
 ║                                                              ║
 ║  That's it! The badge, panel, and Firebase sync are          ║
 ║  all self-contained inside this component.                   ║
 ╚══════════════════════════════════════════════════════════════╝
*/