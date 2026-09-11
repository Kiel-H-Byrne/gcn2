import { Box, Flex, Heading, Text, Grid } from "@chakra-ui/react";
import { Briefcase, Info, Maximize, TrendingUp, X } from "lucide-react";
import React, { useState } from "react";
import {
  trackGuideToggle,
  trackReferenceToggle,
  trackViewModeChange,
  trackThemeChange,
} from "../lib/analytics";

export default function Header({
  isWidgetMode,
  setIsWidgetMode,
  isBagEditingOpen,
  setIsBagEditingOpen,
  isReferenceOpen,
  setIsReferenceOpen,
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

        <Flex gap="6px" align="center" className="no-print">
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
                onClick={() => setIsBagEditingOpen(!isBagEditingOpen)}
                title={isBagEditingOpen ? "Close Bag Editor" : "Edit Bag Clubs & Levels"}
                aria-label={isBagEditingOpen ? "Close Bag Editor" : "Edit Bag"}
              >
                <Briefcase size={14} />
                <span className="header-btn-text">
                  {isBagEditingOpen ? "Close" : `Edit Bag (${bag.length})`}
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            className={`btn-ghost header-btn ${isWidgetMode ? "is-active" : ""}`}
            onClick={() => {
              const next = !isWidgetMode;
              setIsWidgetMode(next);
              trackViewModeChange(next ? "widget" : "standard");
            }}
            title={isWidgetMode ? "Exit Widget Mode" : "Toggle Widget Mode (compact view)"}
            aria-label={isWidgetMode ? "Exit Widget Mode" : "Widget Mode"}
            style={
              isWidgetMode
                ? {
                    padding: "4px",
                    borderRadius: "50%",
                    minWidth: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }
                : undefined
            }
          >
            {isWidgetMode ? (
              <X size={16} />
            ) : (
              <>
                <Maximize size={14} />
                <span className="header-btn-text">Widget</span>
              </>
            )}
          </button>

          {!isWidgetMode && (
            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                trackThemeChange(e.target.value);
              }}
              className="header-select"
              title="Theme Selection"
              aria-label="Theme Selection"
            >
              <option value="system">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          )}
        </Flex>
      </Flex>

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
