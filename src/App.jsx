import { Maximize, X } from "lucide-react";
import { useState } from "react";
import BagPanel from "./components/BagPanel";
import ChartControls from "./components/ChartControls";
import ChartOutput from "./components/ChartOutput";
import ClubEditorModal from "./components/ClubEditorModal";
import ClubGrid from "./components/ClubGrid";
import FullscreenOverlay from "./components/FullscreenOverlay";
import ShotCalculator from "./components/ShotCalculator";
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
      <header
        className={`app-header ${isWidgetMode ? "widget-mode-header" : ""}`}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="brand">
            <img src="/pwa-192x192.png" alt="Logo" className="brand-icon-img" />
            <h1>The Caddie's Compass</h1>
          </div>
          <div
            className="header-actions"
            style={{ display: "flex", gap: isWidgetMode ? "4px" : "8px" }}
          >
            <button
              type="button"
              className={`btn-ghost header-btn ${isWidgetMode ? "is-active" : ""}`}
              onClick={() => setIsWidgetMode(!isWidgetMode)}
              title="Toggle Widget Mode (compact view for split-screen)"
            >
              {isWidgetMode ? (
                <X size={10} style={{ marginRight: "2px" }} />
              ) : (
                <Maximize size={14} style={{ marginRight: "4px" }} />
              )}
              {isWidgetMode ? "Exit Widget" : "Widget"}
            </button>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="header-select"
            >
              <option value="system">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        {!isWidgetMode && (
          <div
            className="intro-blurb"
            style={{
              marginTop: "12px",
              padding: "14px",
              background: "var(--surface-2)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            <p
              style={{
                margin: "0 0 10px 0",
                fontWeight: "bold",
                color: "var(--text-primary)",
              }}
            >
              How to use:
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <li>
                <strong>Pick your clubs:</strong> Tap on the clubs to add them
                to your bag.
              </li>
              <li>
                <strong>Set the levels:</strong> Adjust the level sliders to
                match your clubs in-game.
              </li>
              <li>
                <strong>Read the chart:</strong> View the calculated wind
                adjustments below instantly!
              </li>
            </ul>
          </div>
        )}
      </header>

      {!isWidgetMode ? (
        <>
          <main className="layout">
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
            <ChartControls
              settings={settings}
              setSettings={setSettings}
              openFullscreen={() => setIsFullscreenOpen(true)}
            />
          )}

          {bag.length > 0 && (
            <ShotCalculator
              bag={bag}
              clubs={clubs}
              settings={settings}
              setSettings={setSettings}
            />
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
              community project (MIT licensed). Golf Clash club stats change
              with game updates &mdash; see <code>README.md</code> to refresh
              this app's data. Not affiliated with Playdemic.
            </p>
          </footer>
        </>
      ) : (
        <div className="widget-view">
          <div className="widget-scroll-container">
            <div className="widget-screen">
              {bag.length > 0 && (
                <ShotCalculator
                  bag={bag}
                  clubs={clubs}
                  settings={settings}
                  setSettings={setSettings}
                  isWidgetMode={true}
                />
              )}
            </div>
            <div className="widget-screen">
              <ChartOutput
                bag={bag}
                clubs={clubs}
                settings={settings}
                isWidgetMode={true}
              />
            </div>
          </div>
        </div>
      )}

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
