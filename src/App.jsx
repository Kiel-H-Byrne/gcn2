import { Box, Grid } from "@chakra-ui/react";
import { useState } from "react";
import { X } from "lucide-react";
import BagPanel from "./components/BagPanel";
import ChartControls from "./components/ChartControls";
import ChartOutput from "./components/ChartOutput";
import ClubEditorModal from "./components/ClubEditorModal";
import ClubGrid from "./components/ClubGrid";
import Footer from "./components/Footer";
import FullscreenOverlay from "./components/FullscreenOverlay";
import Header from "./components/Header";
import ShotCalculator from "./components/ShotCalculator";
import WidgetView from "./components/WidgetView";
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
  const [isBagEditingOpen, setIsBagEditingOpen] = useState(bag.length === 0);

  return (
    <Box maxW="1180px" mx="auto" p="20px 16px 48px" className="app">
      <Header
        isWidgetMode={isWidgetMode}
        setIsWidgetMode={setIsWidgetMode}
        isBagEditingOpen={isBagEditingOpen}
        setIsBagEditingOpen={setIsBagEditingOpen}
        theme={theme}
        setTheme={setTheme}
      />

      {!isWidgetMode ? (
        <>
          {isBagEditingOpen && (
            <div className="bag-editor-overlay" role="dialog" aria-modal="true" aria-label="Edit Bag Clubs & Levels">
              <div className="bag-editor-content">
                <div className="bag-editor-header">
                  <h2>Manage Bag Clubs &amp; Levels</h2>
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label="Close Bag Editor"
                    onClick={() => setIsBagEditingOpen(false)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-primary)" }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="bag-editor-body">
                  <Grid
                    templateColumns={{ base: "1fr", lg: "1fr 300px" }}
                    gap="24px"
                    alignItems="start"
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
                  </Grid>
                </div>
                <div className="bag-editor-footer">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() => setIsBagEditingOpen(false)}
                    style={{ padding: "8px 24px", borderRadius: "6px", fontWeight: "bold" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

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

          <Footer />
        </>
      ) : (
        <WidgetView
          bag={bag}
          clubs={clubs}
          settings={settings}
          setSettings={setSettings}
        />
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
    </Box>
  );
}
