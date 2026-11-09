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

  const handleToggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    trackThemeChange(nextTheme);
  };

  return (
    <Box as="header" className="app-header" mb={isWidgetMode ? "4px" : "16px"}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="10px">
        <Flex align="center" gap="10px">
          <img
            src="/pwa-192x192.png"
            alt="The Caddie's Compass"
            style={{
              width: isWidgetMode ? "20px" : "32px",
              height: isWidgetMode ? "20px" : "32px",
              borderRadius: "50%",
            }}
          />
          <Box>
            <Heading
              as="h1"
              fontSize={isWidgetMode ? "0.95rem" : "1.65rem"}
              fontFamily="'Playfair Display', serif"
              fontWeight="700"
              letterSpacing="-0.01em"
              m="0"
              lineHeight="1.1"
            >
              The Caddie&apos;s Compass
            </Heading>
            {!isWidgetMode && (
              <Text fontSize="0.75rem" color="var(--text-muted)" m="2px 0 0">
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

        {/* Mobile Navigation Bar (Clean, Identifiable Buttons + Menu Drawer) */}
        <Flex
          gap="5px"
          align="center"
          className="mobile-header-nav no-print"
          display={{ base: "flex", md: "none" }}
        >
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
            title={isWidgetMode ? "Exit Live Play" : "Live Play Mode"}
            aria-label={isWidgetMode ? "Exit Live Play" : "Live Play Mode"}
            style={{
              padding: "4px 8px",
              height: "30px",
              fontSize: "0.74rem",
              fontWeight: 700,
              gap: "4px",
            }}
          >
            {isWidgetMode ? (
              <>
                <X size={14} style={{ color: "#ef4444" }} />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Gamepad2 size={14} style={{ color: "#10b981" }} />
                <span>Play</span>
              </>
            )}
          </button>

          {!isWidgetMode && (
            <button
              type="button"
              className={`btn-ghost header-btn ${isBagEditingOpen ? "is-active" : ""}`}
              onClick={() => {
                if (!isBagEditingOpen && bag.length === 0) {
                  trackBagStarted({ source: "header_edit_bag" });
                }
                setIsBagEditingOpen(!isBagEditingOpen);
              }}
              title="Edit Bag Clubs & Levels"
              aria-label="Edit Bag"
              style={{
                padding: "4px 8px",
                height: "30px",
                fontSize: "0.74rem",
                fontWeight: 700,
                gap: "4px",
              }}
            >
              <Briefcase size={14} style={{ color: "var(--brand-primary, #3b82f6)" }} />
              <span>Bag ({bag.length})</span>
            </button>
          )}

          <button
            type="button"
            className="btn-ghost header-btn"
            onClick={handleToggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              padding: "4px",
              width: "30px",
              height: "30px",
              minWidth: "30px",
              justifyContent: "center",
            }}
          >
            {isDark ? (
              <Sun size={14} style={{ color: "#eab308" }} />
            ) : (
              <Moon size={14} style={{ color: "#818cf8" }} />
            )}
          </button>

          {!isWidgetMode && (
            <button
              type="button"
              className={`btn-ghost header-btn ${isMobileMenuOpen ? "is-active" : ""}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Navigation Menu"
              aria-label="Navigation Menu"
              style={{
                padding: "4px 8px",
                height: "30px",
                fontSize: "0.74rem",
                fontWeight: 700,
                gap: "4px",
              }}
            >
              {isMobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
              <span>Menu</span>
            </button>
          )}
        </Flex>
      </Flex>

      {/* Mobile Navigation Sheet Drawer */}
      {!isWidgetMode && isMobileMenuOpen && (
        <Box
          className="mobile-nav-drawer no-print"
          position="fixed"
          top="50px"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.65)"
          backdropFilter="blur(6px)"
          zIndex="1200"
          p="12px"
          onClick={(e) => {
            if (e.target.classList.contains("mobile-nav-drawer")) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          <Box
            bg="var(--surface-1)"
            border="1px solid var(--border-strong)"
            borderRadius="var(--radius-lg)"
            p="14px"
            maxH="calc(100vh - 75px)"
            overflowY="auto"
            boxShadow="var(--shadow-3)"
            className="mobile-nav-card"
          >
            <Flex justify="space-between" align="center" mb="12px" pb="8px" borderBottom="1px solid var(--border)">
              <Text fontSize="0.85rem" fontWeight="800" color="var(--text-primary)" m="0">
                🧭 Compass Tools &amp; Navigation
              </Text>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </Flex>

            <Flex direction="column" gap="8px">
              {/* 1. Live Play Mode */}
              <button
                type="button"
                className={`mobile-nav-item ${isWidgetMode ? "is-active" : ""}`}
                onClick={() => {
                  setIsWidgetMode(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(16, 185, 129, 0.15)" color="#10b981">
                  <Gamepad2 size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    Live Play Mode
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    Swipeable in-match companion HUD for active gameplay
                  </Text>
                </Box>
              </button>

              {/* 2. Edit Bag */}
              <button
                type="button"
                className={`mobile-nav-item ${isBagEditingOpen ? "is-active" : ""}`}
                onClick={() => {
                  if (!isBagEditingOpen && bag.length === 0) {
                    trackBagStarted({ source: "header_edit_bag" });
                  }
                  setIsBagEditingOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(59, 130, 246, 0.15)" color="#3b82f6">
                  <Briefcase size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    Edit Bag &amp; Clubs
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    Customize your 7 clubs, card levels, ball &amp; elevation
                  </Text>
                </Box>
                <Box className="mobile-nav-badge" bg="var(--surface-2)" color="var(--text-secondary)">
                  {bag.length} clubs
                </Box>
              </button>

              {/* 3. Universal Chart */}
              <button
                type="button"
                className={`mobile-nav-item ${isUniversalOpen ? "is-active" : ""}`}
                onClick={() => {
                  setIsUniversalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(234, 179, 8, 0.15)" color="#eab308">
                  <Trophy size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    Universal Reference Chart
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    Golden Shot guides, Checkpoint Challenge &amp; ring table
                  </Text>
                </Box>
              </button>

              {/* 4. Trajectory Graph */}
              <button
                type="button"
                className={`mobile-nav-item ${isReferenceOpen ? "is-active" : ""}`}
                onClick={() => {
                  setIsReferenceOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(139, 92, 246, 0.15)" color="#8b5cf6">
                  <TrendingUp size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    Trajectory &amp; Wind Graph
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    Interactive carry distance &amp; ring adjustment curves
                  </Text>
                </Box>
              </button>

              {/* 5. Vetted Pro Tips */}
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => {
                  navigate?.("/tips");
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(59, 130, 246, 0.15)" color="#3b82f6">
                  <Lightbulb size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    Vetted Pro Tips
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    Elevation rules, ring pullback &amp; landing mechanics
                  </Text>
                </Box>
              </button>

              {/* 6. Community Resources */}
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => {
                  navigate?.("/resources");
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(16, 185, 129, 0.15)" color="#10b981">
                  <BookOpen size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    Community Resources
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    Curated video guides, forums &amp; tournament sheets
                  </Text>
                </Box>
              </button>

              {/* 7. How Rings Work Guide */}
              <button
                type="button"
                className={`mobile-nav-item ${isGuideOpen ? "is-active" : ""}`}
                onClick={() => {
                  handleToggleGuide();
                  setIsMobileMenuOpen(false);
                }}
              >
                <Box className="mobile-nav-icon-box" bg="rgba(107, 114, 128, 0.15)" color="var(--text-secondary)">
                  <Info size={20} />
                </Box>
                <Box textAlign="left" flex="1">
                  <Text fontWeight="700" fontSize="0.85rem" color="var(--text-primary)" m="0">
                    How Rings Work Guide
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    3-step beginner tutorial on Golf Clash ring adjustments
                  </Text>
                </Box>
              </button>
            </Flex>
          </Box>
        </Box>
      )}

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
