import React from 'react';
import { accentVar } from '../utils';
import LevelPicker from './LevelPicker';

export default function BagPanel({ bag, setBag, clubs, setLastLevel }) {
  const handleRemove = (clubId) => {
    setBag(bag.filter(b => b.clubId !== clubId));
  };

  const handleClear = () => {
    if (bag.length && window.confirm('Clear all clubs from your bag?')) {
      setBag([]);
    }
  };

  const handleSetLevel = (clubId, level) => {
    setBag(bag.map(b => b.clubId === clubId ? { ...b, level } : b));
    setLastLevel(level);
  };

  return (
    <aside className="bag-panel" aria-label="Your bag">
      <div className="bag-header">
        <h2>Your Bag <span className="bag-count">{bag.length}</span></h2>
        <button className="btn-ghost" type="button" onClick={handleClear}>Clear</button>
      </div>
      <div className="bag-list">
        {bag.map(entry => {
          const club = clubs.find(c => c.id === entry.clubId);
          if (!club) return null;
          return (
            <div key={club.id} className="bag-chip" style={{ '--card-accent': accentVar(club.category) }}>
              <div className="bag-chip-top">
                <svg className="bag-chip-icon" width="18" height="18"><use href={`#icon-${club.category}`} /></svg>
                <span className="bag-chip-name">{club.name}</span>
                <span className="club-card-level-badge" style={{ background: accentVar(club.category) }}>Lv {entry.level}</span>
                <button 
                  className="bag-chip-remove" 
                  type="button" 
                  aria-label={`Remove ${club.name}`}
                  onClick={() => handleRemove(club.id)}
                >
                  <svg width="14" height="14"><use href="#icon-close"/></svg>
                </button>
              </div>
              <LevelPicker club={club} level={entry.level} onChange={(lvl) => handleSetLevel(club.id, lvl)} source="bag" />
            </div>
          );
        })}
      </div>
      {bag.length === 0 && (
        <p className="bag-empty-hint">Tap a club on the left to add it here, then set its level.</p>
      )}
    </aside>
  );
}
