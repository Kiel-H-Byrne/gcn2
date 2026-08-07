import React from 'react';
import CategoryIcon from './CategoryIcon';
import { accentVar, getClubImageUrl } from '../utils';
import { WIND_MODES, buildWindPerRingTable, buildRingsPerWindTable } from '../lib/wind';
import balls from '../data/balls';

function getAccuracyColor(acc) {
  if (acc < 20) return '#dc2626'; // Dark Red
  if (acc < 40) return '#ea580c'; // Orange
  if (acc < 60) return '#eab308'; // Yellow
  if (acc < 85) return '#3b82f6'; // Blue
  return '#22c55e'; // Bright Green
}

function ringShadeStyle(ringValue) {
  const ringIdx = (Math.max(0, Math.ceil(ringValue) - 1) % 5) + 1;
  return { backgroundColor: `var(--ring-${ringIdx})` };
}

function WindTableRing({ club, level, mode, elevation }) {
  const rows = buildWindPerRingTable(club, level, mode, elevation, 10);
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

function WindTableWind({ club, level, mode, elevation, windStep }) {
  const rows = buildRingsPerWindTable(club, level, mode, elevation, { minWind: 1, maxWind: 16, step: windStep });
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

function PrintTable({ club, level, mode, settings, shorthandHeaders }) {
  const L_WIND = shorthandHeaders ? 'W' : 'Wind';
  const L_RING = shorthandHeaders ? 'R' : 'Ring';
  const L_MAX = shorthandHeaders ? 'Mx' : 'Max';
  const L_MID = shorthandHeaders ? 'Md' : 'Mid';
  const L_MIN = shorthandHeaders ? 'Mn' : 'Min';

  if (settings.variant === 'ring') {
    const rows = buildWindPerRingTable(club, level, mode, settings.elevation, 10);
    const left = rows.slice(0, 5);
    const right = rows.slice(5, 10);
    return (
      <table className="wind-table wind-table-print">
        <thead>
          <tr>
            <th>{L_RING}</th><th>{L_MAX}</th><th>{L_MID}</th><th>{L_MIN}</th>
            <th className="print-split">{L_RING}</th><th>{L_MAX}</th><th>{L_MID}</th><th>{L_MIN}</th>
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
    const rows = buildRingsPerWindTable(club, level, mode, settings.elevation, { minWind: 1, maxWind: 16, step: settings.windStep });
    const numCols = 4;
    const rowsPerCol = Math.ceil(rows.length / numCols);
    const cols = [];
    for (let i = 0; i < numCols; i++) {
      cols.push(rows.slice(i * rowsPerCol, (i + 1) * rowsPerCol));
    }
    return (
      <table className="wind-table wind-table-print">
        <thead>
          <tr>
            {cols.map((_, i) => (
              <React.Fragment key={`th-${i}`}>
                {i > 0 ? <th className="print-split">{L_WIND}</th> : <th>{L_WIND}</th>}
                <th>{L_MAX}</th><th>{L_MID}</th><th>{L_MIN}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowsPerCol }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {cols.map((col, colIndex) => {
                const cell = col[rowIndex];
                if (!cell) {
                  return (
                    <React.Fragment key={`empty-${colIndex}`}>
                      <td className={colIndex > 0 ? "print-split" : ""}></td>
                      <td></td><td></td><td></td>
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={`cell-${colIndex}`}>
                    <td className={colIndex > 0 ? "print-split" : ""}>{cell.wind.toFixed(1)}</td>
                    <td style={ringShadeStyle(cell.max)}>{cell.max.toFixed(1)}</td>
                    <td style={ringShadeStyle(cell.mid)}>{cell.mid.toFixed(1)}</td>
                    <td style={ringShadeStyle(cell.min)}>{cell.min.toFixed(1)}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export function ClubChartCard({ club, level, mode, settings, isFullscreen }) {
  const accuracy = club.accuracy[level - 1];
  const accColor = getAccuracyColor(accuracy);
  
  return (
    <div className="club-chart-card" style={{ '--chart-accent': accentVar(club.category) }}>
      <div className="club-chart-head">
        <img 
          src={getClubImageUrl(club.name, '64x64')} 
          alt="" 
          className="club-chart-img"
          width="32" 
          height="32"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
          }}
        />
        <CategoryIcon category={club.category} size={32} className="club-chart-icon" style={{ display: 'none' }} />
        <div className="club-chart-titles">
          <div className="club-chart-name">{club.name}</div>
          <div className="club-chart-sub">
            Lv {level}
            <span className="acc-badge" style={{ borderColor: accColor, background: `${accColor}15` }}>
              <span style={{ color: 'var(--text-secondary)' }}>{isFullscreen ? 'Acc' : 'Accuracy'}</span> <strong style={{ color: accColor }}>{accuracy}</strong>
            </span>
          </div>
        </div>
      </div>
      {!isFullscreen ? (
        <>
          <div className="club-chart-table-wrap screen-only">
            {settings.variant === 'ring' ? (
              <WindTableRing club={club} level={level} mode={mode} elevation={settings.elevation} />
            ) : (
              <WindTableWind club={club} level={level} mode={mode} elevation={settings.elevation} windStep={settings.windStep} />
            )}
          </div>
          <div className="club-chart-table-wrap print-only">
            <PrintTable club={club} level={level} mode={mode} settings={settings} />
          </div>
        </>
      ) : (
        <div className="club-chart-table-wrap">
          <PrintTable club={club} level={level} mode={mode} settings={settings} shorthandHeaders />
        </div>
      )}
    </div>
  );
}

export default function ChartOutput({ bag, clubs, settings }) {
  if (bag.length === 0) {
    return <div className="chart-empty">Add clubs to your bag to build a wind chart.</div>;
  }

  const selectedBall = balls.find(b => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];

  return (
    <section className="chart-output">
      {settings.title.trim() && (
        <div className="chart-title-banner">{settings.title.trim()}</div>
      )}
      {settings.notes?.trim() && (
        <div className="chart-notes-banner">{settings.notes.trim()}</div>
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
