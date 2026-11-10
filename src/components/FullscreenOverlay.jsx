import React, { useEffect, useRef } from 'react';
import { ArrowUpDown, Printer, X } from 'lucide-react';
import { WIND_MODES } from '../lib/wind';
import balls from '../data/balls';
import { ClubChartCard } from './ChartOutput';
import { sortBagClubs } from '../utils';
import { trackPrintChart } from '../lib/analytics';

export default function FullscreenOverlay({ bag, setBag, clubs, settings, onClose }) {
  const overlayRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const isPrintingRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleMove = (index, delta) => {
    if (!setBag) return;
    const target = index + delta;
    if (target < 0 || target >= bag.length) return;
    const newBag = [...bag];
    const [item] = newBag.splice(index, 1);
    newBag.splice(target, 0, item);
    setBag(newBag);
  };

  const handleSortStandard = () => {
    if (setBag) {
      setBag(sortBagClubs(bag, clubs));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleBeforePrint = () => {
      isPrintingRef.current = true;
    };
    const handleAfterPrint = () => {
      setTimeout(() => {
        isPrintingRef.current = false;
      }, 500);
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    if (overlayRef.current && overlayRef.current.requestFullscreen) {
      overlayRef.current.requestFullscreen().catch(() => {});
    }
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        if (isPrintingRef.current) {
          return;
        }
        onCloseRef.current?.();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

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
          {settings.notes?.trim() && (
            <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-wrap', background: 'var(--surface-1)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              {settings.notes.trim()}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {bag.length > 1 && setBag && (
            <button
              className="icon-btn"
              type="button"
              onClick={handleSortStandard}
              title="Sort clubs in standard in-game order (Drivers -> Sand Wedges)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.8rem",
                padding: "6px 10px",
                borderRadius: "6px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              <ArrowUpDown size={14} />
              <span>Game Order</span>
            </button>
          )}
          <button
            className="icon-btn"
            type="button"
            aria-label="Print / Save PDF"
            onClick={() => {
              isPrintingRef.current = true;
              trackPrintChart({
                bagSize: bag.length,
                ballName: settings.ballName,
                variant: settings.variant,
                source: "fullscreen_overlay",
              });
              window.print();
              setTimeout(() => {
                isPrintingRef.current = false;
              }, 1000);
            }}
            title="Print / Save PDF"
          >
            <Printer size={22} />
          </button>
          <button className="icon-btn fullscreen-close" type="button" aria-label="Close full-screen view" onClick={onClose}>
            <X size={26} />
          </button>
        </div>
      </div>
      <div className={`fullscreen-body ${settings.variant === 'wind' ? 'is-wind-variant' : ''}`}>
        {bag.map((entry, idx) => {
          const club = clubs.find(c => c.id === entry.clubId);
          if (!club) return null;
          const level = Math.min(Math.max(entry.level, 1), club.maxLevel);
          return (
            <ClubChartCard
              key={club.id}
              club={club}
              level={level}
              mode={mode}
              settings={settings}
              isFullscreen
              canMoveUp={Boolean(setBag) && idx > 0}
              canMoveDown={Boolean(setBag) && idx < bag.length - 1}
              onMoveUp={() => handleMove(idx, -1)}
              onMoveDown={() => handleMove(idx, 1)}
            />
          );
        })}
      </div>
    </div>
  );
}
