import { Box, Grid } from "@chakra-ui/react";
import { Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import BagPanel from "./components/BagPanel";
import ChartControls from "./components/ChartControls";
import ChartOutput from "./components/ChartOutput";
import ClubEditorModal from "./components/ClubEditorModal";
import ClubGrid from "./components/ClubGrid";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import FullscreenOverlay from "./components/FullscreenOverlay";
import Header from "./components/Header";
import PrintSheet from "./components/PrintSheet";
import ReferenceGraph from "./components/ReferenceGraph";
import ShotCalculator from "./components/ShotCalculator";
import TipsPage from "./components/TipsPage";
import ResourcesPage from "./components/ResourcesPage";
import UniversalChart from "./components/UniversalChart";
import WidgetView from "./components/WidgetView";
import LandingPage from "./components/landing/LandingPage";
import { useApp } from "./hooks/useApp";
import { useRoute } from "./hooks/useRoute";
import {
  initGA,
  trackPageView,
  trackLandingView,
  checkAndTrackReturnVisit,
  setupPWAInstallTracking,
  trackBagStarted,
  trackBagCompleted,
  trackFullscreenOpened,
  trackViewModeChange,
} from "./lib/analytics";

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
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isUniversalOpen, setIsUniversalOpen] = useState(false);

  const {
    currentPath,
    navigate,
    landingConfig,
    isLandingPage,
    isTipsPage,
    isResourcesPage,
  } = useRoute();

  useEffect(() => {
    initGA();
    trackLandingView();
    checkAndTrackReturnVisit();
    setupPWAInstallTracking();

    if (!isLandingPage && !isTipsPage && !isResourcesPage) {
      trackPageView();
      if (bag.length === 0) {
        trackBagStarted({ source: "initial_modal" });
      }
    }
  }, [isLandingPage, isTipsPage, isResourcesPage]);

  const handleCloseBagEditor = () => {
    setIsBagEditingOpen(false);
    if (bag.length > 0) {
      const categoriesFilled = new Set(
        bag
          .map((b) => clubs.find((c) => c.id === b.clubId)?.category)
          .filter(Boolean),
      ).size;
      trackBagCompleted({
        clubCount: bag.length,
        categoriesFilled,
        source: "editor_done",
      });
    }
  };

  if (isTipsPage) {
    return <TipsPage navigate={navigate} onBack={() => navigate("/")} />;
  }

  if (isResourcesPage) {
    return <ResourcesPage navigate={navigate} onBack={() => navigate("/")} />;
  }

  if (isLandingPage && landingConfig) {
    return (
      <LandingPage
        config={landingConfig}
        navigate={navigate}
        bag={bag}
        setBag={setBag}
        clubs={clubs}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  return (
    <Box
      maxW={isWidgetMode ? "100vw" : "1180px"}
      mx="auto"
      p={isWidgetMode ? "4px 6px" : "20px 16px 48px"}
      className={`app ${isWidgetMode ? "is-widget-mode" : ""}`}
    >
      <Header
        isWidgetMode={isWidgetMode}
        setIsWidgetMode={setIsWidgetMode}
        isBagEditingOpen={isBagEditingOpen}
        setIsBagEditingOpen={setIsBagEditingOpen}
        isReferenceOpen={isReferenceOpen}
        setIsReferenceOpen={setIsReferenceOpen}
        isUniversalOpen={isUniversalOpen}
        setIsUniversalOpen={setIsUniversalOpen}
        navigate={navigate}
        theme={theme}
        setTheme={setTheme}
        bag={bag}
        setBag={setBag}
        settings={settings}
        setSettings={setSettings}
        savedProfiles={savedProfiles}
      />

      {!isWidgetMode ? (
        <>
          {isReferenceOpen && (
            <Box mb="24px" className="no-print">
              <ReferenceGraph
                bag={bag}
                clubs={clubs}
                settings={settings}
                savedProfiles={savedProfiles}
              />
            </Box>
          )}
          {isBagEditingOpen && (
            <div
              className="bag-editor-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Edit Bag Clubs & Levels"
            >
              <div className="bag-editor-content">
                <div className="bag-editor-header">
                  <h2>Manage Bag Clubs &amp; Levels</h2>
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label="Close Bag Editor"
                    onClick={handleCloseBagEditor}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                    }}
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
                    onClick={handleCloseBagEditor}
                    style={{
                      padding: "8px 24px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {bag.length > 0 && (
            <ChartControls
              bag={bag}
              setBag={setBag}
              settings={settings}
              setSettings={setSettings}
              savedProfiles={savedProfiles}
              setSavedProfiles={setSavedProfiles}
              openFullscreen={() => {
                setIsFullscreenOpen(true);
                trackFullscreenOpened({
                  bagSize: bag.length,
                  source: "chart_controls",
                });
                trackViewModeChange("fullscreen");
              }}
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

          <ChartOutput bag={bag} setBag={setBag} clubs={clubs} settings={settings} />

          <Footer onNavigate={navigate} />
        </>
      ) : (
        <ErrorBoundary
          onReset={() => setIsWidgetMode(false)}
          resetLabel="← Exit Live Play"
        >
          <WidgetView
            bag={bag}
            setBag={setBag}
            clubs={clubs}
            settings={settings}
            setSettings={setSettings}
            savedProfiles={savedProfiles}
            setSavedProfiles={setSavedProfiles}
            navigate={navigate}
            onExitWidget={() => setIsWidgetMode(false)}
          />
        </ErrorBoundary>
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
          setBag={setBag}
          clubs={clubs}
          settings={settings}
          onClose={() => {
            setIsFullscreenOpen(false);
            trackViewModeChange(isWidgetMode ? "widget" : "standard");
          }}
        />
      )}

      {isUniversalOpen && (
        <div
          className="bag-editor-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Universal Reference Chart"
          onClick={(e) => {
            if (e.target.classList.contains("bag-editor-overlay")) {
              setIsUniversalOpen(false);
            }
          }}
        >
          <div className="bag-editor-content universal-modal-content" style={{ maxWidth: "1080px" }}>
            <div className="bag-editor-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={18} style={{ color: "#eab308" }} />
                Universal Reference Chart
              </h2>
              <button
                className="icon-btn"
                type="button"
                aria-label="Close Universal Chart"
                onClick={() => setIsUniversalOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="bag-editor-body universal-modal-body" style={{ padding: "14px" }}>
              <ErrorBoundary
                onReset={() => setIsUniversalOpen(false)}
                resetLabel="← Close Universal Chart"
              >
                <UniversalChart
                  clubs={clubs}
                  settings={settings}
                  setSettings={setSettings}
                  setBag={setBag}
                  onLoadToSimulator={(loadedBag, loadedSettings) => {
                    if (setBag) setBag(loadedBag);
                    if (setSettings && loadedSettings) setSettings(loadedSettings);
                    setIsUniversalOpen(false);
                  }}
                  onClose={() => setIsUniversalOpen(false)}
                  navigate={navigate}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated single-page, one-sided Print & PDF sheet */}
      <PrintSheet bag={bag} clubs={clubs} settings={settings} />
    </Box>
  );
}
