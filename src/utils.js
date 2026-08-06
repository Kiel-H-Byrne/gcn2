export const CATEGORY_ORDER = ['Drivers', 'Woods', 'LongIrons', 'ShortIrons', 'Wedges', 'RoughIrons', 'SandWedges'];
export const CATEGORY_LABELS = {
  Drivers: 'Drivers',
  Woods: 'Woods',
  LongIrons: 'Long Irons',
  ShortIrons: 'Short Irons',
  Wedges: 'Wedges',
  RoughIrons: 'Rough Irons',
  SandWedges: 'Sand Wedges',
};
export const CATEGORY_SLOT = { Drivers: 1, Woods: 2, LongIrons: 3, ShortIrons: 4, Wedges: 5, RoughIrons: 6, SandWedges: 7 };
export const TYPE_SUGGESTIONS = ['Beginner', 'Common', 'Rare', 'Epic', 'Legendary', 'Master', 'Golden', 'Signature'];

export function accentVar(category) {
  return `var(--series-${CATEGORY_SLOT[category] || 1})`;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'custom-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
}

// LocalStorage helpers
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage unavailable
  }
}

export const STORAGE_KEYS = {
  customClubs: 'gcwind.customClubs',
  deletedSeedIds: 'gcwind.deletedSeedIds',
  bag: 'gcwind.bag',
  settings: 'gcwind.settings',
  lastLevel: 'gcwind.lastLevel',
};
