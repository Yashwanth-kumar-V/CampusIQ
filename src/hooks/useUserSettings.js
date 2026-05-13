// src/hooks/useUserSettings.js
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path if needed

const DEFAULT_SETTINGS = {
  profile: {
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    avatarInitials: 'YA',
  },
  appearance: {
    theme: 'dark',
    accentColor: '#6366f1',
    fontSize: 'medium',
    reducedMotion: false,
    compactMode: false,
  },
  notifications: {
    push: true,
    email: true,
    sms: false,
    events: true,
    maintenance: true,
    alerts: true,
    grades: false,
    announcements: true,
  },
  privacy: {
    twoFA: false,
    locationShare: true,
    activityVisible: true,
    dataCollection: true,
  },
  account: {
    soundEffects: true,
    highContrast: false,
    screenReader: false,
    language: 'English (US)',
    region: 'IST (UTC+5:30)',
  },
};

export function useUserSettings(uid) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ── Load from Firestore on mount ──────────────────────────────────
  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const load = async () => {
      try {
        const ref = doc(db, 'users', uid, 'settings', 'preferences');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          // Deep-merge so new default keys aren't lost
          const saved = snap.data();
          setSettings(prev => ({
            ...prev,
            ...saved,
            profile:       { ...prev.profile,       ...(saved.profile       || {}) },
            appearance:    { ...prev.appearance,    ...(saved.appearance    || {}) },
            notifications: { ...prev.notifications, ...(saved.notifications || {}) },
            privacy:       { ...prev.privacy,       ...(saved.privacy       || {}) },
            account:       { ...prev.account,       ...(saved.account       || {}) },
          }));
        }
      } catch (e) {
        console.error('Settings load error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  // ── Save entire section to Firestore ─────────────────────────────
  const saveSection = useCallback(async (section, data) => {
    if (!uid) return;
    setSaving(true);
    try {
      const ref = doc(db, 'users', uid, 'settings', 'preferences');
      await setDoc(ref, { [section]: data }, { merge: true });
      setSettings(prev => ({ ...prev, [section]: data }));
    } catch (e) {
      console.error('Settings save error:', e);
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [uid]);

  // ── Update single field within a section (real-time toggles) ─────
  const updateField = useCallback(async (section, field, value) => {
    if (!uid) return;
    try {
      const ref = doc(db, 'users', uid, 'settings', 'preferences');
      await updateDoc(ref, { [`${section}.${field}`]: value }).catch(async () => {
        // Doc may not exist yet — use setDoc with merge
        await setDoc(ref, { [section]: { [field]: value } }, { merge: true });
      });
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } catch (e) {
      console.error('Field update error:', e);
    }
  }, [uid]);

  return { settings, loading, saving, error, saveSection, updateField };
}