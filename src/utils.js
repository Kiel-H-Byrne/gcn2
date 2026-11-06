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

/**
 * Sorts clubs in a bag to the standard Golf Clash in-game order:
 * Drivers -> Woods -> Long Irons -> Short Irons -> Wedges -> Rough Irons -> Sand Wedges.
 * If multiple clubs are in the same category, orders them by tour ascending, then name.
 */
export function sortBagClubs(bagList, allClubs = []) {
  if (!Array.isArray(bagList) || bagList.length <= 1) return bagList || [];
  return [...bagList].sort((a, b) => {
    const clubA = allClubs.find((c) => c.id === a.clubId);
    const clubB = allClubs.find((c) => c.id === b.clubId);
    if (!clubA && !clubB) return 0;
    if (!clubA) return 1;
    if (!clubB) return -1;
    const catA = CATEGORY_ORDER.indexOf(clubA.category);
    const catB = CATEGORY_ORDER.indexOf(clubB.category);
    const idxA = catA === -1 ? 999 : catA;
    const idxB = catB === -1 ? 999 : catB;
    if (idxA !== idxB) {
      return idxA - idxB;
    }
    return (clubA.tour || 0) - (clubB.tour || 0) || clubA.name.localeCompare(clubB.name);
  });
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

/**
 * Returns the URL for the club's image from the Golf Clash Notebook GitHub repo.
 * @param {string} clubName - The name of the club.
 * @param {string} size - The size of the image ('64x64', '256x256', 'Card').
 * @returns {string} The full URL to the image.
 */
export function getClubImageUrl(clubName, size = '64x64') {
  const sanitized = clubName.replace(/^The\s+/i, '').replace(/[^a-zA-Z0-9]/g, '');
  // Using locally hosted images from public/img/clubs/
  return `/img/clubs/${sanitized}-${size}.png`;
}

export function slugifyClubName(name) {
  const lower = name.toLowerCase();
  const abbr = {
    'the apocalypse': 'apoc',
    'the extra mile': 'em',
    'the quarterback': 'qb',
    "thor's hammer": 'th',
    'the b52': 'b52',
    'the downinone': 'dio',
    'the endbringer': 'eb'
  };
  if (abbr[lower]) return abbr[lower];
  return lower.replace(/^the\s+/, '').replace(/[^a-z0-9]/g, '');
}
