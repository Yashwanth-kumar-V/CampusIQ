import AnimatedBackground from './AnimatedBackground';
import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench, Plus, Clock, CheckCircle2, AlertCircle, X,
  Upload, MapPin, Tag, Star, ThumbsUp, ThumbsDown,
  MessageSquare, User, Calendar, Layers, Send,
  ShieldCheck, Activity, ChevronRight, Bell, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getPriorityColor = (p) =>
  ({ high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }[p] ?? '#6b7280');

const getStatusColor = (s) => ({
  completed:   { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', border: 'rgba(34,197,94,0.3)'  },
  'in-progress':{ bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  pending:     { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
}[s] ?? { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' });

const getStatusIcon = (status) => {
  if (status === 'completed')  return <CheckCircle2 size={15} />;
  if (status === 'in-progress') return <Clock size={15} />;
  return <AlertCircle size={15} />;
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const Pill = ({ children, bg, color, border }) => (
  <span style={{
    background: bg, color, border: `1px solid ${border}`,
    fontSize: '11px', fontWeight: 700, padding: '3px 10px',
    borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4,
    letterSpacing: '0.04em', textTransform: 'capitalize',
  }}>{children}</span>
);

const MetaCell = ({ icon, label, value }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <span style={{ color: '#6b7280', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
      {icon} {label}
    </span>
    <span style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600 }}>{value}</span>
  </div>
);

// Progress timeline
const ProgressTimeline = ({ log }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    {log.map((entry, i) => {
      const sc = getStatusColor(entry.status);
      const isLast = i === log.length - 1;
      return (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          {/* line + dot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: sc.color,
              border: `2px solid ${sc.border}`, flexShrink: 0, marginTop: 4,
              boxShadow: `0 0 8px ${sc.color}55`,
            }}/>
            {!isLast && <div style={{ flex: 1, width: 2, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }}/>}
          </div>
          <div style={{ paddingBottom: isLast ? 0 : 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ color: sc.color, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                {entry.status}
              </span>
              <span style={{ color: '#4b5563', fontSize: 11 }}>• {entry.date}</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{entry.note}</p>
          </div>
        </div>
      );
    })}
  </div>
);

// Chat bubble
const ChatBubble = ({ msg, currentRole }) => {
  const isMine = msg.role === currentRole;
  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{ maxWidth: '78%' }}>
        {!isMine && (
          <p style={{ color: '#6b7280', fontSize: 10, margin: '0 0 3px 4px', fontWeight: 600 }}>
            {msg.sender} • {msg.role}
          </p>
        )}
        <div style={{
          background: isMine ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.07)',
          border: isMine ? 'none' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          padding: '9px 13px', color: '#e5e7eb', fontSize: 13, lineHeight: 1.5,
        }}>
          {msg.text}
        </div>
        <p style={{ color: '#374151', fontSize: 10, margin: '3px 4px 0', textAlign: isMine ? 'right' : 'left' }}>
          {fmtDate(msg.ts)} {fmtTime(msg.ts)}
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ServiceRequests = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Theme-aware palette
  const t = {
    textMain: isDark ? '#f1f5f9' : '#111827',
    textSub: isDark ? '#64748b' : '#475569',
    textMuted: isDark ? '#374151' : '#94a3b8',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.65)',
  };

  // role check
  const isSolver = user?.role === 'Faculty' || user?.role === 'Staff';

  const [showForm, setShowForm]               = useState(false);
  const [activeTab, setActiveTab]             = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [detailsForm, setDetailsForm]         = useState({ feedback: '', rating: 0, hoveredRating: 0 });
  const [chatInput, setChatInput]             = useState('');
  const [completionNote, setCompletionNote]   = useState('');
  const chatEndRef = useRef(null);

  const [newRequest, setNewRequest] = useState({
    title: '', category: '', priority: 'medium', location: '', description: ''
  });

  const categories = ['Maintenance', 'IT Support', 'Plumbing', 'Electrical', 'Cleaning', 'Security'];

  // ── Firestore real-time listener ─────────────────────────────────────────
  useEffect(() => {
  if (!user || !user.uid) return; // 🔥 FIX

  setLoading(true);

  let q;
  if (isSolver) {
    q = query(
      collection(db, 'serviceRequests'),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'serviceRequests'),
      where('submittedByUid', '==', user.uid)
    );
  }

  const unsub = onSnapshot(
    q,
    (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
      console.log("FETCHED DATA:", data); // 🔍 debug
      setRequests(data);
      setLoading(false);
    },
    (err) => {
      console.error('Firestore listener error:', err);
      setLoading(false);
    }
  );

  return () => unsub();
}, [user?.uid, isSolver]); // 🔥 FIX

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRequest?.chat]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: newRequest.title,
      category: newRequest.category,
      status: 'pending',
      date: today,
      priority: newRequest.priority || 'medium',
      location: newRequest.location,
      description: newRequest.description,
      feedback: null,
      rating: null,
      submittedBy: user.name || user.email?.split('@')[0] || 'User',
      submittedByUid: user.uid,
      submittedByRole: user.role || 'Student',
      assignedTo: null,
      assignedToUid: null,
      completionNote: '',
      chat: [],
      progressLog: [{ date: today, status: 'pending', note: `Request submitted by ${user.name || 'User'}.` }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'serviceRequests'), payload);
      setShowForm(false);
      setNewRequest({ title: '', category: '', priority: 'medium', location: '', description: '' });
    } catch (err) {
      console.error('Error creating request:', err);
      alert('Failed to submit request. Please try again.');
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setDetailsForm({ feedback: request.feedback || '', rating: request.rating || 0, hoveredRating: 0 });
    setCompletionNote(request.completionNote || '');
    setShowDetailsModal(true);
  };

  const closeDetails = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const updateRequestField = async (id, patch) => {
    try {
      await updateDoc(doc(db, 'serviceRequests', id), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  const handleTakeRequest = async () => {
    if (!selectedRequest || !user) return;
    const today = new Date().toISOString().split('T')[0];
    const logEntry = { date: today, status: 'in-progress', note: `${user.name} (${user.role}) picked up the issue.` };
    await updateRequestField(selectedRequest.id, {
      assignedTo: user.name,
      assignedToUid: user.uid,
      status: 'in-progress',
      progressLog: arrayUnion(logEntry),
    });
  };

  const handleMarkCompleted = async () => {
    if (!selectedRequest || selectedRequest.status === 'completed') return;
    const today = new Date().toISOString().split('T')[0];
    const note = completionNote.trim() || 'Issue resolved by faculty/staff.';
    await updateRequestField(selectedRequest.id, {
      status: 'completed',
      completionNote: note,
      progressLog: arrayUnion({ date: today, status: 'completed', note }),
    });
  };

  const handleMarkNotCompleted = async () => {
    if (!selectedRequest || selectedRequest.status === 'pending') return;
    const today = new Date().toISOString().split('T')[0];
    await updateRequestField(selectedRequest.id, {
      status: 'pending',
      progressLog: arrayUnion({ date: today, status: 'pending', note: 'Status reverted to pending by faculty/staff.' }),
    });
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedRequest || !user) return;
    const newMsg = {
      sender: user.name || user.email?.split('@')[0] || 'User',
      role: user.role || 'Student',
      text: chatInput.trim(),
      ts: new Date().toISOString(),
    };
    await updateRequestField(selectedRequest.id, {
      chat: arrayUnion(newMsg),
    });
    setChatInput('');
  };

  const handleSubmitFeedback = async () => {
    if (!detailsForm.feedback && !detailsForm.rating) return;
    await updateRequestField(selectedRequest.id, {
      feedback: detailsForm.feedback,
      rating: detailsForm.rating,
    });
  };

  // ── Derived lists ───────────────────────────────────────────────────────
  const filteredRequests = requests.filter(r =>
    activeTab === 'all' ? true : r.status === activeTab
  );

  const roleAccentColor = isSolver ? '#06b6d4' : '#6366f1';
  const roleLabel       = isSolver ? 'Faculty / Staff Portal' : 'My Requests';

  return (
     <AnimatedBackground dark={isDark}>
    <div className="service-requests">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {isSolver
              ? <ShieldCheck size={18} color={roleAccentColor}/>
              : <Wrench size={18} color={roleAccentColor}/>}
            <span style={{ color: roleAccentColor, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {roleLabel}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.textMain }}>Service Requests</h1>
          <p style={{ margin: 0, color: t.textSub, fontSize: 13, marginTop: 4 }}>
            {isSolver
              ? 'Review student issues, chat with them, and update status.'
              : 'Submit and track maintenance, IT, and facility requests.'}
          </p>
        </div>
        {!isSolver && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Request
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['all', 'pending', 'in-progress', 'completed'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="count">
              {tab === 'all'
                ? requests.length
                : requests.filter(r => r.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Faculty: banner hint ── */}
      {isSolver && (
        <div style={{
          marginBottom: 16, padding: '10px 16px',
          background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: 10, color: '#67e8f9', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Bell size={14}/> You can take ownership of pending issues, chat with students, and mark completion below.
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: t.textSub }}>
          <Clock size={24} style={{ animation: 'spin 1.2s linear infinite', marginBottom: 8 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Loading requests…</p>
        </div>
      )}

      {/* ── Requests Grid ── */}
      <div className="requests-grid">
        <AnimatePresence>
          {!loading && filteredRequests.length === 0 && (
            <div style={{ color: t.textSub, fontSize: 14, padding: '40px 0', textAlign: 'center', gridColumn: '1/-1' }}>
              No requests in this category.
            </div>
          )}
          {filteredRequests.map(request => {
            const sc = getStatusColor(request.status);
            return (
              <motion.div
                key={request.id}
                className="request-card"
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                style={{ position: 'relative', cursor: 'default' }}
              >
                {/* Faculty: unassigned badge */}
                {isSolver && !request.assignedTo && request.status === 'pending' && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
                    color: '#fbbf24', fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 20, letterSpacing: '0.06em',
                  }}>UNASSIGNED</div>
                )}

                <div className="request-header">
                  <span className={`priority-badge ${request.priority}`}>{request.priority}</span>
                  <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: 4, ...sc }}>
                    {getStatusIcon(request.status)}
                    <span>{request.status}</span>
                  </div>
                </div>

                <h3 style={{ margin: '10px 0 6px', fontSize: 14, fontWeight: 700, color: t.textMain, lineHeight: 1.4 }}>
                  {request.title}
                </h3>

                <div className="request-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.textSub, fontSize: 12 }}>
                    <Tag size={12}/> {request.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.textSub, fontSize: 12 }}>
                    <MapPin size={12}/> {request.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.textSub, fontSize: 12 }}>
                    <Clock size={12}/> {request.date}
                  </span>
                  {isSolver && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.textSub, fontSize: 12 }}>
                      <User size={12}/> {request.submittedBy}
                    </span>
                  )}
                </div>

                {/* Chat count */}
                {(request.chat?.length || 0) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#818cf8', fontSize: 11, marginBottom: 6 }}>
                    <MessageSquare size={11}/> {request.chat.length} message{request.chat.length > 1 ? 's' : ''}
                  </div>
                )}

                {request.rating && (
                  <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={11}
                        fill={s <= request.rating ? '#f59e0b' : 'none'}
                        color={s <= request.rating ? '#f59e0b' : '#4b5563'}/>
                    ))}
                    <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 3 }}>Feedback given</span>
                  </div>
                )}

                <div className="request-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => openDetails(request)}>
                    <Eye size={13}/> View Details
                  </button>
                  {!isSolver && request.status === 'pending' && (
                    <button className="btn-text danger">Cancel</button>
                  )}
                  {isSolver && !request.assignedTo && request.status === 'pending' && (
                    <button
                      className="btn-text"
                      style={{ color: '#06b6d4' }}
                      onClick={() => { openDetails(request); }}
                    >
                      <ChevronRight size={13}/> Take Issue
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ─── New Request Modal (Student/Staff only) ─── */}
      <AnimatePresence>
        {showForm && !isSolver && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <motion.div
              className="modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2><Wrench size={22}/> New Service Request</h2>
                <button className="close-btn" onClick={() => setShowForm(false)}><X size={22}/></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Issue Title</label>
                  <input type="text" placeholder="Brief description of the issue"
                    value={newRequest.title}
                    onChange={e => setNewRequest({...newRequest, title: e.target.value})} required/>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={newRequest.category}
                      onChange={e => setNewRequest({...newRequest, category: e.target.value})} required>
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={newRequest.priority}
                      onChange={e => setNewRequest({...newRequest, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" placeholder="Building/Room number"
                    value={newRequest.location}
                    onChange={e => setNewRequest({...newRequest, location: e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Detailed description of the issue..."
                    value={newRequest.description}
                    onChange={e => setNewRequest({...newRequest, description: e.target.value})}/>
                </div>
                {/* Image upload skipped per user request */}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Submit Request</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Details Modal ─── */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <div className="modal-overlay" onClick={closeDetails}
            style={{ alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              className="modal"
              style={{ maxWidth: 600, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 0, borderRadius: 18 }}
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header band */}
              <div style={{
                background: isDark
                  ? 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)'
                  : 'linear-gradient(135deg,#eff2ff 0%,#eef2ff 100%)',
                padding: '22px 24px 18px',
                borderRadius: '18px 18px 0 0',
                position: 'relative',
              }}>
                <button className="close-btn" onClick={closeDetails}
                  style={{ position: 'absolute', top: 16, right: 16 }}>
                  <X size={19}/>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <Pill bg={`${getPriorityColor(selectedRequest.priority)}22`}
                    color={getPriorityColor(selectedRequest.priority)}
                    border={`${getPriorityColor(selectedRequest.priority)}44`}>
                    {selectedRequest.priority}
                  </Pill>
                  <Pill {...getStatusColor(selectedRequest.status)}>
                    {getStatusIcon(selectedRequest.status)} {selectedRequest.status}
                  </Pill>
                  {selectedRequest.assignedTo && (
                    <Pill bg="rgba(6,182,212,0.1)" color="#67e8f9" border="rgba(6,182,212,0.25)">
                      <ShieldCheck size={11}/> {selectedRequest.assignedTo}
                    </Pill>
                  )}
                </div>
                <h2 style={{ color: t.textMain, fontSize: 17, fontWeight: 800, margin: 0, lineHeight: 1.35 }}>
                  {selectedRequest.title}
                </h2>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <MetaCell icon={<Layers size={13}/>}   label="Category"     value={selectedRequest.category}/>
                  <MetaCell icon={<MapPin size={13}/>}   label="Location"     value={selectedRequest.location}/>
                  <MetaCell icon={<Calendar size={13}/>} label="Submitted"    value={selectedRequest.date}/>
                  <MetaCell icon={<User size={13}/>}     label="Submitted by" value={`${selectedRequest.submittedBy} (${selectedRequest.submittedByRole})`}/>
                </div>

                {/* Description */}
                <div>
                  <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MessageSquare size={12}/> Description
                  </p>
                  <p style={{
                    color: '#d1d5db', fontSize: 13, lineHeight: 1.6,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: '11px 14px', margin: 0,
                  }}>
                    {selectedRequest.description || 'No description provided.'}
                  </p>
                </div>

                {/* ── Progress Timeline ── */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: 16,
                }}>
                  <p style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14}/> Progress Timeline
                  </p>
                  <ProgressTimeline log={selectedRequest.progressLog || []}/>
                </div>

                {/* ── Faculty Actions ── */}
                {isSolver && (
                  <div style={{
                    background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)',
                    borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <p style={{ color: '#67e8f9', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <ShieldCheck size={14}/> Faculty Actions
                    </p>

                    {/* Take request */}
                    {!selectedRequest.assignedTo && selectedRequest.status === 'pending' && (
                      <button
                        onClick={handleTakeRequest}
                        style={{
                          padding: '10px 16px', borderRadius: 9, border: '1px solid rgba(6,182,212,0.35)',
                          background: 'rgba(6,182,212,0.12)', color: '#67e8f9',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                        }}>
                        <ShieldCheck size={14}/> Take This Request
                      </button>
                    )}

                    {/* Completion note */}
                    {selectedRequest.status !== 'completed' && (
                      <div>
                        <label style={{ color: '#9ca3af', fontSize: 11, marginBottom: 5, display: 'block' }}>
                          Completion Description (shown to student)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe what was done to resolve this issue..."
                          value={completionNote}
                          onChange={e => setCompletionNote(e.target.value)}
                          style={{
                            width: '100%', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                            color: '#e5e7eb', fontSize: 13, padding: '9px 12px',
                            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    )}

                    {/* Show saved completion note */}
                    {selectedRequest.completionNote && (
                      <div style={{
                        padding: '10px 12px', background: 'rgba(34,197,94,0.07)',
                        border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8,
                      }}>
                        <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={11}/> Resolution Note
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>{selectedRequest.completionNote}</p>
                      </div>
                    )}

                    {/* Mark buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={handleMarkCompleted}
                        disabled={selectedRequest.status === 'completed'}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 8,
                          cursor: selectedRequest.status === 'completed' ? 'not-allowed' : 'pointer',
                          background: selectedRequest.status === 'completed' ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.12)',
                          color: selectedRequest.status === 'completed' ? '#4ade80' : '#86efac',
                          border: `1px solid ${selectedRequest.status === 'completed' ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
                          fontWeight: 700, fontSize: 13,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s',
                        }}>
                        <ThumbsUp size={14}/>
                        {selectedRequest.status === 'completed' ? 'Marked Completed' : 'Mark Completed'}
                      </button>
                      <button
                        onClick={handleMarkNotCompleted}
                        disabled={selectedRequest.status === 'pending'}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 8,
                          cursor: selectedRequest.status === 'pending' ? 'not-allowed' : 'pointer',
                          background: selectedRequest.status === 'pending' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
                          color: selectedRequest.status === 'pending' ? '#f87171' : '#fca5a5',
                          border: `1px solid ${selectedRequest.status === 'pending' ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}`,
                          fontWeight: 700, fontSize: 13,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s',
                        }}>
                        <ThumbsDown size={14}/>
                        {selectedRequest.status === 'pending' ? 'Not Completed' : 'Mark Not Completed'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Chat ── */}
                <div style={{
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
                  borderRadius: 12, padding: 16,
                }}>
                  <p style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14}/> Chat
                  </p>

                  {/* Messages */}
                  <div style={{
                    minHeight: 80, maxHeight: 220, overflowY: 'auto',
                    marginBottom: 12, paddingRight: 4,
                  }}>
                    {(selectedRequest.chat?.length || 0) === 0
                      ? <p style={{ color: '#374151', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                          No messages yet. Start the conversation!
                        </p>
                      : selectedRequest.chat.map((msg, i) => (
                          <ChatBubble key={i} msg={msg} currentRole={user.role}/>
                        ))
                    }
                    <div ref={chatEndRef}/>
                  </div>

                  {/* Input */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder={isSolver ? 'Reply to student…' : 'Message faculty…'}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
                        color: '#e5e7eb', fontSize: 13, padding: '9px 13px',
                        outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim()}
                      style={{
                        padding: '9px 14px', borderRadius: 9, border: 'none',
                        background: chatInput.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.2)',
                        color: '#fff', cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                      }}>
                      <Send size={14}/> Send
                    </button>
                  </div>
                </div>

                {/* ── Feedback & Rating (Student or anyone viewing completed) ── */}
                {(!isSolver || selectedRequest.status === 'completed') && (
                  <div style={{
                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
                    borderRadius: 12, padding: 16,
                  }}>
                    <p style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14}/> Rate & Feedback
                    </p>

                    <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>
                      How satisfied are you with the resolution?
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          size={27}
                          fill={star <= (detailsForm.hoveredRating || detailsForm.rating) ? '#f59e0b' : 'none'}
                          color={star <= (detailsForm.hoveredRating || detailsForm.rating) ? '#f59e0b' : '#4b5563'}
                          style={{ cursor: 'pointer', transition: 'all 0.15s',
                            transform: star <= (detailsForm.hoveredRating || detailsForm.rating) ? 'scale(1.15)' : 'scale(1)' }}
                          onMouseEnter={() => setDetailsForm(p => ({...p, hoveredRating: star}))}
                          onMouseLeave={() => setDetailsForm(p => ({...p, hoveredRating: 0}))}
                          onClick={() => setDetailsForm(p => ({...p, rating: star}))}
                        />
                      ))}
                      {detailsForm.rating > 0 && (
                        <span style={{ color: '#fbbf24', fontSize: 12, alignSelf: 'center', marginLeft: 6, fontWeight: 600 }}>
                          {['','Poor','Fair','Good','Great','Excellent'][detailsForm.rating]}
                        </span>
                      )}
                    </div>

                    <textarea
                      rows="2"
                      placeholder="Share your feedback about how this request was handled..."
                      value={detailsForm.feedback}
                      onChange={e => setDetailsForm(p => ({...p, feedback: e.target.value}))}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                        color: '#e5e7eb', fontSize: 13, padding: '9px 12px',
                        resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                        boxSizing: 'border-box', marginBottom: 10,
                      }}
                    />

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!detailsForm.feedback && !detailsForm.rating}
                      style={{
                        padding: '9px 18px', borderRadius: 8, border: 'none',
                        cursor: (!detailsForm.feedback && !detailsForm.rating) ? 'not-allowed' : 'pointer',
                        background: (!detailsForm.feedback && !detailsForm.rating)
                          ? 'rgba(245,158,11,0.2)'
                          : 'linear-gradient(135deg,#f59e0b,#d97706)',
                        color: '#fff', fontWeight: 700, fontSize: 13,
                        opacity: (!detailsForm.feedback && !detailsForm.rating) ? 0.5 : 1, transition: 'all 0.2s',
                      }}>
                      Submit Feedback
                    </button>

                    {selectedRequest.feedback && (
                      <div style={{
                        marginTop: 12, padding: '10px 12px',
                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 8,
                      }}>
                        <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={11}/> Feedback Submitted
                        </p>
                        <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12}
                              fill={s <= selectedRequest.rating ? '#f59e0b' : 'none'}
                              color={s <= selectedRequest.rating ? '#f59e0b' : '#4b5563'}/>
                          ))}
                        </div>
                        <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>{selectedRequest.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Close */}
                <button
                  onClick={closeDetails}
                  style={{
                    padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#9ca3af',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  Close
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </AnimatedBackground>
  );
};

export default ServiceRequests;