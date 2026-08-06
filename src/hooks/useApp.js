import { useState, useMemo, useEffect } from 'react';
import { readJSON, writeJSON, STORAGE_KEYS, CATEGORY_ORDER } from '../utils';
import seedClubs from '../data/clubs';

export function useApp() {
  const [customClubs, setCustomClubs] = useState(() => readJSON(STORAGE_KEYS.customClubs, {}));
  const [deletedSeedIds, setDeletedSeedIds] = useState(() => readJSON(STORAGE_KEYS.deletedSeedIds, []));
  const [bag, setBag] = useState(() => readJSON(STORAGE_KEYS.bag, []));
  const [settings, setSettings] = useState(() => ({
    title: '', variant: 'ring', modeIndex: 0, windStep: 0.5,
    ...readJSON(STORAGE_KEYS.settings, {})
  }));
  const [lastLevel, setLastLevel] = useState(() => readJSON(STORAGE_KEYS.lastLevel, null));
  const [activeCategory, setActiveCategory] = useState('Drivers');
  
  const [theme, setTheme] = useState(() => localStorage.getItem('gcwind.theme') || 'system');

  // Persistence hooks
  useEffect(() => writeJSON(STORAGE_KEYS.customClubs, customClubs), [customClubs]);
  useEffect(() => writeJSON(STORAGE_KEYS.deletedSeedIds, deletedSeedIds), [deletedSeedIds]);
  useEffect(() => writeJSON(STORAGE_KEYS.bag, bag), [bag]);
  useEffect(() => writeJSON(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => writeJSON(STORAGE_KEYS.lastLevel, lastLevel), [lastLevel]);

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
    clubs, getClubById, isSeedClub
  };
}
