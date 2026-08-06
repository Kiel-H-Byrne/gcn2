import React, { useState, useRef } from 'react';
import { CATEGORY_ORDER, CATEGORY_LABELS, TYPE_SUGGESTIONS, generateId, accentVar } from '../utils';

function blankClub(activeCategory) {
  return {
    id: '',
    name: '',
    category: activeCategory || 'Drivers',
    tour: 1,
    type: 'Common',
    power: [200],
    accuracy: [50],
  };
}

export default function ClubEditorModal({ 
  onClose, customClubs, setCustomClubs, deletedSeedIds, setDeletedSeedIds, 
  bag, setBag, clubs, isSeedClub, activeCategory, setActiveCategory 
}) {
  const [editingClubId, setEditingClubId] = useState(null);
  const fileInputRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose();
  };

  const isNew = editingClubId === 'new';
  const club = isNew ? blankClub(activeCategory) : clubs.find(c => c.id === editingClubId);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(clubs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'golf-clash-clubs.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) {
          alert('Expected a JSON array of clubs.');
          return;
        }
        let valid = 0;
        let skipped = 0;
        const newCustoms = { ...customClubs };
        imported.forEach(c => {
          if (!c || !c.name || !c.category || !Array.isArray(c.power) || !c.power.length) {
            skipped++;
            return;
          }
          const id = c.id || generateId();
          newCustoms[id] = {
            id,
            name: c.name,
            category: c.category,
            tour: Number(c.tour) || 0,
            type: c.type || 'Common',
            power: c.power,
            accuracy: c.accuracy && c.accuracy.length === c.power.length ? c.accuracy : c.power.map(() => 50),
            maxLevel: c.power.length,
          };
          valid++;
        });
        setCustomClubs(newCustoms);
        alert(`Imported ${valid} club(s).${skipped ? ` Skipped ${skipped} invalid entries.` : ''}`);
      } catch (err) {
        alert('That file is not valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!club || isNew) return;
    if (!window.confirm(`Delete "${club.name}"? This also removes it from your bag if present.`)) return;
    
    const newCustoms = { ...customClubs };
    delete newCustoms[club.id];
    setCustomClubs(newCustoms);

    if (isSeedClub(club.id) && !deletedSeedIds.includes(club.id)) {
      setDeletedSeedIds([...deletedSeedIds, club.id]);
    }
    
    setBag(bag.filter(b => b.clubId !== club.id));
    setEditingClubId(null);
  };

  return (
    <div className="modal-overlay" id="club-editor-overlay" onClick={handleOverlayClick}>
      <div className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Manage Clubs</h2>
          <button className="icon-btn" type="button" aria-label="Close" onClick={onClose}>
            <svg width="18" height="18"><use href="#icon-close" /></svg>
          </button>
        </div>
        <p className="modal-subtitle">
          Add clubs the game has added, fix stats that changed, or remove clubs that got reworked.
          Everything here is saved in this browser and layered on top of the built-in starter data.
        </p>
        <div className="modal-body">
          <div className="editor-list-pane">
            <div className="editor-toolbar">
              <button className="btn-primary" type="button" onClick={() => setEditingClubId('new')}>
                <svg width="14" height="14"><use href="#icon-plus" /></svg>
                Add Club
              </button>
              <div className="editor-io">
                <button className="btn-ghost" type="button" onClick={handleExport}>Export</button>
                <button className="btn-ghost" type="button" onClick={() => fileInputRef.current?.click()}>Import</button>
                <input type="file" accept="application/json" hidden ref={fileInputRef} onChange={handleImport} />
              </div>
            </div>
            <div className="editor-club-list">
              {CATEGORY_ORDER.map(cat => {
                const inCat = clubs.filter(c => c.category === cat);
                if (!inCat.length) return null;
                return (
                  <React.Fragment key={cat}>
                    <div className="editor-category-heading">{CATEGORY_LABELS[cat]}</div>
                    {inCat.map(c => (
                      <button 
                        key={c.id} 
                        type="button" 
                        className={`editor-club-row ${editingClubId === c.id ? 'is-active' : ''}`}
                        onClick={() => setEditingClubId(c.id)}
                      >
                        <span className="row-accent" style={{ background: accentVar(c.category) }}></span>
                        <span className="row-name">{c.name}</span>
                        {customClubs[c.id] && <span className="row-custom-badge">edited</span>}
                      </button>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="editor-form-pane">
            {!club ? (
              <p className="editor-form-placeholder">Select a club on the left to edit it, or add a new one.</p>
            ) : (
              <ClubForm 
                key={club.id || 'new'} 
                initialClub={club} 
                isNew={isNew} 
                onSave={(saved) => {
                  setCustomClubs({ ...customClubs, [saved.id]: saved });
                  setEditingClubId(saved.id);
                }}
                onCancel={() => setEditingClubId(null)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClubForm({ initialClub, isNew, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(initialClub.name);
  const [category, setCategory] = useState(initialClub.category);
  const [tour, setTour] = useState(initialClub.tour || 0);
  const [type, setType] = useState(initialClub.type || '');
  const [levels, setLevels] = useState(() => {
    const p = initialClub.power || [200];
    const a = initialClub.accuracy || [];
    return p.map((pow, i) => ({ power: pow, accuracy: a[i] ?? 50 }));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const powerVals = levels.map(l => parseFloat(l.power));
    const accVals = levels.map(l => parseFloat(l.accuracy));
    if (powerVals.some(isNaN) || accVals.some(isNaN)) {
      alert('Every level needs a numeric power and accuracy value.');
      return;
    }
    if (!name.trim()) {
      alert('Name is required.');
      return;
    }
    onSave({
      id: isNew ? generateId() : initialClub.id,
      name: name.trim(),
      category,
      tour: parseInt(tour, 10) || 0,
      type: type.trim() || 'Common',
      power: powerVals,
      accuracy: accVals,
      maxLevel: powerVals.length,
    });
  };

  const addLevel = () => {
    if (levels.length >= 12) return;
    const last = levels[levels.length - 1];
    setLevels([...levels, { power: last?.power ?? '', accuracy: last?.accuracy ?? '' }]);
  };

  const removeLevel = (index) => {
    if (levels.length <= 1) return;
    const next = [...levels];
    next.splice(index, 1);
    setLevels(next);
  };

  return (
    <form className="club-form" onSubmit={handleSubmit}>
      <div className="club-form-row">
        <div className="club-form-field">
          <label>Name</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="club-form-field">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
      </div>
      <div className="club-form-row">
        <div className="club-form-field">
          <label>Tour (unlock order)</label>
          <input type="number" min="0" step="1" value={tour} onChange={e => setTour(e.target.value)} />
        </div>
        <div className="club-form-field">
          <label>Rarity / type</label>
          <input type="text" list="type-suggestions" value={type} onChange={e => setType(e.target.value)} />
          <datalist id="type-suggestions">
            {TYPE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
      </div>
      <div className="levels-table-label">
        <span>Per-level stats</span>
        <button type="button" className="btn-ghost" onClick={addLevel}>+ Add level</button>
      </div>
      <table className="levels-editor">
        <thead>
          <tr><th>Lv</th><th>Power</th><th>Accuracy</th><th></th></tr>
        </thead>
        <tbody>
          {levels.map((lvl, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <input 
                  type="number" 
                  className="level-power" 
                  step="1" 
                  value={lvl.power} 
                  onChange={e => {
                    const next = [...levels];
                    next[i].power = e.target.value;
                    setLevels(next);
                  }} 
                />
              </td>
              <td>
                <input 
                  type="number" 
                  className="level-accuracy" 
                  step="1" 
                  value={lvl.accuracy} 
                  onChange={e => {
                    const next = [...levels];
                    next[i].accuracy = e.target.value;
                    setLevels(next);
                  }} 
                />
              </td>
              <td>
                <button type="button" className="remove-level-btn" onClick={() => removeLevel(i)}>
                  <svg width="14" height="14"><use href="#icon-close"/></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="club-form-actions">
        {!isNew ? (
          <button type="button" className="btn-danger" onClick={onDelete}>Delete club</button>
        ) : <span></span>}
        <div className="club-form-actions-right">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary">{isNew ? 'Add club' : 'Save changes'}</button>
        </div>
      </div>
    </form>
  );
}
