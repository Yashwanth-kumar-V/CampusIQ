import React, { useState } from 'react';
import {
  Search, Navigation, Layers, Building2, BookOpen,
  Home, Trophy, GraduationCap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCATIONS = [
  {
    id: 1,
    name: 'REC Main Gate',
    short: 'Main Gate',
    type: 'facilities',
    bx: 62, by: 18, bw: 14, bh: 10,
    px: 69, py: 18,
    lat: 13.010688628192058, lng: 80.00230768685013,
    status: 'open',
    desc: 'Main entrance to Rajalakshmi Engineering College campus.',
  },
  {
    id: 2,
    name: 'Aircraft Shed',
    short: 'Aircraft Shed',
    type: 'academic',
    bx: 98, by: 78, bw: 26, bh: 14,
    px: 111, py: 78,
    lat: 13.00954911772223, lng: 80.00318330455656,
    status: 'open',
    desc: 'Aeronautical engineering aircraft display and workshop shed.',
  },
  {
    id: 3,
    name: 'Workshop Block',
    short: 'Workshop',
    type: 'academic',
    bx: 100, by: 100, bw: 26, bh: 14,
    px: 113, py: 100,
    lat: 13.009244550146336, lng: 80.00325028829562, 
    status: 'open',
    desc: 'Multi-disciplinary workshop labs for engineering training.',
  },
  {
    id: 4,
    name: 'Main Building',
    short: 'Main Bldg',
    type: 'academic',
    bx: 160, by: 52, bw: 44, bh: 22,
    px: 182, py: 52,
    lat: 13.009539794230559, lng: 80.00423271646842, 
    status: 'open',
    desc: 'Primary academic block with classrooms, labs and admin offices.',
  },
  {
    id: 5,
    name: 'REC Central Block',
    short: 'REC Central',
    type: 'academic',
    bx: 136, by: 100, bw: 34, bh: 22,
    px: 153, py: 100,
    lat: 13.008153697891931, lng: 80.00295045632878, 
    status: 'open',
    desc: 'Central campus block — principal office and main corridors.',
  },
  {
    id: 6,
    name: 'School of Architecture',
    short: 'Architecture',
    type: 'academic',
    bx: 18, by: 118, bw: 36, bh: 26,
    px: 36, py: 118,
    lat: 13.008476913871025, lng: 80.00177026662081, 
    status: 'open',
    desc: 'Rajalakshmi School of Architecture — design studios and model rooms.',
  },
  {
    id: 7,
    name: 'Mechanical Block',
    short: 'Mech Block',
    type: 'academic',
    bx: 110, by: 142, bw: 36, bh: 18,
    px: 128, py: 142,
    lat: 13.00811816160825, lng: 80.00228027463038, 
    status: 'open',
    desc: 'Department of Mechanical Engineering — labs and lecture halls.',
  },
  {
    id: 8,
    name: 'Indoor Stadium',
    short: 'Indoor Stadium',
    type: 'sports',
    bx: 252, by: 110, bw: 44, bh: 32,
    px: 274, py: 110,
    lat: 13.00840643973381, lng: 80.00546657623991, 
    status: 'open',
    desc: 'Multi-purpose indoor sports arena for basketball, badminton and more.',
  },
  {
    id: 9,
    name: "Boy's Hostel - 2",
    short: "Boy's Hostel 2",
    type: 'hostel',
    bx: 136, by: 186, bw: 44, bh: 20,
    px: 158, py: 186,
    lat: 13.00744091684076, lng: 80.00348271972571,
    status: 'open',
    desc: 'Second boys residential hostel with dining and recreation facilities.',
  },
  {
    id: 10,
    name: 'Ladies Hostel',
    short: 'Ladies Hostel',
    type: 'hostel',
    bx: 246, by: 186, bw: 44, bh: 20,
    px: 268, py: 186,
    lat: 13.007341127595584, lng: 80.00548933740178, 
    status: 'open',
    desc: 'Girls hostel with modern amenities, security and common rooms.',
  },
  {
    id: 11,
    name: 'Sports Ground',
    short: 'Sports Ground',
    type: 'sports',
    bx: 186, by: 88, bw: 58, bh: 46,
    px: 215, py: 111,
    lat: 13.008468317390646, lng: 80.00428430176972,
    status: 'open',
    desc: 'Open ground for cricket, football, athletics and outdoor sports.',
  },
];

const TYPE_META = {
  academic:   { color: '#38bdf8', label: 'Academic',   icon: BookOpen  },
  facilities: { color: '#c084fc', label: 'Facilities', icon: Building2 },
  hostel:     { color: '#34d399', label: 'Hostel',     icon: Home      },
  sports:     { color: '#fb923c', label: 'Sports',     icon: Trophy    },
};

const FILTERS = [
  { id: 'all',        label: 'All',        icon: Layers    },
  { id: 'academic',   label: 'Academic',   icon: BookOpen  },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'hostel',     label: 'Hostels',    icon: Home      },
  { id: 'sports',     label: 'Sports',     icon: Trophy    },
];

const ROADS = [
  'M 69 23 L 82 36 L 100 50 L 118 62 L 135 72',
  'M 100 50 L 160 50 L 210 50 L 260 50 L 300 50',
  'M 260 50 Q 305 28 315 50 Q 318 75 300 80',
  'M 135 72 L 135 90 L 135 110 L 135 142 L 135 170 L 135 210',
  'M 135 110 L 186 110 L 252 110 L 300 110',
  'M 135 128 L 90 128 L 54 128 L 36 131',
  'M 118 62 L 118 78 L 124 78',
  'M 118 78 L 118 100 L 126 100',
  'M 60 196 L 136 196 L 200 196 L 246 196 L 300 196',
  'M 135 170 L 135 196',
  'M 296 110 L 296 150 L 296 196',
  'M 135 110 L 186 110',
  'M 135 150 L 148 150',
  'M 296 50 L 296 110',
];

export default function CampusMap() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedId,   setSelectedId]   = useState(null);

  const filtered = LOCATIONS.filter(
    (l) =>
      (activeFilter === 'all' || l.type === activeFilter) &&
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected = LOCATIONS.find((l) => l.id === selectedId);

  return (
    <div style={S.root}>
      {/* ── HEADER ── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>
            <GraduationCap size={20} style={{ color: '#38bdf8', marginRight: 8 }} />
            REC Campus Map
          </h1>
          <p style={S.subtitle}>Rajalakshmi Engineering College · Thandalam, Chennai</p>
        </div>
        <div style={S.searchWrap}>
          <Search size={14} color="var(--text-muted)" />
          <input
            style={S.searchInput}
            placeholder="Search buildings, blocks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button style={S.clearBtn} onClick={() => setSearchQuery('')}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER PILLS ── */}
      <div style={S.filters}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.id;
          const col    = TYPE_META[f.id]?.color ?? '#38bdf8';
          return (
            <button key={f.id}
              style={{
                ...S.pill,
                ...(active
                  ? { background: col + '22', border: `1px solid ${col}99`, color: col }
                  : {}),
              }}
              onClick={() => setActiveFilter(f.id)}>
              <f.icon size={12} />{f.label}
            </button>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div style={S.body}>

        {/* ── MAP PANEL ── */}
        <div style={S.mapCard}>
          <svg viewBox="0 0 320 240" style={S.svg} preserveAspectRatio="xMidYMid meet">
            {/* Base background — uses CSS variable so it adapts to theme */}
            <rect width="320" height="240" fill="var(--bg-surface)" />

            {/* Campus ground area */}
            <rect x="10" y="10" width="305" height="225" rx="2"
              fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="0.5" />

            {/* ── WATER BODIES ── */}
            <ellipse cx="6" cy="52"  rx="10" ry="30" fill="#0a2d4a" stroke="#0d3d60" strokeWidth="0.5" />
            <ellipse cx="5" cy="130" rx="9"  ry="28" fill="#0a2d4a" stroke="#0d3d60" strokeWidth="0.5" opacity="0.9" />
            <ellipse cx="7" cy="210" rx="8"  ry="18" fill="#0a2d4a" stroke="#0d3d60" strokeWidth="0.5" opacity="0.7" />

            {/* ── SPORTS FIELD ── */}
            <rect x="186" y="88" width="58" height="46" rx="1"
              fill="#0a2216" stroke="#164d2a" strokeWidth="0.6" />
            <line x1="215" y1="90" x2="215" y2="132" stroke="#1a5c30" strokeWidth="0.4" strokeDasharray="2 2" />
            <line x1="188" y1="111" x2="242" y2="111" stroke="#1a5c30" strokeWidth="0.4" strokeDasharray="2 2" />
            <text x="215" y="115" textAnchor="middle" fontSize="5" fill="#22c55e"
              fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">FIELD</text>

            {/* ── ROADS ── */}
            {ROADS.map((d, i) => (
              <path key={`r${i}`} d={d}
                stroke="rgba(30,58,90,0.9)" strokeWidth="4"
                fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {ROADS.map((d, i) => (
              <path key={`rd${i}`} d={d}
                stroke="rgba(37,63,96,0.8)" strokeWidth="0.6"
                fill="none" strokeDasharray="3 4" strokeLinecap="round" />
            ))}

            {/* ── BUILDING FOOTPRINTS ── */}
            {LOCATIONS.map((loc) => {
              const col = TYPE_META[loc.type]?.color ?? '#38bdf8';
              const isActive = selectedId === loc.id;
              if (loc.id === 11) return null;
              return (
                <rect key={`b${loc.id}`}
                  x={loc.bx} y={loc.by} width={loc.bw} height={loc.bh}
                  rx="1"
                  fill={isActive ? col + '22' : 'var(--bg-overlay)'}
                  stroke={isActive ? col : 'var(--border)'}
                  strokeWidth={isActive ? '0.8' : '0.5'}
                />
              );
            })}

            {/* ── LOCATION PINS ── */}
            {filtered.map((loc) => {
              const col      = TYPE_META[loc.type]?.color ?? '#94a3b8';
              const isActive = selectedId === loc.id;
              const r        = isActive ? 5.5 : 4;

              return (
                <g key={`p${loc.id}`} style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedId(isActive ? null : loc.id)}>

                  {isActive && (
                    <circle cx={loc.px} cy={loc.py} r="10"
                      fill={col} opacity="0.15" />
                  )}

                  <circle cx={loc.px + 0.6} cy={loc.py + 0.6} r={r}
                    fill="#000" opacity="0.35" />

                  <circle cx={loc.px} cy={loc.py} r={r}
                    fill={isActive ? col : col + 'cc'}
                    stroke={isActive ? '#ffffff' : col}
                    strokeWidth={isActive ? '1' : '0.5'} />

                  <circle cx={loc.px} cy={loc.py} r={isActive ? 2 : 1.5}
                    fill={isActive ? '#fff' : col + '55'} />

                  <line
                    x1={loc.px} y1={loc.py + r}
                    x2={loc.px} y2={loc.py + r + 3.5}
                    stroke={col} strokeWidth="1.2" strokeLinecap="round" />

                  {/* Label — brighter in light mode via opacity fix */}
                  <text
                    x={loc.px} y={loc.py + r + 8.5}
                    textAnchor="middle"
                    fontSize={isActive ? '4.5' : '3.8'}
                    fill={isActive ? col : '#8facc2'}
                    fontFamily="sans-serif"
                    fontWeight={isActive ? 'bold' : '600'}
                    style={{ pointerEvents: 'none' }}>
                    {loc.short}
                  </text>
                </g>
              );
            })}

            {/* ── COMPASS ── */}
            <g transform="translate(300, 22)">
              <circle cx="0" cy="0" r="9" fill="var(--bg-overlay)" stroke="var(--border)" strokeWidth="0.6" />
              <polygon points="0,-7 1.8,0 0,2.5 -1.8,0" fill="#38bdf8" />
              <polygon points="0,7 1.8,0 0,-2.5 -1.8,0" fill="var(--text-faint)" />
              <text x="0" y="-8.5" textAnchor="middle" fontSize="3.5"
                fill="#38bdf8" fontFamily="sans-serif" fontWeight="bold">N</text>
            </g>

            {/* ── SCALE BAR ── */}
            <g transform="translate(16, 232)">
              <rect x="0" y="-2" width="40" height="4" rx="1" fill="var(--bg-overlay)" />
              <rect x="0" y="-2" width="20" height="4" rx="0" fill="var(--text-faint)" opacity="0.4" />
              <text x="20" y="-4" textAnchor="middle" fontSize="3.5"
                fill="var(--text-muted)" fontFamily="sans-serif">≈ 200 m</text>
            </g>
          </svg>

          {/* ── LEGEND ── */}
          <div style={S.legend}>
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <div key={type} style={S.legendItem}>
                <span style={{ ...S.legendDot, background: meta.color }} />
                <span style={S.legendText}>{meta.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={S.sidebar}>

          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} style={S.detailCard}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <div style={S.detailTop}>
                  <span style={{
                    ...S.typePill,
                    color: TYPE_META[selected.type]?.color,
                    background: (TYPE_META[selected.type]?.color ?? '#38bdf8') + '18',
                    border: `1px solid ${(TYPE_META[selected.type]?.color ?? '#38bdf8')}44`,
                  }}>
                    {TYPE_META[selected.type]?.label ?? selected.type}
                  </span>
                  <button style={S.closeBtn} onClick={() => setSelectedId(null)}>
                    <X size={12} />
                  </button>
                </div>
                <h3 style={S.detailName}>{selected.name}</h3>
                <p style={S.detailDesc}>{selected.desc}</p>
                <div style={S.statusRow}>
                  <span style={S.statusDot} /> Open now
                </div>
                <div style={S.actionRow}>
                  <button
                    style={{ ...S.btn, ...S.btnPrimary }}
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=driving`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Navigation size={12} /> Get Directions
                  </button>
                  <button
                    style={{ ...S.btn, ...S.btnSec }}
                    onClick={() => {
                      const url = `https://www.google.com/maps/@${selected.lat},${selected.lng},19z`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    View on Map
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="ph" style={S.placeholder}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>📍</div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Click any pin on the map to view location details
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location list */}
          <div style={S.listWrap}>
            <div style={S.listHeader}>
              <span style={S.listTitle}>Campus Locations</span>
              <span style={S.badge}>{filtered.length}</span>
            </div>
            <div style={S.list}>
              {filtered.map((loc) => {
                const col      = TYPE_META[loc.type]?.color ?? '#94a3b8';
                const Icon     = TYPE_META[loc.type]?.icon  ?? Building2;
                const isActive = selectedId === loc.id;
                return (
                  <motion.div key={loc.id}
                    style={{
                      ...S.listItem,
                      ...(isActive ? { background: col + '14', borderColor: col + '55' } : {}),
                    }}
                    onClick={() => setSelectedId(isActive ? null : loc.id)}
                    whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
                    <div style={{ ...S.listIcon, background: col + '1a', color: col }}>
                      <Icon size={13} />
                    </div>
                    <div style={S.listInfo}>
                      <span style={{ ...S.listName, ...(isActive ? { color: col } : {}) }}>
                        {loc.name}
                      </span>
                      <span style={S.listSub}>🟢 {loc.status}</span>
                    </div>
                    <button
                      style={S.navBtn}
                      title={`Directions to ${loc.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=driving`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Navigation size={12} />
                    </button>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center', padding: '18px 0', margin: 0 }}>
                  No locations match your search.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles — all colors use CSS variables so light/dark mode works ───────────
const S = {
  root: {
    background: 'var(--bg-base)',
    minHeight: '100vh',
    padding: '20px 24px',
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', flexWrap: 'wrap',
    gap: 14, marginBottom: 14,
  },
  title: {
    margin: 0, fontSize: 20, fontWeight: 700,
    color: 'var(--text-primary)', letterSpacing: '-0.3px',
    display: 'flex', alignItems: 'center',
  },
  subtitle: {
    margin: '4px 0 0 28px', fontSize: 11,
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 13px', minWidth: 230,
  },
  searchInput: {
    background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--text-primary)', fontSize: 12, flex: 1, fontFamily: 'inherit',
  },
  clearBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', padding: 0, display: 'flex',
  },
  filters: { display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 },
  pill: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', borderRadius: 999,
    padding: '5px 13px', fontSize: 11, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
  },
  body: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  mapCard: {
    flex: '1 1 0',
    background: 'var(--bg-surface)',
    borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden',
  },
  svg: { width: '100%', height: 'auto', display: 'block' },
  legend: {
    display: 'flex', gap: 14, flexWrap: 'wrap',
    padding: '8px 14px', borderTop: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  legendText: { fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' },

  sidebar: {
    width: 262, flexShrink: 0,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  detailCard: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 15,
  },
  detailTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  typePill: {
    fontSize: 9, fontWeight: 700, padding: '3px 9px',
    borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.7px',
  },
  closeBtn: {
    background: 'var(--bg-overlay)', border: 'none', color: 'var(--text-secondary)',
    borderRadius: '50%', width: 22, height: 22,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  detailName: {
    margin: '0 0 6px', fontSize: 14, fontWeight: 700,
    color: 'var(--text-primary)', lineHeight: 1.3,
  },
  detailDesc: {
    margin: '0 0 11px', fontSize: 11,
    color: 'var(--text-secondary)', lineHeight: 1.65,
  },
  statusRow:  {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#34d399', marginBottom: 12,
  },
  statusDot:  {
    width: 6, height: 6, borderRadius: '50%',
    background: '#34d399', display: 'inline-block',
  },
  actionRow:  { display: 'flex', gap: 7 },
  btn: {
    display: 'flex', alignItems: 'center', gap: 5,
    borderRadius: 8, padding: '7px 11px',
    fontSize: 11, fontWeight: 600,
    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
  },
  btnPrimary: { background: '#1d4ed8', color: '#fff', flex: 1, justifyContent: 'center' },
  btnSec:     { background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },

  placeholder: {
    background: 'var(--bg-elevated)', border: '1px dashed var(--border)',
    borderRadius: 12, padding: '20px 14px', textAlign: 'center',
  },
  listWrap: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 12, overflow: 'hidden', flex: 1,
  },
  listHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
  },
  listTitle: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.7px',
  },
  badge: {
    background: 'var(--bg-overlay)', color: 'var(--text-secondary)',
    borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 600,
  },
  list: {
    padding: 7, display: 'flex', flexDirection: 'column',
    gap: 3, maxHeight: 370, overflowY: 'auto',
  },
  listItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 9px', borderRadius: 8,
    border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.12s',
  },
  listIcon: {
    width: 28, height: 28, borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  listInfo:  { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  listName:  {
    fontSize: 11, fontWeight: 600, color: 'var(--text-primary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    transition: 'color 0.15s',
  },
  listSub:   { fontSize: 10, color: 'var(--text-muted)' },
  navBtn: {
    background: 'var(--bg-overlay)',
    border: '1px solid var(--border)',
    color: '#38bdf8',
    borderRadius: 6,
    width: 26, height: 26,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'background 0.15s',
  },
};