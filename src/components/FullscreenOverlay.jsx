import React, { useEffect, useRef } from 'react';
import { WIND_MODES } from '../lib/wind';
import balls from '../data/balls';
import { ClubChartCard } from './ChartOutput';

export default function FullscreenOverlay({ bag, clubs, settings, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (overlayRef.current && overlayRef.current.requestFullscreen) {
      overlayRef.current.requestFullscreen().catch(() => {});
    }
    const handleFsChange = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [onClose]);

  if (bag.length === 0) return null;

  const selectedBall = balls.find(b => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];
  const subtitle = `${selectedBall.name} Ball (P${selectedBall.power}) · ${settings.variant === 'ring' ? 'Wind per Ring' : 'Rings per Wind'}`;

  return (
    <div className="fullscreen-overlay" role="dialog" aria-modal="true" aria-label="Full-screen wind chart" ref={overlayRef}>
      <div className="fullscreen-header">
        <div className="fullscreen-heading">
          <h2>{settings.title.trim() || 'Wind Chart'}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="icon-btn fullscreen-close" type="button" aria-label="Close full-screen view" onClick={onClose}>
          <svg width="26" height="26"><use href="#icon-close" /></svg>
        </button>
      </div>
      <div className="fullscreen-body">
        {bag.map(entry => {
          const club = clubs.find(c => c.id === entry.clubId);
          if (!club) return null;
          const level = Math.min(Math.max(entry.level, 1), club.maxLevel);
          return <ClubChartCard key={club.id} club={club} level={level} mode={mode} settings={settings} isFullscreen />;
        })}
      </div>
    </div>
  );
}
