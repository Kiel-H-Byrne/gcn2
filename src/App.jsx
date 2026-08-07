import { Flag, Maximize, X } from "lucide-react";
import { useState } from "react";
import BagPanel from "./components/BagPanel";
import ChartControls from "./components/ChartControls";
import ChartOutput from "./components/ChartOutput";
import ClubEditorModal from "./components/ClubEditorModal";
import ClubGrid from "./components/ClubGrid";
import FullscreenOverlay from "./components/FullscreenOverlay";
import ShotCalculator from "./components/ShotCalculator";
import Visualizers from "./components/Visualizers";
import { useApp } from "./hooks/useApp";

export default function App() {
  const {
    customClubs,
    setCustomClubs,
    deletedSeedIds,
    setDeletedSeedIds,
    bag,
    setBag,
    settings,
    setSettings,
    lastLevel,
    setLastLevel,
    activeCategory,
    setActiveCategory,
    theme,
    setTheme,
    clubs,
    getClubById,
    isSeedClub,
    savedProfiles,
    setSavedProfiles,
  } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="brand">
            <Flag className="brand-icon" size={26} />
            <h1>Wind Chart Builder</h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className={`btn-ghost ${isWidgetMode ? "is-active" : ""}`}
              onClick={() => setIsWidgetMode(!isWidgetMode)}
              title="Toggle Widget Mode (compact view for split-screen)"
              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
            >
              {isWidgetMode ? (
                <X size={14} style={{ marginRight: "4px" }} />
              ) : (
                <Maximize size={14} style={{ marginRight: "4px" }} />
              )}
              {isWidgetMode ? "Exit Widget" : "Widget"}
            </button>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                background: "var(--surface-2)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="system">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <p className="subtitle">
          Tap your clubs, dial in levels, get an instant wind chart. No
          dropdowns.
        </p>
      </header>

      <main
        className="layout"
        style={{ display: isWidgetMode ? "none" : "grid" }}
      >
        <ClubGrid
          clubs={clubs}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          bag={bag}
          setBag={setBag}
          lastLevel={lastLevel}
          setLastLevel={setLastLevel}
          openEditorModal={() => setIsEditorOpen(true)}
        />
        <BagPanel
          bag={bag}
          setBag={setBag}
          clubs={clubs}
          setLastLevel={setLastLevel}
          settings={settings}
          setSettings={setSettings}
          savedProfiles={savedProfiles}
          setSavedProfiles={setSavedProfiles}
        />
      </main>

      {bag.length > 0 && (
        <Visualizers bag={bag} clubs={clubs} settings={settings} />
      )}

      {bag.length > 0 && !isWidgetMode && (
        <ChartControls
          settings={settings}
          setSettings={setSettings}
          openFullscreen={() => setIsFullscreenOpen(true)}
        />
      )}

      {bag.length > 0 && (
        <ShotCalculator bag={bag} clubs={clubs} settings={settings} />
      )}

      <ChartOutput bag={bag} clubs={clubs} settings={settings} />

      <footer className="app-footer">
        <p>
          Club power/accuracy data from the
          <a
            href="https://github.com/golf-clash-notebook/golf-clash-notebook.github.io"
            target="_blank"
            rel="noreferrer"
          >
            {" "}
            golf-clash-notebook
          </a>
          community project (MIT licensed). Golf Clash club stats change with
          game updates &mdash; see <code>README.md</code> to refresh this app's
          data. Not affiliated with Playdemic.
        </p>
      </footer>

      {isEditorOpen && (
        <ClubEditorModal
          onClose={() => setIsEditorOpen(false)}
          customClubs={customClubs}
          setCustomClubs={setCustomClubs}
          deletedSeedIds={deletedSeedIds}
          setDeletedSeedIds={setDeletedSeedIds}
          bag={bag}
          setBag={setBag}
          clubs={clubs}
          isSeedClub={isSeedClub}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}

      {isFullscreenOpen && (
        <FullscreenOverlay
          bag={bag}
          clubs={clubs}
          settings={settings}
          onClose={() => setIsFullscreenOpen(false)}
        />
      )}
    </div>
  );
}
