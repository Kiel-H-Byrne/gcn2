import { useState, useMemo, useEffect } from 'react';
import { readJSON, writeJSON, STORAGE_KEYS, CATEGORY_ORDER, slugifyClubName } from '../utils';
import seedClubs from '../data/clubs';

export function useApp() {
  const [customClubs, setCustomClubs] = useState(() => readJSON(STORAGE_KEYS.customClubs, {}));
  const [deletedSeedIds, setDeletedSeedIds] = useState(() => readJSON(STORAGE_KEYS.deletedSeedIds, []));
  const [bag, setBag] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('bag');
    if (shared) {
      try {
        const parsed = JSON.parse(atob(shared));
        if (Array.isArray(parsed)) {
          window.history.replaceState(null, '', window.location.pathname);
          return parsed;
        }
      } catch(e) {
        // Fallback to readable format: apoc7-sniper10-goliath8
        const slugMap = {};
        for (const c of seedClubs) {
          slugMap[slugifyClubName(c.name)] = c.id;
        }
        const parts = shared.split('-');
        const parsedBag = [];
        for (const part of parts) {
          for (let i = 1; i <= 2; i++) {
            if (part.length <= i) continue;
            const prefix = part.slice(0, -i);
            const levelStr = part.slice(-i);
            if (!isNaN(levelStr) && slugMap[prefix]) {
              parsedBag.push({ clubId: slugMap[prefix], level: parseInt(levelStr, 10) });
              break;
            }
          }
        }
        if (parsedBag.length > 0) {
          window.history.replaceState(null, '', window.location.pathname);
          return parsedBag;
        }
      }
    }
    return readJSON(STORAGE_KEYS.bag, []);
  });
  
  const [settings, setSettings] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('bag');
    const base = {
      title: '', notes: '', variant: 'ring', ballName: 'Basic', elevation: 0, windStep: 0.5,
      ...readJSON(STORAGE_KEYS.settings, {})
    };
    if (shared) base.title = 'Shared Bag';
    return base;
  });
  const [lastLevel, setLastLevel] = useState(() => readJSON(STORAGE_KEYS.lastLevel, null));
  const [activeCategory, setActiveCategory] = useState('Drivers');
  
  const [theme, setTheme] = useState(() => localStorage.getItem('gcwind.theme') || 'system');
  const [savedProfiles, setSavedProfiles] = useState(() => readJSON('gcwind.profiles', {}));

  // Persistence hooks
  useEffect(() => writeJSON(STORAGE_KEYS.customClubs, customClubs), [customClubs]);
  useEffect(() => writeJSON(STORAGE_KEYS.deletedSeedIds, deletedSeedIds), [deletedSeedIds]);
  useEffect(() => writeJSON(STORAGE_KEYS.bag, bag), [bag]);
  useEffect(() => writeJSON(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => writeJSON(STORAGE_KEYS.lastLevel, lastLevel), [lastLevel]);
  useEffect(() => writeJSON('gcwind.profiles', savedProfiles), [savedProfiles]);

  // Theme hook
  useEffect(() => {
    localStorage.setItem('gcwind.theme', theme);
    if (theme === 'system') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  // Derived clubs data
  const clubs = useMemo(() => {
    const seed = seedClubs.filter(c => !deletedSeedIds.includes(c.id));
    const seedIds = new Set();
    const merged = seed.map(c => {
      seedIds.add(c.id);
      return customClubs[c.id] || c;
    });
    Object.keys(customClubs).forEach(id => {
      if (!seedIds.has(id)) merged.push(customClubs[id]);
    });
    merged.sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.tour - b.tour;
    });
    return merged;
  }, [customClubs, deletedSeedIds]);

  const getClubById = (id) => clubs.find(c => c.id === id);
  const isSeedClub = (id) => seedClubs.some(c => c.id === id);

  return {
    customClubs, setCustomClubs,
    deletedSeedIds, setDeletedSeedIds,
    bag, setBag,
    settings, setSettings,
    lastLevel, setLastLevel,
    activeCategory, setActiveCategory,
    theme, setTheme,
    clubs, getClubById, isSeedClub,
    savedProfiles, setSavedProfiles
  };
}
