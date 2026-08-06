import React from 'react';
import { WIND_MODES } from '../lib/wind';

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
        <label htmlFor="mode-select">Power mode</label>
        <select 
          id="mode-select"
          value={settings.modeIndex}
          onChange={(e) => setSettings({ ...settings, modeIndex: Number(e.target.value) })}
        >
          {WIND_MODES.map((mode, i) => (
            <option key={i} value={i}>{mode.name}</option>
          ))}
        </select>
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
