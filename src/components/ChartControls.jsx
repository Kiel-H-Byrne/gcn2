import React from 'react';
import { WIND_MODES } from '../lib/wind';
import balls from '../data/balls';

export default function ChartControls({ settings, setSettings, openFullscreen }) {
  return (
    <section className="chart-controls">
      <div className="control-group">
        <label htmlFor="chart-title">Title</label>
        <input 
          id="chart-title" 
          type="text" 
          placeholder="e.g. My Tour Bag" 
          maxLength={60} 
          value={settings.title}
          onChange={(e) => setSettings({ ...settings, title: e.target.value })}
        />
      </div>

      <div className="control-group">
        <span className="control-label">Chart</span>
        <div className="segmented" role="tablist">
          <button 
            type="button" 
            className={`segmented-btn ${settings.variant === 'ring' ? 'is-active' : ''}`}
            role="tab" 
            aria-selected={settings.variant === 'ring'}
            onClick={() => setSettings({ ...settings, variant: 'ring' })}
          >
            Wind per Ring
          </button>
          <button 
            type="button" 
            className={`segmented-btn ${settings.variant === 'wind' ? 'is-active' : ''}`}
            role="tab" 
            aria-selected={settings.variant === 'wind'}
            onClick={() => setSettings({ ...settings, variant: 'wind' })}
          >
            Rings per Wind
          </button>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="ball-select">Ball</label>
        <select 
          id="ball-select"
          value={settings.ballName}
          onChange={(e) => setSettings({ ...settings, ballName: e.target.value })}
        >
          {balls.map((b) => (
            <option key={b.name} value={b.name}>{b.name} (P{b.power} W{b.windResistance} S{b.sideSpin})</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="elevation-input">Elevation %</label>
        <input
          id="elevation-input"
          type="number"
          step="5"
          value={settings.elevation}
          onChange={(e) => setSettings({ ...settings, elevation: Number(e.target.value) })}
          style={{ width: '80px' }}
        />
      </div>

      {settings.variant === 'wind' && (
        <div className="control-group">
          <label htmlFor="wind-step-select">Wind step</label>
          <select 
            id="wind-step-select"
            value={settings.windStep}
            onChange={(e) => setSettings({ ...settings, windStep: Number(e.target.value) })}
          >
            <option value={0.2}>0.2</option>
            <option value={0.5}>0.5</option>
            <option value={1}>1.0</option>
          </select>
        </div>
      )}

      <button className="btn-ghost" type="button" onClick={openFullscreen}>
        <svg width="15" height="15"><use href="#icon-expand" /></svg>
        Full-Screen View
      </button>

      <button className="btn-primary" type="button" onClick={() => window.print()}>
        <svg width="16" height="16"><use href="#icon-wind" /></svg>
        Print / Save PDF
      </button>
    </section>
  );
}
