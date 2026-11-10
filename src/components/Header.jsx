import { Box, Flex, Heading, Text, Grid } from "@chakra-ui/react";
import {
  BookOpen,
  Briefcase,
  Gamepad2,
  Info,
  Lightbulb,
  Menu,
  Moon,
  Sun,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  trackGuideToggle,
  trackReferenceToggle,
  trackViewModeChange,
  trackThemeChange,
  trackWidgetOpened,
  trackBagStarted,
} from "../lib/analytics";

export default function Header({
  isWidgetMode,
  setIsWidgetMode,
  isBagEditingOpen,
  setIsBagEditingOpen,
  isReferenceOpen,
  setIsReferenceOpen,
  isUniversalOpen,
  setIsUniversalOpen,
  navigate,
  theme,
  setTheme,
  bag = [],
  setBag,
  settings = {},
  setSettings,
  savedProfiles = {},
}) {
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    try {
      return localStorage.getItem("gcwind.guideDismissed") !== "true";
    } catch {
      return true;
    }
  });

  const handleToggleGuide = () => {
    setIsGuideOpen((prev) => {
      const next = !prev;
      trackGuideToggle(next);
      try {
        if (!next) {
          localStorage.setItem("gcwind.guideDismissed", "true");
        } else {
          localStorage.removeItem("gcwind.guideDismissed");
        }
      } catch {}
      return next;
    });
  };

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    try {
      localStorage.setItem("gcwind.guideDismissed", "true");
    } catch {}
  };

  const activeBagName = settings?.title?.trim() || "";

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mediaQuery.addEventListener?.("change", handler);
    return () => mediaQuery.removeEventListener?.("change", handler);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleToggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    trackThemeChange(nextTheme);
  };

  return (
    <Box as="header" className="app-header" mb={isWidgetMode ? "4px" : "16px"}>
      <Box className="app-header-bar" position="relative" w="100%">
        <Flex justify="space-between" align="center" flexWrap="nowrap" gap={{ base: "6px", sm: "10px" }} w="100%">
        <Flex
          align="center"
          gap={{ base: "6px", sm: "10px" }}
          minW="0"
          flex="1"
          cursor="pointer"
          onClick={() => {
            if (navigate) navigate("/");
            setIsMobileMenuOpen(false);
          }}
        >
          <img
            src="/pwa-192x192.png"
            alt="The Caddie's Compass"
            style={{
              width: isWidgetMode ? "20px" : "28px",
              height: isWidgetMode ? "20px" : "28px",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <Box minW="0">
            <Heading
              as="h1"
              fontSize={
                isWidgetMode
                  ? "0.92rem"
                  : { base: "1.05rem", sm: "1.35rem", md: "1.65rem" }
              }
              fontFamily="'Playfair Display', serif"
              fontWeight="700"
              letterSpacing="-0.01em"
              m="0"
              lineHeight="1.1"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              The Caddie&apos;s Compass
            </Heading>
            {!isWidgetMode && (
              <Text
                fontSize="0.72rem"
                color="var(--text-muted)"
                m="2px 0 0"
                display={{ base: "none", sm: "block" }}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                Golf Clash Ring System &amp; Wind Calculator
              </Text>
            )}
          </Box>
        </Flex>

        {/* Desktop Navigation Bar (Full Labels + Icons) */}
        <Flex
          gap="6px"
          align="center"
          className="desktop-header-nav no-print"
          display={{ base: "none", md: "flex" }}
          flexShrink={0}
        >
          {!isWidgetMode && (
            <>
              <button
                type="button"
                className={`btn-ghost header-btn ${isGuideOpen ? "is-active" : ""}`}
                onClick={handleToggleGuide}
                title={isGuideOpen ? "Hide Ring Guide" : "How the Ring System Works"}
                aria-label="How it works"
              >
                <Info size={14} />
                <span className="header-btn-text">Guide</span>
              </button>

              <button
                type="button"
                className={`btn-ghost header-btn ${isReferenceOpen ? "is-active" : ""}`}
                onClick={() => {
                  const next = !isReferenceOpen;
                  setIsReferenceOpen(next);
                  trackReferenceToggle(next);
                }}
                title={isReferenceOpen ? "Hide Graph" : "Interactive Reference Graph"}
                aria-label={isReferenceOpen ? "Hide Graph" : "Graph"}
              >
                <TrendingUp size={14} />
                <span className="header-btn-text">
                  {isReferenceOpen ? "Hide Graph" : "Graph"}
                </span>
              </button>

              <button
                type="button"
                className={`btn-ghost header-btn ${isBagEditingOpen ? "is-active" : ""}`}
                onClick={() => {
                  if (!isBagEditingOpen && bag.length === 0) {
                    trackBagStarted({ source: "header_edit_bag" });
                  }
                  setIsBagEditingOpen(!isBagEditingOpen);
                }}
                title={isBagEditingOpen ? "Close Bag Editor" : "Edit Bag Clubs & Levels"}
                aria-label={isBagEditingOpen ? "Close Bag Editor" : "Edit Bag"}
              >
                <Briefcase size={14} />
                <span className="header-btn-text">
                  {isBagEditingOpen ? "Close" : `Edit Bag (${bag.length})`}
                </span>
              </button>

              <button
                type="button"
                className={`btn-ghost header-btn ${isUniversalOpen ? "is-active" : ""}`}
                onClick={() => setIsUniversalOpen(!isUniversalOpen)}
                title={isUniversalOpen ? "Close Universal Chart" : "Universal Chart (Golden Shot & Checkpoints)"}
                aria-label={isUniversalOpen ? "Close Universal Chart" : "Universal Chart"}
              >
                <Trophy size={14} style={{ color: "#eab308" }} />
                <span className="header-btn-text">Universal</span>
              </button>

              <button
                type="button"
                className="btn-ghost header-btn"
                onClick={() => navigate?.("/tips")}
                title="Vetted Pro Tips & Game Mechanics"
                aria-label="Vetted Pro Tips"
              >
                <Lightbulb size={14} style={{ color: "#3b82f6" }} />
                <span className="header-btn-text">Tips</span>
              </button>

              <button
                type="button"
                className="btn-ghost header-btn"
                onClick={() => navigate?.("/resources")}
                title="Curated Golf Clash Community Resources"
                aria-label="Community Resources"
              >
                <BookOpen size={14} style={{ color: "#10b981" }} />
                <span className="header-btn-text">Resources</span>
              </button>
            </>
          )}

          <button
            type="button"
            className={`btn-ghost header-btn ${isWidgetMode ? "is-active" : ""}`}
            onClick={() => {
              const next = !isWidgetMode;
              setIsWidgetMode(next);
              if (next) {
                trackWidgetOpened({ bagSize: bag.length, source: "header" });
              }
              trackViewModeChange(next ? "widget" : "standard");
            }}
            title={isWidgetMode ? "Exit Live Play" : "Switch to Live Play Mode (in-game HUD)"}
            aria-label={isWidgetMode ? "Exit Live Play" : "Live Play Mode"}
            style={
              isWidgetMode
                ? {
                    padding: "4px 10px",
                    borderRadius: "16px",
                    height: "28px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-strong)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }
                : undefined
            }
          >
            {isWidgetMode ? (
              <>
                <X size={14} style={{ color: "#ef4444" }} />
                <span>Exit Live Play</span>
              </>
            ) : (
              <>
                <Gamepad2 size={14} style={{ color: "#10b981" }} />
                <span className="header-btn-text">Live Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-ghost header-btn"
            onClick={handleToggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={
              isWidgetMode
                ? {
                    padding: "4px",
                    width: "28px",
                    height: "28px",
                    minWidth: "28px",
                    borderRadius: "6px",
                    justifyContent: "center",
                  }
                : undefined
            }
          >
            {isDark ? (
              <Sun size={14} style={{ color: "#eab308" }} />
            ) : (
              <Moon size={14} style={{ color: "#818cf8" }} />
            )}
            {!isWidgetMode && (
              <span className="header-btn-text">{isDark ? "Light" : "Dark"}</span>
            )}
          </button>
        </Flex>

        {/* Mobile Navigation Header (Quick Play + Hamburger on Top-Right) */}
        <Flex
          gap="6px"
          align="center"
          className="mobile-header-nav no-print"
          display={{ base: "flex", md: "none" }}
          flexShrink={0}
        >
          {/* Quick Play/Exit toggle */}
          {isWidgetMode ? (
            <button
              type="button"
              className="btn-ghost header-btn"
              onClick={() => {
                setIsWidgetMode(false);
                trackViewModeChange("standard");
              }}
              title="Exit Live Play"
              aria-label="Exit Live Play"
              style={{
                padding: "4px 10px",
                height: "32px",
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <X size={14} style={{ color: "#ef4444" }} />
              <span>Exit</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost header-btn"
              onClick={() => {
                setIsWidgetMode(true);
                trackWidgetOpened({ bagSize: bag.length, source: "header" });
                trackViewModeChange("widget");
              }}
              title="Switch to Live Play Mode"
              aria-label="Live Play Mode"
              style={{
                padding: "4px 10px",
                height: "32px",
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Gamepad2 size={14} style={{ color: "#10b981" }} />
              <span>Play</span>
            </button>
          )}

          {/* Hamburger Menu Toggle Icon (Top-Right, Default Theme Scheme) */}
          {!isWidgetMode && (
            <button
              type="button"
              className={`mobile-nav-toggle-btn ${isMobileMenuOpen ? "is-active" : ""}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </Flex>
      </Flex>

      {/* Mobile Responsive Navigation (Full-width, Partial-height, Fade-in) */}
      {!isWidgetMode && isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay (closes on tap outside) */}
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.45)"
            zIndex="1090"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-backdrop no-print"
          />

          {/* Full-Width Partial-Height Nav Dropdown */}
          <Box
            as="nav"
            className="mobile-nav-dropdown no-print"
            position="absolute"
            top="calc(100% + 4px)"
            left="0"
            right="0"
            w="100%"
            bg="var(--surface-1)"
            border="1px solid var(--border-strong)"
            borderRadius="var(--radius-md)"
            boxShadow="var(--shadow-2)"
            zIndex="1100"
            overflow="hidden"
            maxH="calc(100vh - 80px)"
            overflowY="auto"
          >
            <Flex direction="column" py="4px">
              {/* 1. Live Play Mode */}
              <button
                type="button"
                className={`mobile-nav-menu-item ${isWidgetMode ? "is-active" : ""}`}
                onClick={() => {
                  setIsWidgetMode(true);
                  setIsMobileMenuOpen(false);
                  trackWidgetOpened({ bagSize: bag.length, source: "header" });
                  trackViewModeChange("widget");
                }}
              >
                <span className="mobile-nav-item-left">
                  <Gamepad2 size={18} style={{ color: "#10b981" }} />
                  <span>Live Play Mode</span>
                </span>
                <span className="mobile-nav-item-badge">HUD</span>
              </button>

              {/* 2. Edit Bag */}
              <button
                type="button"
                className={`mobile-nav-menu-item ${isBagEditingOpen ? "is-active" : ""}`}
                onClick={() => {
                  if (!isBagEditingOpen && bag.length === 0) {
                    trackBagStarted({ source: "header_edit_bag" });
                  }
                  setIsBagEditingOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-item-left">
                  <Briefcase size={18} style={{ color: "var(--brand-primary, #3b82f6)" }} />
                  <span>Edit Bag &amp; Clubs</span>
                </span>
                <span className="mobile-nav-item-badge">{bag.length} clubs</span>
              </button>

              {/* 3. Universal Reference Chart */}
              <button
                type="button"
                className={`mobile-nav-menu-item ${isUniversalOpen ? "is-active" : ""}`}
                onClick={() => {
                  setIsUniversalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-item-left">
                  <Trophy size={18} style={{ color: "#eab308" }} />
                  <span>Universal Reference Chart</span>
                </span>
              </button>

              {/* 4. Trajectory & Wind Graph */}
              <button
                type="button"
                className={`mobile-nav-menu-item ${isReferenceOpen ? "is-active" : ""}`}
                onClick={() => {
                  const next = !isReferenceOpen;
                  setIsReferenceOpen(next);
                  trackReferenceToggle(next);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-item-left">
                  <TrendingUp size={18} style={{ color: "#8b5cf6" }} />
                  <span>{isReferenceOpen ? "Hide Reference Graph" : "Reference Graph"}</span>
                </span>
              </button>

              <div className="mobile-nav-divider" />

              {/* 5. Vetted Pro Tips */}
              <button
                type="button"
                className="mobile-nav-menu-item"
                onClick={() => {
                  navigate?.("/tips");
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-item-left">
                  <Lightbulb size={18} style={{ color: "#3b82f6" }} />
                  <span>Vetted Pro Tips</span>
                </span>
              </button>

              {/* 6. Community Resources */}
              <button
                type="button"
                className="mobile-nav-menu-item"
                onClick={() => {
                  navigate?.("/resources");
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-item-left">
                  <BookOpen size={18} style={{ color: "#10b981" }} />
                  <span>Community Resources</span>
                </span>
              </button>

              {/* 7. How Rings Work Guide */}
              <button
                type="button"
                className={`mobile-nav-menu-item ${isGuideOpen ? "is-active" : ""}`}
                onClick={() => {
                  handleToggleGuide();
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-item-left">
                  <Info size={18} style={{ color: "var(--text-secondary)" }} />
                  <span>How Rings Work Guide</span>
                </span>
              </button>

              <div className="mobile-nav-divider" />

              {/* 8. Theme Toggle */}
              <button
                type="button"
                className="mobile-nav-menu-item"
                onClick={() => {
                  handleToggleTheme();
                }}
              >
                <span className="mobile-nav-item-left">
                  {isDark ? (
                    <Sun size={18} style={{ color: "#eab308" }} />
                  ) : (
                    <Moon size={18} style={{ color: "#818cf8" }} />
                  )}
                  <span>Theme: {isDark ? "Light Mode" : "Dark Mode"}</span>
                </span>
                <span className="mobile-nav-item-badge">{isDark ? "Dark" : "Light"}</span>
              </button>
            </Flex>
          </Box>
        </>
      )}
      </Box>

      {/* Collapsible 3-Step Guide */}
      {!isWidgetMode && isGuideOpen && (
        <Box
          mt="12px"
          p="14px 16px"
          bg="var(--surface-1)"
          border="1px solid var(--border-strong)"
          borderRadius="var(--radius-md)"
          boxShadow="var(--shadow-sm)"
          className="no-print"
          position="relative"
          zIndex="1"
        >
          <Flex justify="space-between" align="center" mb="10px">
            <Flex align="center" gap="6px">
              <Info size={16} color="var(--series-1, #3b82f6)" />
              <Heading as="h3" fontSize="0.88rem" m="0" color="var(--text-primary)" fontWeight="700">
                How the Ring System Works
              </Heading>
            </Flex>
            <button
              type="button"
              onClick={handleCloseGuide}
              className="icon-btn"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Close guide"
            >
              <X size={16} />
            </button>
          </Flex>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="10px">
            <Box bg="var(--surface-2)" p="8px 12px" borderRadius="var(--radius-sm)">
              <Text fontWeight="700" fontSize="0.8rem" color="var(--text-primary)" mb="2px">
                1. Pick Clubs &amp; Levels
              </Text>
              <Text fontSize="0.74rem" color="var(--text-secondary)" m="0" lineHeight="1.3">
                Click <strong>Edit Bag</strong> to choose clubs and set their levels to match your in-game bag.
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="8px 12px" borderRadius="var(--radius-sm)">
              <Text fontWeight="700" fontSize="0.8rem" color="var(--text-primary)" mb="2px">
                2. Live Shot Calculator
              </Text>
              <Text fontSize="0.74rem" color="var(--text-secondary)" m="0" lineHeight="1.3">
                Drag the compass arrow to set wind speed &amp; direction. Adjust distance/elevation for live ring adjustments.
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="8px 12px" borderRadius="var(--radius-sm)">
              <Text fontWeight="700" fontSize="0.8rem" color="var(--text-primary)" mb="2px">
                3. Wind Reference Charts
              </Text>
              <Text fontSize="0.74rem" color="var(--text-secondary)" m="0" lineHeight="1.3">
                Read exact ring adjustments for Max, Mid, and Min distance from the printable cards below.
              </Text>
            </Box>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
