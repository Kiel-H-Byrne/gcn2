import React from 'react';
import { accentVar } from '../utils';
import { WIND_MODES, buildWindPerRingTable, buildRingsPerWindTable } from '../lib/wind';

function ringShadeStyle(ringValue) {
  const clamped = Math.min(10, Math.max(1, ringValue));
  const pct = 6 + (clamped - 1) * ((46 - 6) / 9);
  return { backgroundColor: `color-mix(in srgb, var(--series-1) ${pct.toFixed(1)}%, var(--surface-1))` };
}

function WindTableRing({ club, level, mode }) {
  const rows = buildWindPerRingTable(club, level, mode, 10);
  return (
    <table className="wind-table">
      <thead>
        <tr><th>Ring</th><th>Max</th><th>Mid</th><th>Min</th></tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.ring}>
            <td>{row.ring}</td>
            <td style={ringShadeStyle(row.ring)}>{row.max.toFixed(1)}</td>
            <td style={ringShadeStyle(row.ring)}>{row.mid.toFixed(1)}</td>
            <td style={ringShadeStyle(row.ring)}>{row.min.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WindTableWind({ club, level, mode, windStep }) {
  const rows = buildRingsPerWindTable(club, level, mode, { minWind: 1, maxWind: 16, step: windStep });
  return (
    <table className="wind-table">
      <thead>
        <tr><th>Wind</th><th>Max</th><th>Mid</th><th>Min</th></tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.wind}>
            <td>{row.wind.toFixed(1)}</td>
            <td style={ringShadeStyle(row.max)}>{row.max.toFixed(1)}</td>
            <td style={ringShadeStyle(row.mid)}>{row.mid.toFixed(1)}</td>
            <td style={ringShadeStyle(row.min)}>{row.min.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintTable({ club, level, mode, settings }) {
  if (settings.variant === 'ring') {
    const rows = buildWindPerRingTable(club, level, mode, 10);
    const left = rows.slice(0, 5);
    const right = rows.slice(5, 10);
    return (
      <table className="wind-table wind-table-print">
        <thead>
          <tr>
            <th>Ring</th><th>Max</th><th>Mid</th><th>Min</th>
            <th className="print-split">Ring</th><th>Max</th><th>Mid</th><th>Min</th>
          </tr>
        </thead>
        <tbody>
          {left.map((l, i) => {
            const r = right[i];
            return (
              <tr key={l.ring}>
                <td>{l.ring}</td>
                <td style={ringShadeStyle(l.ring)}>{l.max.toFixed(1)}</td>
                <td style={ringShadeStyle(l.ring)}>{l.mid.toFixed(1)}</td>
                <td style={ringShadeStyle(l.ring)}>{l.min.toFixed(1)}</td>
                <td className="print-split">{r.ring}</td>
                <td style={ringShadeStyle(r.ring)}>{r.max.toFixed(1)}</td>
                <td style={ringShadeStyle(r.ring)}>{r.mid.toFixed(1)}</td>
                <td style={ringShadeStyle(r.ring)}>{r.min.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  } else {
    const rows = buildRingsPerWindTable(club, level, mode, { minWind: 1, maxWind: 16, step: settings.windStep });
    const mid = Math.ceil(rows.length / 2);
    const left = rows.slice(0, mid);
    const right = rows.slice(mid);
    return (
      <table className="wind-table wind-table-print">
        <thead>
          <tr>
            <th>Wind</th><th>Max</th><th>Mid</th><th>Min</th>
            <th className="print-split">Wind</th><th>Max</th><th>Mid</th><th>Min</th>
          </tr>
        </thead>
        <tbody>
          {left.map((l, i) => {
            const r = right[i];
            return (
              <tr key={l.wind}>
                <td>{l.wind.toFixed(1)}</td>
                <td style={ringShadeStyle(l.max)}>{l.max.toFixed(1)}</td>
                <td style={ringShadeStyle(l.mid)}>{l.mid.toFixed(1)}</td>
                <td style={ringShadeStyle(l.min)}>{l.min.toFixed(1)}</td>
                {r ? (
                  <>
                    <td className="print-split">{r.wind.toFixed(1)}</td>
                    <td style={ringShadeStyle(r.max)}>{r.max.toFixed(1)}</td>
                    <td style={ringShadeStyle(r.mid)}>{r.mid.toFixed(1)}</td>
                    <td style={ringShadeStyle(r.min)}>{r.min.toFixed(1)}</td>
                  </>
                ) : (
                  <><td className="print-split"></td><td></td><td></td><td></td></>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

export function ClubChartCard({ club, level, mode, settings, isFullscreen }) {
  const accuracy = club.accuracy[level - 1];
  return (
    <div className="club-chart-card" style={{ '--chart-accent': accentVar(club.category) }}>
      <div className="club-chart-head">
        <svg className="club-chart-icon" width="24" height="24"><use href={`#icon-${club.category}`} /></svg>
        <div className="club-chart-titles">
          <div className="club-chart-name">{club.name}</div>
          <div className="club-chart-sub">Lv {level} &middot; Accuracy {accuracy}</div>
        </div>
      </div>
      <div className={`club-chart-table-wrap ${isFullscreen ? '' : 'screen-only'}`}>
        {settings.variant === 'ring' ? (
          <WindTableRing club={club} level={level} mode={mode} />
        ) : (
          <WindTableWind club={club} level={level} mode={mode} windStep={settings.windStep} />
        )}
      </div>
      {!isFullscreen && (
        <div className="club-chart-table-wrap print-only">
          <PrintTable club={club} level={level} mode={mode} settings={settings} />
        </div>
      )}
    </div>
  );
}

export default function ChartOutput({ bag, clubs, settings }) {
  if (bag.length === 0) {
    return <div className="chart-empty">Add clubs to your bag to build a wind chart.</div>;
  }

  const mode = WIND_MODES[settings.modeIndex];

  return (
    <section className="chart-output">
      {settings.title.trim() && (
        <div className="chart-title-banner">{settings.title.trim()}</div>
      )}
      {bag.map(entry => {
        const club = clubs.find(c => c.id === entry.clubId);
        if (!club) return null;
        const level = Math.min(Math.max(entry.level, 1), club.maxLevel);
        return <ClubChartCard key={club.id} club={club} level={level} mode={mode} settings={settings} />;
      })}
    </section>
  );
}
