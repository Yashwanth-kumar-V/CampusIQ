import NotificationPanel from './NotificationPanel';
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, Wrench, Bot, Settings,
  Bell, GraduationCap, Menu, X,
  LogOut, LogIn, UserPlus, User, ChevronDown,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu]     = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Dynamic colors based on theme
  const colors = {
    dropdownBg:     isDark ? 'rgba(10,14,25,0.97)'     : 'rgba(255,255,255,0.98)',
    dropdownBorder: isDark ? 'rgba(255,255,255,0.09)'  : 'rgba(0,0,0,0.10)',
    dropdownShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.15)',
    dropdownHeaderBorder: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
    dropdownName:   isDark ? '#e2e8f0' : '#0f172a',
    dropdownEmail:  isDark ? '#475569' : '#64748b',
    dropdownItem:   isDark ? '#94a3b8' : '#475569',
    dropdownItemHover: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    dropdownItemBorder: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)',
    guestText:      isDark ? '#4b5563' : '#94a3b8',
    guestBtnBg:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    guestBtnBorder: isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.10)',
    guestBtnColor:  isDark ? '#94a3b8' : '#475569',
    userPillBorder: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.10)',
    chevronColor:   isDark ? '#475569' : '#94a3b8',
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'    },
    { path: '/map',       icon: Map,             label: 'Campus Map'   },
    { path: '/services',  icon: Wrench,          label: 'Services'     },
    { path: '/chatbot',   icon: Bot,             label: 'AI Assistant' },
    { path: '/settings',  icon: Settings,        label: 'Settings'     },
  ];

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <motion.header
        className={`float-nav ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 210, damping: 28, delay: 0.05 }}
      >
        <div className="float-nav-inner">

          {/* ── Logo ── */}
          <NavLink to="/" className="fnav-logo" style={{ textDecoration: 'none' }}>
            <motion.div
              className="fnav-logo-icon"
              whileHover={{ rotate: 14, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 320 }}
            >
              <GraduationCap size={18} />
            </motion.div>
            <div className="fnav-logo-text">
              <span className="fnav-logo-name">CampusIQ</span>
              <span className="fnav-logo-sub">Smart Campus</span>
            </div>
          </NavLink>

          <div className="fnav-sep" />

          {/* ── Nav links (only when logged in) ── */}
          {user && (
            <nav className="fnav-links">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.055 }}
                  style={{ position: 'relative' }}
                >
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) => `fnav-link ${isActive ? 'active' : ''}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            className="fnav-active-pill"
                            layoutId="activePill"
                            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                          />
                        )}
                        <span className="fnav-link-icon"><item.icon size={15} /></span>
                        <span className="fnav-link-label">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          )}

          {!user && <div style={{ flex: 1 }} />}
          {user && <div className="fnav-sep" />}

          {/* ── Right section ── */}
          <div className="fnav-right">

            {/* Theme Toggle */}
            <motion.button
              className="fnav-theme-toggle"
              onClick={toggleTheme}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Sun size={16} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Moon size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Bell (only when logged in) */}
            {/* Notifications */}
              {user && (
                <NotificationPanel uid={user?.uid} isDark={isDark} />
              )}

            {/* User dropdown / Login buttons */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              {user ? (
                <motion.button
                  className="fnav-user"
                  onClick={() => setUserMenu(!userMenu)}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    cursor: 'pointer', background: 'none',
                    border: `1px solid ${colors.userPillBorder}`,
                    padding: '3px 10px 3px 3px', borderRadius: 30,
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  <div className="fnav-avatar-ring">
                    <div className="fnav-avatar">{user.avatar}</div>
                  </div>
                  <div className="fnav-user-info">
                    <span className="fnav-user-name">{user.name.split(' ')[0]}</span>
                    <span className="fnav-user-role">{user.role}</span>
                  </div>
                  <ChevronDown
                    size={13}
                    style={{
                      color: colors.chevronColor,
                      marginLeft: 2,
                      transform: userMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </motion.button>
              ) : (
                /* Guest state */
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: colors.guestText, fontSize: '12px', fontWeight: 500 }}>Guest</span>
                  <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '6px 14px', borderRadius: 10,
                      border: `1px solid ${colors.guestBtnBorder}`,
                      background: colors.guestBtnBg,
                      color: colors.guestBtnColor,
                      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <LogIn size={13} /> Log In
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/signup')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '6px 14px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <UserPlus size={13} /> Sign Up
                  </motion.button>
                </div>
              )}

              {/* Dropdown menu */}
              <AnimatePresence>
                {userMenu && user && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      minWidth: 210, zIndex: 500,
                      background: colors.dropdownBg,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${colors.dropdownBorder}`,
                      borderRadius: 14,
                      boxShadow: colors.dropdownShadow,
                      overflow: 'hidden',
                    }}
                  >
                    {/* User info header */}
                    <div style={{
                      padding: '14px 16px',
                      borderBottom: colors.dropdownHeaderBorder,
                      display: 'flex', gap: 10, alignItems: 'center',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {user.avatar}
                      </div>
                      <div>
                        <p style={{ color: colors.dropdownName, fontWeight: 600, fontSize: '13px', margin: 0 }}>
                          {user.name}
                        </p>
                        <p style={{ color: colors.dropdownEmail, fontSize: '11px', margin: '2px 0 0' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu items */}
                    {[
                      { icon: User,     label: 'Profile',  action: () => { setUserMenu(false); navigate('/settings'); } },
                      { icon: Settings, label: 'Settings', action: () => { setUserMenu(false); navigate('/settings'); } },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 16px', background: 'none',
                          border: 'none', borderBottom: colors.dropdownItemBorder,
                          color: colors.dropdownItem, fontSize: '13px', cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.dropdownItemHover}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <item.icon size={15} /> {item.label}
                      </button>
                    ))}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 16px', background: 'none', border: 'none',
                        color: '#ef4444', fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger */}
            <button className="fnav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="fnav-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              {user ? (
                navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) => `fnav-mobile-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={17} /><span>{item.label}</span>
                  </NavLink>
                ))
              ) : (
                <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/login'); }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10,
                      border: `1px solid ${colors.guestBtnBorder}`,
                      background: 'transparent', color: colors.guestBtnColor,
                      fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/signup'); }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navigation;