import API_BASE_URL from "../config";
import { useTheme } from './ThemeContext';
import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Clock, FileText, MapPin, Users, Calendar, Mic,
  Volume2, VolumeX, Play, Trash2, Copy, CheckCheck, Sparkles, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_FOLLOWUPS = {
  document: [
    'What is the deadline for assignment submission?',
    'How do I get a bonafide certificate?',
    'Where do I submit my project report?',
  ],
  staff: [
    'What are the HOD office hours?',
    'How do I book an appointment with faculty?',
    'Who is the class counselor for CSE?',
  ],
  room: [
    'Where is the principal office?',
    'Which floor is the library on?',
    'Where is the seminar hall?',
  ],
  schedule: [
    'Is there a holiday tomorrow?',
    'When is the next exam scheduled?',
    'What time does the library close?',
  ],
  default: [
    'How do I submit a service request?',
    'Tell me about campus facilities',
    'How do I check my attendance?',
  ]
};

const getFollowups = (query = '') => {
  const q = query.toLowerCase();
  if (q.includes('document') || q.includes('submit') || q.includes('assignment')) return SUGGESTED_FOLLOWUPS.document;
  if (q.includes('staff') || q.includes('hod') || q.includes('faculty') || q.includes('teacher')) return SUGGESTED_FOLLOWUPS.staff;
  if (q.includes('room') || q.includes('located') || q.includes('where') || q.includes('floor')) return SUGGESTED_FOLLOWUPS.room;
  if (q.includes('schedule') || q.includes('class') || q.includes('time') || q.includes('tomorrow')) return SUGGESTED_FOLLOWUPS.schedule;
  return SUGGESTED_FOLLOWUPS.default;
};

// ── Voice preset profiles ──────────────────────────────────────
const VOICE_PRESETS = [
  { id: 'default',     label: '🤖 Default',        pitch: 1.0,  rate: 1.0,  lang: 'en-US', preferName: null },
  { id: 'slow',        label: '🐢 Slow & Clear',   pitch: 0.9,  rate: 0.75, lang: 'en-US', preferName: null },
  { id: 'fast',        label: '⚡ Fast',            pitch: 1.0,  rate: 1.4,  lang: 'en-US', preferName: null },
  { id: 'deep',        label: '🎙️ Deep Male',      pitch: 0.5,  rate: 0.9,  lang: 'en-US', preferName: 'Google US English' },
  { id: 'female',      label: '👩 Female',          pitch: 1.4,  rate: 1.0,  lang: 'en-US', preferName: 'Google US English' },
  { id: 'british',     label: '🇬🇧 British',        pitch: 1.0,  rate: 1.0,  lang: 'en-GB', preferName: null },
  { id: 'australian',  label: '🇦🇺 Australian',     pitch: 1.0,  rate: 1.0,  lang: 'en-AU', preferName: null },
  { id: 'indian',      label: '🇮🇳 Indian',         pitch: 1.0,  rate: 1.0,  lang: 'en-IN', preferName: null },
];

const AIChatbot = () => {
  const { isDark } = useTheme();
const c = {
  headerBg:    isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
  headerBorder:isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  botName:     isDark ? '#f1f5f9' : '#0f172a',
  botSub:      isDark ? '#6b7280' : '#64748b',
  quickBtnBg:  isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  quickBtnBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.10)',
  quickBtnColor:  isDark ? '#9ca3af' : '#475569',
  msgAreaBg:   isDark ? 'transparent' : 'transparent',
  botBubbleBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  botBubbleBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
  msgText:     isDark ? '#e2e8f0' : '#0f172a',
  timestamp:   isDark ? '#4b5563' : '#94a3b8',
  inputBarBg:  isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  inputBarBorder: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  inputBoxBg:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  inputBoxBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.10)',
  inputColor:  isDark ? '#e2e8f0' : '#0f172a',
  disclaimer:  isDark ? '#374151' : '#94a3b8',
  voiceMenuBg: isDark ? '#1a1b26' : '#ffffff',
  voiceMenuBorder: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.20)',
  voiceItemColor: isDark ? '#9ca3af' : '#475569',
  voiceLabel:  isDark ? '#4b5563' : '#94a3b8',
  headerBtn:   isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
};
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m CampusIQ Assistant. I can help you with:\n\n📄 Document submission info\n👥 Staff contact details\n🚪 Room locations\n📅 Leave status checking\n⏰ Finding free time or schedules\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReadMode, setIsReadMode] = useState(true);
  const [lastBotMessage, setLastBotMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [suggestedFollowups, setSuggestedFollowups] = useState(SUGGESTED_FOLLOWUPS.default);
  const [showFollowups, setShowFollowups] = useState(true);

  // ── NEW: voice selector state ──
  const [selectedVoiceId, setSelectedVoiceId] = useState('default');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const voiceMenuRef = useRef(null);

  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: FileText, label: 'Document Help', query: 'How do I submit my assignment?' },
    { icon: Users, label: 'Find Staff', query: 'Who is the HOD of Computer Science?' },
    { icon: MapPin, label: 'Room Location', query: 'Where is the Exam Cell located?' },
    { icon: Calendar, label: 'Check Schedule', query: 'What is my class schedule for tomorrow?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load available browser voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Close voice menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(e.target)) {
        setShowVoiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── UNCHANGED: startListening ──
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
  };

  // ── UPGRADED: speak — now uses selected voice preset ──
  const speak = (text) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);

    const preset = VOICE_PRESETS.find(v => v.id === selectedVoiceId) || VOICE_PRESETS[0];
    speech.lang  = preset.lang;
    speech.pitch = preset.pitch;
    speech.rate  = preset.rate;

    // Try to match a preferred voice by name or language
    if (availableVoices.length > 0) {
      let matched = null;
      if (preset.preferName) {
        matched = availableVoices.find(v => v.name.includes(preset.preferName) && v.lang.startsWith(preset.lang.split('-')[0]));
      }
      if (!matched) {
        matched = availableVoices.find(v => v.lang === preset.lang);
      }
      if (!matched) {
        matched = availableVoices.find(v => v.lang.startsWith(preset.lang.split('-')[0]));
      }
      if (matched) speech.voice = matched;
    }

    window.speechSynthesis.speak(speech);
  };

  // ── UNCHANGED: handleReplay ──
  const handleReplay = () => {
    if (!lastBotMessage) return;
    speak(lastBotMessage);
  };

  // ── UNCHANGED: handleCopy ──
  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── UNCHANGED: handleClearChat ──
  const handleClearChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m CampusIQ Assistant. I can help you with:\n\n📄 Document submission info\n👥 Staff contact details\n🚪 Room locations\n📅 Leave status checking\n⏰ Finding free time or schedules\n\nWhat would you like to know?',
      timestamp: new Date()
    }]);
    setSuggestedFollowups(SUGGESTED_FOLLOWUPS.default);
    setLastBotMessage('');
  };

  // ── UNCHANGED: handleSend ──
  const handleSend = async (messageText) => {
    const text = typeof messageText === 'string' ? messageText : input;
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setShowFollowups(false);

    try {
      const response = await fetch("https://campusiq-backend-iiqo.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedMessages
            .filter(m => m.type === 'user' || m.type === 'bot')
            .slice(-10)
            .map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content
            }))
        }),
      });

      const data = await response.json();
      const botReply = data.reply;

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: botReply,
        timestamp: new Date()
      }]);

      setLastBotMessage(botReply);
      setSuggestedFollowups(getFollowups(text));
      setShowFollowups(true);

      if (isReadMode) speak(botReply);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: "⚠️ Server error. Please try again.",
        timestamp: new Date()
      }]);
      setShowFollowups(true);
    }

    setIsTyping(false);
  };

  // ── UNCHANGED: handleFormSubmit / handleQuickAction / handleFollowup ──
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleQuickAction = (query) => {
    setInput(query);
  };

  const handleFollowup = (query) => {
    handleSend(query);
  };

  const selectedPreset = VOICE_PRESETS.find(v => v.id === selectedVoiceId) || VOICE_PRESETS[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: 'transparent',
      overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Bot avatar with pulse ring */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 0 rgba(99,102,241,0.4)',
              animation: 'pulse-ring 2s infinite',
            }}>
              <Bot size={22} color="#fff" />
            </div>
            <span style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: '#22c55e', border: '2px solid #0f1117',
            }} />
          </div>
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, margin: 0 }}>CampusIQ Assistant</h2>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Online · AI-powered campus helper
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* ── NEW: Voice selector ── */}
          <div ref={voiceMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowVoiceMenu(p => !p)}
              title="Change voice"
              style={{
                height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: showVoiceMenu ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                color: '#a5b4fc',
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0 10px', fontSize: '12px', fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              <span>{selectedPreset.label}</span>
              <ChevronDown size={12} style={{ opacity: 0.6, transform: showVoiceMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showVoiceMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '42px', right: 0, zIndex: 100,
                    background: '#1a1b26',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '12px',
                    padding: '6px',
                    minWidth: '170px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <p style={{ color: '#4b5563', fontSize: '10px', fontWeight: 600, padding: '4px 8px 6px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Voice Style
                  </p>
                  {VOICE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedVoiceId(preset.id);
                        setShowVoiceMenu(false);
                        // Preview the selected voice
                        const preview = new SpeechSynthesisUtterance("Hello, I'm your CampusIQ assistant.");
                        preview.lang   = preset.lang;
                        preview.pitch  = preset.pitch;
                        preview.rate   = preset.rate;
                        if (availableVoices.length > 0) {
                          const match = availableVoices.find(v => v.lang === preset.lang)
                            || availableVoices.find(v => v.lang.startsWith(preset.lang.split('-')[0]));
                          if (match) preview.voice = match;
                        }
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(preview);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '8px 10px', borderRadius: '8px',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: selectedVoiceId === preset.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                        color: selectedVoiceId === preset.id ? '#a5b4fc' : '#9ca3af',
                        fontSize: '13px', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (selectedVoiceId !== preset.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (selectedVoiceId !== preset.id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{preset.label}</span>
                      {selectedVoiceId === preset.id && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── UNCHANGED: mute/unmute button ── */}
          <button
            onClick={() => { if (isReadMode) window.speechSynthesis.cancel(); setIsReadMode(p => !p); }}
            title={isReadMode ? 'Mute voice' : 'Enable voice'}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: isReadMode ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: isReadMode ? '#818cf8' : '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
          >
            {isReadMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* ── UNCHANGED: replay button ── */}
          <button
            onClick={handleReplay}
            title="Replay last message"
            style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', color: '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
          >
            <Play size={16} />
          </button>

          {/* ── UNCHANGED: clear chat button ── */}
          <button
            onClick={handleClearChat}
            title="Clear chat"
            style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Quick Actions Bar — UNCHANGED ── */}
      <div style={{
        display: 'flex', gap: '8px', padding: '12px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'auto', flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.query)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              padding: '7px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#9ca3af',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <action.icon size={13} />
            {action.label}
          </button>
        ))}
      </div>

      {/* ── Messages Area — UNCHANGED ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`message ${msg.type}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: msg.type === 'bot'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.type === 'bot' ? <Bot size={16} color="#fff" /> : <User size={16} color="#fff" />}
              </div>

              {/* Bubble + timestamp */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '72%',
              }}>
                <div style={{
                  padding: '12px 16px', borderRadius: msg.type === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  background: msg.type === 'bot'
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.3))',
                  border: msg.type === 'bot'
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(99,102,241,0.3)',
                  position: 'relative',
                }}>
                  <p style={{
                    color: '#e2e8f0', fontSize: '14px', lineHeight: 1.65,
                    margin: 0, whiteSpace: 'pre-line',
                  }}>{msg.content}</p>

                  {/* Copy button on bot messages */}
                  {msg.type === 'bot' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        width: '24px', height: '24px', borderRadius: '6px',
                        border: 'none', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.07)', color: copiedId === msg.id ? '#22c55e' : '#6b7280',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0.7, transition: 'all 0.2s',
                      }}
                      title="Copy message"
                    >
                      {copiedId === msg.id ? <CheckCheck size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>

                <span style={{
                  color: '#4b5563', fontSize: '11px', marginTop: '4px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Clock size={10} />
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator — UNCHANGED */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: '5px', alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#6366f1', display: 'inline-block',
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Suggested Follow-ups — UNCHANGED ── */}
        <AnimatePresence>
          {showFollowups && !isTyping && messages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '14px', padding: '14px 16px',
              }}
            >
              <p style={{
                color: '#818cf8', fontSize: '11px', fontWeight: 600,
                marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <Sparkles size={12} /> Suggested follow-ups
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {suggestedFollowups.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleFollowup(q)}
                    style={{
                      textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
                      border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer',
                      background: 'rgba(99,102,241,0.08)', color: '#c7d2fe',
                      fontSize: '12px', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar — UNCHANGED ── */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        flexShrink: 0,
      }}>
        <form onSubmit={handleFormSubmit}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', padding: '6px 6px 6px 16px',
            transition: 'border-color 0.2s',
          }}>
            <input
              type="text"
              placeholder="Ask me anything about campus..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#e2e8f0', fontSize: '14px',
              }}
            />

            <button
              type="button"
              onClick={startListening}
              title="Voice input"
              style={{
                width: '38px', height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', color: '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}
            >
              <Mic size={18} />
            </button>

            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: '38px', height: '38px', borderRadius: '10px', border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                background: input.trim()
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.05)',
                color: input.trim() ? '#fff' : '#4b5563',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>

        <p style={{
          textAlign: 'center', color: '#374151', fontSize: '11px', marginTop: '10px'
        }}>
          CampusIQ AI · Responses may vary · Always verify with official sources
        </p>
      </div>

      {/* Inline keyframe styles — UNCHANGED */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;