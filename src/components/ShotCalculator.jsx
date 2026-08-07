import React, { useState, useRef } from 'react';
import CategoryIcon from './CategoryIcon';
import { WIND_MODES, maxPower, midPower, minPower, windPerRing } from '../lib/wind';
import balls from '../data/balls';
import { accentVar } from '../utils';

export default function ShotCalculator({ bag, clubs, settings }) {
  const [selectedClubId, setSelectedClubId] = useState(bag[0]?.clubId || '');
  const [wind, setWind] = useState('');
  const [windAngle, setWindAngle] = useState(0); // 0 = straight tailwind, 90 = straight crosswind
  const [slider, setSlider] = useState(50);
  const compassRef = useRef(null);

  const handleCompassDrag = (e) => {
    if (!compassRef.current) return;
    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    let theta = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
    if (theta < 0) theta += 360;
    setWindAngle(Math.round(theta));
  };

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    handleCompassDrag(e);
  };

  const handlePointerMove = (e) => {
    if (e.buttons > 0 || (e.touches && e.touches.length > 0)) {
      handleCompassDrag(e);
    }
  };
  
  if (bag.length === 0) return null;
  
  const currentClubId = bag.find(b => b.clubId === selectedClubId) ? selectedClubId : bag[0].clubId;
  const bagEntry = bag.find(b => b.clubId === currentClubId);
  if (!bagEntry) return null;
  
  const club = clubs.find(c => c.id === bagEntry.clubId);
  const level = bagEntry.level;
  
  const selectedBall = balls.find(b => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];
  
  // Math
  const minP = minPower(club, level, mode);
  const midP = midPower(club, level, mode);
  const maxP = maxPower(club, level, mode);
  
  let currentPower;
  if (slider <= 50) {
    // interpolate min to mid
    const fraction = slider / 50;
    currentPower = minP + (midP - minP) * fraction;
  } else {
    // interpolate mid to max
    const fraction = (slider - 50) / 50;
    currentPower = midP + (maxP - midP) * fraction;
  }
  
  const wpr = windPerRing(club, level, currentPower);
  const elevMult = 1 + ((Number(settings.elevation) || 0) / 100);
  const effectiveWind = (parseFloat(wind) || 0) * elevMult;
  
  const rings = effectiveWind / wpr;
  const displayRings = (wind && !isNaN(rings)) ? rings.toFixed(2) : '0.00';
  
  // Secondary Wind Effect (SWE) - Rule of thumb: ~20% of wind component for ball guide offset
  const angleRad = (windAngle * Math.PI) / 180;
  const cwComponent = effectiveWind * Math.sin(angleRad);
  const hwComponent = effectiveWind * Math.cos(angleRad);
  
  const sweCross = Math.abs(cwComponent * 0.2).toFixed(1);
  const sweHead = Math.abs(hwComponent * 0.2).toFixed(1);
  const isHeadwind = hwComponent < 0;
  
  return (
    <section className="shot-calculator" style={{ '--calc-accent': accentVar(club.category) }}>
      <div className="calc-header">
        <CategoryIcon category={club.category} size={20} style={{ color: 'var(--calc-accent)' }} />
        <h3>Shot Calculator</h3>
      </div>
      
      <div className="calc-body">
        <div className="calc-inputs">
          <div className="control-group">
            <label>Club</label>
            <select value={currentClubId} onChange={e => setSelectedClubId(e.target.value)}>
              {bag.map(b => {
                const c = clubs.find(cl => cl.id === b.clubId);
                return <option key={c.id} value={c.id}>{c.name} (Lv {b.level})</option>;
              })}
            </select>
          </div>
          <div className="control-group">
            <label>Wind</label>
            <input 
              type="number" 
              step="0.1" 
              placeholder="e.g. 8.5"
              value={wind} 
              onChange={e => setWind(e.target.value)} 
              style={{ width: '80px' }}
            />
          </div>
          <div className="control-group">
            <label>Wind Angle (deg)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="number"
                min="0"
                max="359"
                value={windAngle}
                onChange={e => setWindAngle(Number(e.target.value) % 360)}
                style={{ width: '60px' }}
              />
              <div 
                title="Drag to set wind direction"
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  background: 'var(--surface-1)', border: '1px solid var(--border-strong)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                  position: 'relative',
                  touchAction: 'none'
                }}
              >
                <svg 
                  viewBox="0 0 200 200" 
                  ref={compassRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                >
                  <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-strong)" strokeWidth="4" strokeDasharray="10,10" />
                  <line x1="100" y1="0" x2="100" y2="200" stroke="var(--gridline)" strokeWidth="2" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="var(--gridline)" strokeWidth="2" />
                  <circle cx="100" cy="100" r="8" fill="var(--text-primary)" />
                  <g transform={`rotate(${windAngle}, 100, 100)`}>
                    <line x1="100" y1="100" x2="100" y2="30" stroke="var(--series-1)" strokeWidth="10" />
                    <polygon points="80,45 100,10 120,45" fill="var(--series-1)" />
                  </g>
                  <circle cx="100" cy="100" r="100" fill="transparent" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="calc-slider-wrap">
          <div className="slider-labels">
            <span>Min (0%)</span>
            <span>Mid (50%)</span>
            <span>Max (100%)</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={slider} 
            onChange={e => setSlider(Number(e.target.value))} 
            className="slider-input"
          />
          <div className="slider-value">Slider: {slider}%</div>
        </div>
      </div>
      
      <div className="calc-result" style={{ flex: 1 }}>
        <div className="result-label">Adjust Rings</div>
        <div className="result-value">{displayRings}</div>
        {wind && (
          <div style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>
            <strong>SWE Ball Guide Offset:</strong><br/>
            {sweCross > 0 && `${sweCross} squares ${cwComponent > 0 ? 'Right' : 'Left'}`}<br/>
            {sweHead > 0 && `${sweHead} squares ${isHeadwind ? 'Push Up (Headwind)' : 'Pull Back (Tailwind)'}`}
          </div>
        )}
      </div>
    </section>
  );
}
