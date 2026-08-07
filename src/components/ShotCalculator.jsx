import React, { useState, useRef, useEffect } from 'react';
import CategoryIcon from './CategoryIcon';
import { WIND_MODES, maxPower, midPower, minPower, windPerRing } from '../lib/wind';
import balls from '../data/balls';
import { accentVar } from '../utils';

export default function ShotCalculator({ bag, clubs, settings }) {
  const [selectedClubId, setSelectedClubId] = useState(bag[0]?.clubId || '');
  const [wind, setWind] = useState(5.0);
  const [windAngle, setWindAngle] = useState(0);
  const [distance, setDistance] = useState(50);
  const [elevation, setElevation] = useState(Number(settings.elevation) || 0);

  const compassRef = useRef(null);

  useEffect(() => {
    if (bag.length > 0 && !bag.find(c => c.clubId === selectedClubId)) {
      setSelectedClubId(bag[0].clubId);
    }
  }, [bag, selectedClubId]);

  if (bag.length === 0) return null;

  const currentClubId = bag.find(b => b.clubId === selectedClubId) ? selectedClubId : bag[0].clubId;
  const bagEntry = bag.find(b => b.clubId === currentClubId);
  if (!bagEntry) return null;

  const club = clubs.find(c => c.id === bagEntry.clubId);
  const level = bagEntry.level;
  const selectedBall = balls.find(b => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];

  const minP = minPower(club, level, mode);
  const midP = midPower(club, level, mode);
  const maxP = maxPower(club, level, mode);

  let currentPower;
  if (distance <= 50) {
    currentPower = minP + (midP - minP) * (distance / 50);
  } else {
    currentPower = midP + (maxP - midP) * ((distance - 50) / 50);
  }

  const wpr = windPerRing(club, level, currentPower);
  const elevMult = 1 + (elevation / 100);
  const effectiveWind = (parseFloat(wind) || 0) * elevMult;
  
  const rings = effectiveWind / wpr;
  const displayRings = (wind && !isNaN(rings)) ? rings.toFixed(2) : '0.00';

  const angleRad = (windAngle * Math.PI) / 180;
  const cwComponent = effectiveWind * Math.sin(angleRad);
  const hwComponent = effectiveWind * Math.cos(angleRad);

  const sweCross = Math.abs(cwComponent * 0.2).toFixed(1);
  const sweHead = Math.abs(hwComponent * 0.2).toFixed(1);
  const isHeadwind = hwComponent < 0;

  const handleCompassDrag = (e) => {
    if (!compassRef.current) return;
    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Angle calculation
    let theta = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
    if (theta < 0) theta += 360;
    setWindAngle(Math.round(theta));

    // Magnitude calculation (max radius = 20 wind speed)
    const maxRadiusPx = rect.width / 2;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    let speed = (distPx / maxRadiusPx) * 20;
    if (speed > 25) speed = 25;
    setWind(Number(speed.toFixed(1)));
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

  // Ring target visualization math
  const ringColors = [
    'var(--ring-5)', 'var(--ring-4)', 'var(--ring-3)', 'var(--ring-2)', 'var(--ring-1)'
  ];
  // 1 ring = 20px visually in a 200x200 svg
  const visualRingOffset = rings > 10 ? 10 : rings;
  const targetX = 100 + (visualRingOffset * 20 * Math.sin(angleRad));
  const targetY = 100 - (visualRingOffset * 20 * Math.cos(angleRad));

  // Determine vector arrow length for compass (0 to 100 max)
  const arrowLength = Math.min((wind / 20) * 100, 100);

  return (
    <section className="shot-calculator hud-widget" style={{ '--calc-accent': accentVar(club.category) }}>
      <div className="calc-header">
        <CategoryIcon category={club.category} size={20} style={{ color: 'var(--calc-accent)' }} />
        <h3>HUD: Quick Calculator</h3>
      </div>
      
      <div className="hud-grid">
        {/* Left Side: Vector Compass & Sliders */}
        <div className="hud-controls">
          
          <div className="control-group">
            <select value={currentClubId} onChange={e => setSelectedClubId(e.target.value)} className="hud-club-select">
              {bag.map(b => {
                const c = clubs.find(cl => cl.id === b.clubId);
                return <option key={c.id} value={c.id}>{c.name} (Lv {b.level})</option>;
              })}
            </select>
          </div>

          <div className="hud-compass-row">
            <div className="hud-compass-wrap" title="Drag arrow to set Wind Angle & Speed">
              <svg 
                viewBox="0 0 200 200" 
                ref={compassRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                className="hud-compass-svg"
              >
                <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-strong)" strokeWidth="4" strokeDasharray="10,10" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="var(--gridline)" strokeWidth="2" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="var(--gridline)" strokeWidth="2" />
                
                {/* Wind Vector Arrow */}
                <g transform={`rotate(${windAngle}, 100, 100)`}>
                  <line x1="100" y1="100" x2="100" y2={100 - arrowLength + 10} stroke="var(--series-1)" strokeWidth="8" strokeLinecap="round" />
                  <polygon points={`85,${100 - arrowLength + 15} 100,${100 - arrowLength - 5} 115,${100 - arrowLength + 15}`} fill="var(--series-1)" />
                </g>
                <circle cx="100" cy="100" r="6" fill="var(--text-primary)" />
                <circle cx="100" cy="100" r="100" fill="transparent" />
              </svg>
            </div>
            
            <div className="hud-compass-inputs">
              <div className="control-group">
                <label>Speed (mph)</label>
                <input type="number" step="0.1" value={wind} onChange={e => setWind(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label>Angle (&deg;)</label>
                <input type="number" value={windAngle} onChange={e => setWindAngle(Number(e.target.value)%360)} />
              </div>
            </div>
          </div>

          <div className="calc-slider-wrap">
            <div className="slider-labels"><span>Min</span><span>Dist: {distance}%</span><span>Max</span></div>
            <input type="range" min="0" max="100" value={distance} onChange={e => setDistance(Number(e.target.value))} className="slider-input" />
          </div>

          <div className="calc-slider-wrap">
            <div className="slider-labels"><span>-50%</span><span>Elev: {elevation}%</span><span>+50%</span></div>
            <input type="range" min="-50" max="50" step="5" value={elevation} onChange={e => setElevation(Number(e.target.value))} className="slider-input" />
          </div>
        </div>

        {/* Right Side: LED Screen & Target Vis */}
        <div className="hud-results">
          
          <div className="calc-result">
            <div className="result-label">Adjust Rings</div>
            <div className="result-value">{displayRings}</div>
            {wind > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>
                {sweCross > 0 && `SWE: ${sweCross} sq ${cwComponent > 0 ? 'Right' : 'Left'}`}<br/>
                {sweHead > 0 && `SWE: ${sweHead} sq ${isHeadwind ? 'Push Up' : 'Pull Back'}`}
              </div>
            )}
          </div>

          <div className="hud-target-vis">
             <svg viewBox="0 0 200 200">
              <defs><clipPath id="rc"><circle cx="100" cy="100" r="100"/></clipPath></defs>
              <g clipPath="url(#rc)">
                {[100, 80, 60, 40, 20].map((r, i) => <circle key={i} cx="100" cy="100" r={r} fill={ringColors[i]} />)}
                <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                <circle cx={targetX} cy={targetY} r="8" fill="var(--danger)" stroke="#fff" strokeWidth="2" />
                <line x1="100" y1="100" x2={targetX} y2={targetY} stroke="var(--danger)" strokeWidth="2" strokeDasharray="4,4" />
              </g>
            </svg>
          </div>
          
        </div>
      </div>
    </section>
  );
}
