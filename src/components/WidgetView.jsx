import { Box, Flex, Text } from "@chakra-ui/react";
import {
  ArrowUpDown,
  Briefcase,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChartOutput from "./ChartOutput";
import ReferenceGraph from "./ReferenceGraph";
import ShotCalculator from "./ShotCalculator";
import QuickChart from "./QuickChart";
import { sortBagClubs } from "../utils";

function isSameBag(bagA, bagB) {
  if (!bagA || !bagB) return false;
  if (bagA.length === 0 && bagB.length === 0) return true;
  if (bagA.length !== bagB.length) return false;
  return bagA.every(
    (b, i) => b.clubId === bagB[i]?.clubId && b.level === bagB[i]?.level,
  );
}

export default function WidgetView({
  bag = [],
  setBag,
  clubs,
  settings,
  setSettings,
  savedProfiles = {},
  setSavedProfiles,
  navigate,
  onExitWidget,
}) {
  const scrollRef = useRef(null);
  const tabStripRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") || (window.location.hash.match(/tab=([a-z]+)/) || [])[1];
    if (tab === "quick") return 1;
    if (tab === "bag" || tab === "charts") return 2;
    if (tab === "graph") return 3;
    return 0;
  });

  const pages = useMemo(() => {
    const list = [
      {
        id: "simulator",
        type: "simulator",
        label: "Simulator",
        title: "Shot Calculator",
      },
    ];

    const savedEntries = Object.entries(savedProfiles || {});

    if (savedEntries.length > 0) {
      // Check if current active bag matches any saved profile
      const currentMatchesSaved = savedEntries.some(([name, profile]) => {
        if (name === settings.title) return true;
        return isSameBag(profile.bag, bag);
      });

      // If active bag has clubs and is distinct from all saved profiles, include it as Active Bag
      if (bag && bag.length > 0 && !currentMatchesSaved) {
        list.push({
          id: "active-bag",
          type: "bag",
          label: settings.title?.trim() || "Active Bag",
          title: settings.title?.trim() || "Active Bag (Unsaved)",
          bag: bag,
          settings: settings,
          isActive: true,
        });
      }

      // Add all saved bag profiles
      savedEntries.forEach(([name, profile]) => {
        list.push({
          id: `profile-${name}`,
          type: "bag",
          label: name,
          title: name,
          bag: profile.bag || [],
          settings: {
            ...settings,
            ...(profile.settings || {}),
            title: name,
          },
          isSaved: true,
        });
      });
    } else {
      // No saved profiles exist yet: show active bag if it has clubs
      if (bag && bag.length > 0) {
        list.push({
          id: "current-bag",
          type: "bag",
          label: settings.title?.trim() || "My Bag",
          title: settings.title?.trim() || "My Bag",
          bag: bag,
          settings: settings,
          isActive: true,
        });
      }
    }

    if (list.length === 1 && (!bag || bag.length === 0)) {
      list.push({
        id: "no-bags",
        type: "bag",
        label: "Wind Chart",
        title: "No Saved Bags",
        bag: [],
        settings: settings,
      });
    }

    // Always include the Universal quick chart tab (generic, no setup)
    list.push({
      id: "universal-chart",
      type: "universal",
      label: "Universal",
      title: "Universal Quick Chart",
    });

    // Always include the Reference Graph tab
    list.push({
      id: "quick-ref",
      type: "reference",
      label: "Graph",
      title: "Interactive Reference Graph",
    });

    return list;
  }, [savedProfiles, bag, settings]);

  const isProgrammaticScroll = useRef(false);

  // Track scroll position to update the active dot/tab
  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const pageWidth = el.offsetWidth;
    if (pageWidth === 0) return;
    const index = Math.round(scrollLeft / pageWidth);
    if (index >= 0 && index < pages.length) {
      setActiveIndex(index);
    }
  }, [pages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToPage = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.offsetWidth || el.clientWidth || window.innerWidth;
    isProgrammaticScroll.current = true;
    setActiveIndex(index);
    el.scrollLeft = index * width;
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 150);
  };

  // Sync horizontal scroll container with activeIndex
  useEffect(() => {
    const el = scrollRef.current;
    if (activeIndex >= 0 && el) {
      const width = el.offsetWidth || el.clientWidth || window.innerWidth;
      el.scrollLeft = activeIndex * width;
    }
  }, [activeIndex]);

  // Keep active tab in view inside horizontal tab strip
  useEffect(() => {
    const strip = tabStripRef.current;
    if (!strip) return;
    const activeTab = strip.children[activeIndex];
    if (activeTab && typeof activeTab.scrollIntoView === "function") {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  const handleLoadBag = (page) => {
    if (setBag) setBag(page.bag);
    if (setSettings) setSettings(page.settings);
    scrollToPage(0);
  };

  const handleReorderBagClubs = (page, fromIndex, toIndex) => {
    const currentBag = page.bag || bag;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= currentBag.length) return;
    const newBag = [...currentBag];
    const [moved] = newBag.splice(fromIndex, 1);
    newBag.splice(toIndex, 0, moved);

    if (page.isActive || isSameBag(page.bag, bag)) {
      if (setBag) setBag(newBag);
    }

    if (page.isSaved && setSavedProfiles) {
      setSavedProfiles((prev) => ({
        ...prev,
        [page.label]: {
          ...prev[page.label],
          bag: newBag,
        },
      }));
    }
  };

  const handleSortBag = (page) => {
    const currentBag = page.bag || bag;
    const sorted = sortBagClubs(currentBag, clubs);

    if (page.isActive || isSameBag(page.bag, bag)) {
      if (setBag) setBag(sorted);
    }

    if (page.isSaved && setSavedProfiles) {
      setSavedProfiles((prev) => ({
        ...prev,
        [page.label]: {
          ...prev[page.label],
          bag: sorted,
        },
      }));
    }
  };

  return (
    <Box className="widget-view">
      {/* Top Tab Bar Navigation */}
      <Flex className="widget-tabs" align="center" justify="space-between" gap="4px">
        <div className="widget-tabs-scroll no-scrollbar" ref={tabStripRef}>
          {pages.map((page, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={page.id}
                type="button"
                className={`widget-tab ${isActive ? "is-active" : ""}`}
                onClick={() => scrollToPage(i)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {page.type === "simulator" && (
                  <Target size={13} style={{ color: isActive ? "#fff" : "#3b82f6" }} />
                )}
                {page.type === "universal" && (
                  <Zap size={13} style={{ color: isActive ? "#fff" : "#eab308" }} />
                )}
                {page.type === "bag" && (
                  <Briefcase size={13} style={{ color: isActive ? "#fff" : "#10b981" }} />
                )}
                {page.type === "reference" && (
                  <TrendingUp size={13} style={{ color: isActive ? "#fff" : "#8b5cf6" }} />
                )}
                <span>{page.label}</span>
              </button>
            );
          })}
        </div>

        {onExitWidget && (
          <button
            type="button"
            className="widget-exit-btn"
            onClick={onExitWidget}
            title="Exit Live Play"
            aria-label="Exit Live Play"
          >
            <X size={13} />
            <span>Exit</span>
          </button>
        )}
      </Flex>

      {/* Swipeable scroll container */}
      <div className="widget-scroll-container" ref={scrollRef}>
        {pages.map((page) => (
          <div className="widget-screen" key={page.id}>
            {page.type === "simulator" ? (
              bag.length > 0 ? (
                <ShotCalculator
                  bag={bag}
                  clubs={clubs}
                  settings={settings}
                  setSettings={setSettings}
                  isWidgetMode={true}
                />
              ) : (
                <Box
                  p="24px 16px"
                  textAlign="center"
                  bg="var(--surface-1)"
                  border="1px dashed var(--border)"
                  borderRadius="var(--radius-md)"
                  color="var(--text-muted)"
                  fontSize="0.85rem"
                  mt="8px"
                >
                  <Text fontWeight="bold" mb="6px" color="var(--text-primary)">
                    No Active Bag Loaded
                  </Text>
                  <Text mb="12px">
                    Swipe right to view a saved bag and tap &quot;Load in Simulator&quot;, or exit Live Play to add clubs.
                  </Text>
                </Box>
              )
            ) : page.type === "universal" ? (
              <Box
                bg="var(--surface-1)"
                border="1px solid var(--border)"
                borderRadius="var(--radius-lg)"
                p="8px"
              >
                <QuickChart isWidgetMode={true} />
              </Box>
            ) : page.type === "reference" ? (
              <ReferenceGraph
                bag={bag}
                clubs={clubs}
                settings={settings}
                savedProfiles={savedProfiles}
                isWidgetMode={true}
              />
            ) : (
              <Box className="widget-bag-screen">
                <Flex
                  className="widget-bag-header"
                  justify="space-between"
                  align="center"
                  bg="var(--surface-2)"
                  p="3px 8px"
                  borderRadius="var(--radius-sm)"
                  border="1px solid var(--border)"
                  mb="2px"
                >
                  <Flex align="center" gap="6px" minW="0" flex="1">
                    <Text
                      fontWeight="bold"
                      fontSize="0.78rem"
                      color="var(--text-primary)"
                      lineHeight="1.2"
                      m="0"
                      isTruncated
                    >
                      {page.title}
                    </Text>
                    <Text fontSize="0.65rem" color="var(--text-muted)" m="0" isTruncated>
                      {page.settings?.ballName || "Basic"} ·{" "}
                      {page.settings?.variant === "ring" ? "WPR" : "RPW"}
                      {Number(page.settings?.elevation) !== 0
                        ? ` · ${Number(page.settings.elevation) > 0 ? "+" : ""}${page.settings.elevation}%`
                        : ""}
                    </Text>
                  </Flex>
                  <Flex gap="4px" align="center" flexShrink={0}>
                    {page.bag?.length > 1 && (
                      <button
                        type="button"
                        className="widget-bag-load-btn"
                        onClick={() => handleSortBag(page)}
                        title="Sort clubs in standard in-game order"
                        style={{
                          background: "var(--surface-1)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-strong)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "2px 6px",
                          fontSize: "0.65rem",
                          height: "22px",
                        }}
                      >
                        <ArrowUpDown size={10} />
                        Game Order
                      </button>
                    )}
                    {isSameBag(page.bag, bag) ? (
                      <Box
                        fontSize="0.65rem"
                        fontWeight="bold"
                        bg="var(--brand-primary)"
                        color="white"
                        px="6px"
                        py="2px"
                        borderRadius="6px"
                      >
                        In Simulator
                      </Box>
                    ) : (
                      <button
                        type="button"
                        className="widget-bag-load-btn"
                        onClick={() => handleLoadBag(page)}
                        title="Load this bag into the Simulator"
                        style={{
                          padding: "2px 6px",
                          fontSize: "0.65rem",
                          height: "22px",
                        }}
                      >
                        Load
                      </button>
                    )}
                  </Flex>
                </Flex>

                {page.settings?.notes?.trim() && (
                  <Box
                    bg="var(--surface-1)"
                    p="4px 8px"
                    borderRadius="var(--radius-sm)"
                    border="1px solid var(--border)"
                    mb="2px"
                    fontSize="0.7rem"
                    color="var(--text-secondary)"
                    whiteSpace="pre-wrap"
                    isTruncated
                  >
                    {page.settings.notes.trim()}
                  </Box>
                )}

                <ChartOutput
                  bag={page.bag || []}
                  clubs={clubs}
                  settings={page.settings}
                  isWidgetMode={true}
                />
              </Box>
            )}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <Flex
        className="widget-dots"
        justify="center"
        align="center"
        gap="6px"
        mt="2px"
      >
        {pages.map((page, i) => (
          <button
            key={page.id}
            type="button"
            className={`widget-dot ${activeIndex === i ? "is-active" : ""}`}
            onClick={() => scrollToPage(i)}
            aria-label={`Go to ${page.label}`}
          />
        ))}
        <Text
          className="widget-swipe-hint"
          fontSize="0.65rem"
          color="var(--text-muted)"
          ml="4px"
        >
          Swipe to switch
        </Text>
      </Flex>
    </Box>
  );
}
