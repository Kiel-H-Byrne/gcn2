import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { CATEGORY_ORDER, CATEGORY_LABELS, accentVar, getClubImageUrl } from '../utils';
import LevelPicker from './LevelPicker';

export default function ClubGrid({ clubs, activeCategory, setActiveCategory, bag, setBag, lastLevel, setLastLevel, openEditorModal }) {
  const [imageError, setImageError] = useState({});

  const handleAddToBag = (club) => {
    if (bag.some(b => b.clubId === club.id)) return;
    const suggested = lastLevel ? Math.min(Math.max(lastLevel, 1), club.maxLevel) : club.maxLevel;
    setBag([...bag, { clubId: club.id, level: suggested }]);
    setLastLevel(suggested);
  };

  const handleSetLevel = (club, level) => {
    setBag(bag.map(b => b.clubId === club.id ? { ...b, level } : b));
    setLastLevel(level);
  };

  const categoryClubs = clubs.filter(c => c.category === activeCategory);

  const hasAdminEdit = new URLSearchParams(window.location.search).get('adminEdit') === 'gcnAdmin123';

  return (
    <section className="picker-panel" aria-label="Club picker">
      <div className="picker-panel-header">
        <div className="category-tabs" role="tablist" aria-label="Club categories">
          {CATEGORY_ORDER.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${activeCategory === cat ? 'is-active' : ''}`}
              style={{ '--tab-accent': accentVar(cat) }}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              <CategoryIcon category={cat} size={15} />
              <span>{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
        </div>
        {hasAdminEdit && (
          <button className="category-tab add-club-tab" type="button" onClick={openEditorModal}>
            <Plus size={15} />
            <span>Manage Clubs</span>
          </button>
        )}
      </div>
      <div className="club-grid" role="list">
        {!categoryClubs.length && (
          <p className="bag-empty-hint">No clubs in this category yet -- use "Manage Clubs" to add one.</p>
        )}
        {categoryClubs.map(club => {
          const bagEntry = bag.find(b => b.clubId === club.id);
          return (
            <div
              key={club.id}
              className={`club-card ${bagEntry ? 'is-selected' : ''}`}
              style={{ '--card-accent': accentVar(club.category) }}
              role="listitem"
              onClick={(e) => {
                if (e.target.closest('.level-picker')) return;
                if (!bagEntry) handleAddToBag(club);
              }}
            >
              <div className="club-card-top">
                {!imageError[club.id] ? (
                  <img 
                    src={getClubImageUrl(club.name, '64x64')} 
                    alt="" 
                    className="club-card-img"
                    width="42" 
                    height="42"
                    onError={() => setImageError(prev => ({ ...prev, [club.id]: true }))}
                  />
                ) : (
                  <CategoryIcon category={club.category} size={22} className="club-card-icon" />
                )}
                {bagEntry && (
                  <span className="club-card-level-badge" data-role="level-text">Lv {bagEntry.level}</span>
                )}
              </div>
              <div className="club-card-name">{club.name}</div>
              <div className="club-card-meta">
                <span>{club.type || ''}</span>
                <span>Tour {club.tour}</span>
              </div>
              {bagEntry && (
                <LevelPicker club={club} level={bagEntry.level} onChange={(lvl) => handleSetLevel(club, lvl)} source="grid" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
