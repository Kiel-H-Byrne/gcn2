import { Box, Grid } from "@chakra-ui/react";
import { useState } from "react";
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

  return (
    <Box maxW="1180px" mx="auto" p="20px 16px 48px" className="app">
      <Header
        isWidgetMode={isWidgetMode}
        setIsWidgetMode={setIsWidgetMode}
        theme={theme}
        setTheme={setTheme}
      />

      {!isWidgetMode ? (
        <>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 300px" }}
            gap="16px"
            alignItems="start"
            as="main"
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
