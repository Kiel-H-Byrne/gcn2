import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { WIND_MODES, maxPower, midPower, minPower, windPerRing } from '../lib/wind';
import balls from '../data/balls';
import { accentVar } from '../utils';

export default function ShotCalculator({ bag, clubs, settings }) {
  const [selectedClubId, setSelectedClubId] = useState(bag[0]?.clubId || '');
  const [wind, setWind] = useState('');
  const [windAngle, setWindAngle] = useState(0); // 0 = straight tailwind, 90 = straight crosswind
  const [slider, setSlider] = useState(50);
  
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
                title="Wind direction (arrow points where wind blows)"
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'var(--surface-1)', border: '2px solid var(--border-strong)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <ArrowUp 
                  size={16} 
                  color="var(--brand)" 
                  style={{ transform: `rotate(${windAngle}deg)`, transition: 'transform 0.2s ease' }} 
                />
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
