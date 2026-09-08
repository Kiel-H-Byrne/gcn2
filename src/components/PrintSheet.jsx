import React from "react";
import balls from "../data/balls";
import { WIND_MODES } from "../lib/wind";
import { ClubChartCard } from "./ChartOutput";

export default function PrintSheet({ bag, clubs, settings }) {
  if (!bag || bag.length === 0) return null;

  const selectedBall =
    balls.find((b) => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];
  const elevation = Number(settings.elevation) || 0;
  const subtitle = `${selectedBall.name} Ball (P${selectedBall.power}) · ${
    settings.variant === "ring" ? "Wind per Ring" : "Rings per Wind"
  }${elevation !== 0 ? ` · ${elevation > 0 ? "+" : ""}${elevation}% Elev` : ""}`;
  const bagName = settings.title?.trim() || "Active Bag";

  return (
    <div className="print-sheet print-only" aria-hidden="true">
      <div className="print-sheet-header">
        <div className="print-sheet-brand">
          <img src="/pwa-192x192.png" alt="" className="print-sheet-logo" />
          <div>
            <h1 className="print-sheet-app-title">The Caddie&apos;s Compass</h1>
            <p className="print-sheet-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="print-sheet-bag-info">
          <div className="print-sheet-bag-badge">
            <span className="print-sheet-bag-tag">GOLF BAG</span>
            <h2 className="print-sheet-bag-title">{bagName}</h2>
          </div>
          {settings.notes?.trim() && (
            <p className="print-sheet-notes">{settings.notes.trim()}</p>
          )}
        </div>
      </div>

      <div className="print-sheet-grid">
        {bag.map((entry) => {
          const club = clubs.find((c) => c.id === entry.clubId);
          if (!club) return null;
          const level = Math.min(Math.max(entry.level, 1), club.maxLevel);
          return (
            <ClubChartCard
              key={club.id}
              club={club}
              level={level}
              mode={mode}
              settings={settings}
              isFullscreen={true}
            />
          );
        })}
      </div>
    </div>
  );
}
