import React, { useRef, useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { clamp, accentVar } from '../utils';

export default function LevelPicker({ club, level, onChange, source }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const setLevel = (newLevel) => {
    onChange(clamp(newLevel, 1, club.maxLevel));
  };

  const levelFromClientX = (clientX) => {
    if (!trackRef.current) return level;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width === 0) return level;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return clamp(Math.round(ratio * (club.maxLevel - 1)) + 1, 1, club.maxLevel);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => setLevel(levelFromClientX(e.clientX));
    const onUp = (e) => {
      setIsDragging(false);
      setLevel(levelFromClientX(e.clientX));
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [isDragging, club.maxLevel]);

  return (
    <div className="level-picker" style={{ '--pill-accent': accentVar(club.category) }}>
      <button 
        type="button" 
        className="lvl-step" 
        aria-label="Decrease level"
        onClick={(e) => { e.stopPropagation(); setLevel(level - 1); }}
      >
        <Minus size={11} />
      </button>

      <div 
        ref={trackRef}
        className="lvl-track" 
        data-level-track="1" 
        data-club-id={club.id} 
        data-source={source}
        tabIndex={0}
        role="slider"
        aria-valuemin={1}
        aria-valuemax={club.maxLevel}
        aria-valuenow={level}
        aria-label={`${club.name} level`}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsDragging(true);
          setLevel(levelFromClientX(e.clientX));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            setLevel(level + 1);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            setLevel(level - 1);
          }
        }}
      >
        {Array.from({ length: club.maxLevel }, (_, i) => i + 1).map(lvl => (
          <button 
            key={lvl}
            type="button" 
            className={`lvl-pill ${lvl === level ? 'is-active' : ''}`}
            data-level={lvl}
            tabIndex={-1}
          >
            {lvl}
          </button>
        ))}
      </div>

      <button 
        type="button" 
        className="lvl-step" 
        aria-label="Increase level"
        onClick={(e) => { e.stopPropagation(); setLevel(level + 1); }}
      >
        <Plus size={11} />
      </button>
    </div>
  );
}
