import React, { useState, useRef, useEffect } from 'react';
import { windPerRingByPower, WIND_MODES } from '../lib/wind';
import { accentVar } from '../utils';

export default function Visualizers({ bag, clubs, settings }) {
  const [angle, setAngle] = useState(0); // 0 is straight UP (Headwind), 90 is RIGHT (Crosswind)
  const [windSpeed, setWindSpeed] = useState(5.0);
  const [selectedClubId, setSelectedClubId] = useState(bag.length > 0 ? bag[0].clubId : '');
  const [distanceMode, setDistanceMode] = useState('max'); // max, mid, min
  const [elevation, setElevation] = useState(0); // Percentage -50 to 50

  const compassRef = useRef(null);
  const mode = WIND_MODES[settings.modeIndex] || WIND_MODES[0];

  useEffect(() => {
    if (bag.length > 0 && !bag.find(c => c.clubId === selectedClubId)) {
      setSelectedClubId(bag[0].clubId);
    }
  }, [bag, selectedClubId]);

  const handleCompassDrag = (e) => {
    if (!compassRef.current) return;
    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Math.atan2 gives 0 at right, PI/2 at bottom, PI at left, -PI/2 at top
    // We want 0 at top, 90 at right, 180 at bottom, 270 at left
    let theta = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
    if (theta < 0) theta += 360;
    setAngle(Math.round(theta));
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

  // Calculations
  // Angle: 0 = headwind, 180 = tailwind. Cos(angle) gives headwind component.
  // 90 = crosswind right, 270 = crosswind left. Sin(angle) gives crosswind component.
  const angleRad = angle * (Math.PI / 180);
  const headwindEffect = Math.cos(angleRad);
  const crosswindEffect = Math.sin(angleRad);
  
  const hwText = headwindEffect > 0 ? `Headwind` : headwindEffect < 0 ? `Tailwind` : `No HW/TW`;
  const hwVal = Math.abs(headwindEffect * windSpeed).toFixed(1);
  const cwVal = Math.abs(crosswindEffect * windSpeed).toFixed(1);

  // Animated Ring Target Calculations
  const clubEntry = bag.find(c => c.clubId === selectedClubId);
  const club = clubs.find(c => c.id === selectedClubId);
  
  let ringOffset = 0;
  let windPerRingVal = 1;

  if (club && clubEntry) {
    const level = Math.min(Math.max(clubEntry.level, 1), club.maxLevel);
    const perRing = windPerRingByPower(club, level, mode);
    windPerRingVal = perRing[distanceMode];
    
    // Apply elevation (e.g. +10% elevation means 10% more wind effect)
    const effectiveWind = windSpeed * (1 + elevation / 100);
    ringOffset = effectiveWind / windPerRingVal;
  }

  // Draw rings
  // Ring colors match CSS variables
  const ringColors = [
    'var(--ring-5)', // White (outer)
    'var(--ring-4)', // Green
    'var(--ring-3)', // Blue
    'var(--ring-2)', // Orange
    'var(--ring-1)'  // Yellow (inner)
  ];
  
  // Ring radius based on SVG size 200x200 (center 100,100)
  // Each ring is 20px wide (max radius 100)
  
  // Target position offset
  const maxVisualOffset = 5; // Rings to show visually
  // Scale so 1 ring = 20px offset
  const targetX = 100 + (ringOffset * 20 * Math.sin(angleRad));
  const targetY = 100 - (ringOffset * 20 * Math.cos(angleRad)); // SVG y is inverted

  return (
    <section className="visualizers-section">
      <h2 className="visualizers-header">Visual Tools</h2>
      <div className="visualizers-grid">
        
        {/* Wind Angle Visualizer */}
        <div className="visualizer-card">
          <div className="visualizer-title">Wind Angle Visualizer</div>
          <div className="visualizer-subtitle">Drag to set wind direction</div>
          
          <div className="compass-container">
            <svg 
              className="compass-svg" 
              viewBox="0 0 200 200" 
              ref={compassRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              style={{ touchAction: 'none' }}
            >
              {/* Grid / Compass Lines */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="var(--gridline)" strokeWidth="1" />
              <line x1="0" y1="100" x2="200" y2="100" stroke="var(--gridline)" strokeWidth="1" />
              
              {/* Center */}
              <circle cx="100" cy="100" r="4" fill="var(--text-primary)" />
              
              {/* Wind Arrow */}
              <g transform={`rotate(${angle}, 100, 100)`}>
                <line x1="100" y1="100" x2="100" y2="20" stroke="var(--series-1)" strokeWidth="4" />
                <polygon points="90,30 100,10 110,30" fill="var(--series-1)" />
              </g>
              
              {/* Invisible interactive area */}
              <circle cx="100" cy="100" r="100" fill="transparent" cursor="pointer" />
            </svg>
            <div className="angle-readout">{angle}&deg;</div>
          </div>
          
          <div className="wind-split-stats">
            <div className="stat-box">
              <span className="stat-label">Angle</span>
              <span className="stat-value">{angle}&deg;</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">{hwText}</span>
              <span className="stat-value">{hwVal}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Crosswind</span>
              <span className="stat-value">{cwVal}</span>
            </div>
          </div>
        </div>

        {/* Animated Ring Targets */}
        <div className="visualizer-card">
          <div className="visualizer-title">Animated Ring Targets</div>
          <div className="visualizer-subtitle">Visual adjustment based on wind & club</div>
          
          <div className="ring-controls">
            <div className="control-group">
              <label>Wind Speed</label>
              <input type="number" step="0.1" min="0" max="25" value={windSpeed} onChange={e => setWindSpeed(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Elevation %</label>
              <input type="number" step="5" min="-50" max="100" value={elevation} onChange={e => setElevation(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Club</label>
              <select value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)}>
                {bag.map(entry => {
                  const c = clubs.find(cl => cl.id === entry.clubId);
                  if (!c) return null;
                  return <option key={c.id} value={c.id}>{c.name}</option>;
                })}
              </select>
            </div>
            <div className="control-group">
              <label>Distance</label>
              <select value={distanceMode} onChange={e => setDistanceMode(e.target.value)}>
                <option value="max">Max</option>
                <option value="mid">Mid</option>
                <option value="min">Min</option>
              </select>
            </div>
          </div>

          <div className="rings-container">
            <svg className="rings-svg" viewBox="0 0 200 200">
              <defs>
                <clipPath id="ring-clip">
                  <circle cx="100" cy="100" r="100" />
                </clipPath>
              </defs>
              <g clipPath="url(#ring-clip)">
                {/* Base rings */}
                {[100, 80, 60, 40, 20].map((r, i) => (
                  <circle key={i} cx="100" cy="100" r={r} fill={ringColors[i]} />
                ))}
                
                {/* Crosshair (Original center) */}
                <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                
                {/* Target adjustment indicator */}
                <circle cx={targetX} cy={targetY} r="8" fill="var(--danger)" stroke="#fff" strokeWidth="2" />
                <line x1="100" y1="100" x2={targetX} y2={targetY} stroke="var(--danger)" strokeWidth="2" strokeDasharray="4,4" />
              </g>
            </svg>
            <div className="rings-readout">
              Pull <strong style={{color: 'var(--danger)'}}>{ringOffset.toFixed(2)}</strong> rings
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
