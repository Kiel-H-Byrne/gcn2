import React, { useState } from 'react';
import { accentVar, slugifyClubName } from '../utils';
import LevelPicker from './LevelPicker';

export default function BagPanel({ bag, setBag, clubs, setLastLevel, settings, setSettings, savedProfiles, setSavedProfiles }) {
  const handleRemove = (clubId) => {
    setBag(bag.filter(b => b.clubId !== clubId));
  };

  const handleClear = () => {
    if (bag.length && window.confirm('Clear all clubs from your bag?')) {
      setBag([]);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    if (!bag.length) return;
    const readable = bag.map(b => {
      const c = clubs.find(cl => cl.id === b.clubId);
      return c ? `${slugifyClubName(c.name)}${b.level}` : '';
    }).filter(Boolean).join('-');
    const url = new URL(window.location.href);
    url.searchParams.set('bag', readable);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const [profileName, setProfileName] = useState('');
  const handleSaveProfile = () => {
    const name = profileName.trim();
    if (!name || bag.length === 0) return;
    setSavedProfiles({ ...savedProfiles, [name]: { bag, settings: { ...settings, title: name } } });
    setProfileName('');
  };

  const handleSetLevel = (clubId, level) => {
    setBag(bag.map(b => b.clubId === clubId ? { ...b, level } : b));
    setLastLevel(level);
  };

  return (
    <aside className="bag-panel" aria-label="Your bag">
      <div className="bag-profiles" style={{ marginBottom: '16px', background: 'var(--surface-1)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px', marginTop: 0 }}>Saved Profiles</h3>
        
        {Object.keys(savedProfiles).length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select 
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'var(--surface-2)', color: 'var(--text)', outline: 'none' }}
              value=""
              onChange={(e) => {
                const name = e.target.value;
                if (name && savedProfiles[name]) {
                  setBag(savedProfiles[name].bag);
                  setSettings(savedProfiles[name].settings);
                }
              }}
            >
              <option value="" disabled>Load profile...</option>
              {Object.keys(savedProfiles).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="New profile name..." 
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', outline: 'none', minWidth: 0 }}
            maxLength={30}
          />
          <button 
            type="button"
            className="btn-primary"
            onClick={handleSaveProfile}
            disabled={!profileName.trim() || bag.length === 0}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Save
          </button>
        </div>
      </div>

      <div className="bag-header">
        <h2>Your Bag <span className="bag-count">{bag.length}</span></h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" type="button" onClick={handleShare} disabled={bag.length === 0} style={{ padding: '4px 8px' }}>
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button className="btn-ghost" type="button" onClick={handleClear} style={{ padding: '4px 8px' }}>Clear</button>
        </div>
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
