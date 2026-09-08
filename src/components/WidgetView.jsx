import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChartOutput from "./ChartOutput";
import ReferenceGraph from "./ReferenceGraph";
import ShotCalculator from "./ShotCalculator";

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
}) {
  const scrollRef = useRef(null);
  const tabStripRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

    // Always include the Reference Graph tab
    list.push({
      id: "quick-ref",
      type: "reference",
      label: "Graph",
      title: "Interactive Reference Graph",
    });

    return list;
  }, [savedProfiles, bag, settings]);

  // Track scroll position to update the active dot/tab
  const handleScroll = useCallback(() => {
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
    el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
    setActiveIndex(index);
  };

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

  return (
    <Box className="widget-view">
      {/* Top Tab Bar Navigation */}
      <Flex className="widget-tabs" align="center" justify="space-between">
        <button
          type="button"
          className="widget-tab-arrow"
          onClick={() => scrollToPage(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="widget-tabs-scroll" ref={tabStripRef}>
          {pages.map((page, i) => (
            <button
              key={page.id}
              type="button"
              className={`widget-tab ${activeIndex === i ? "is-active" : ""}`}
              onClick={() => scrollToPage(i)}
            >
              {page.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="widget-tab-arrow"
          onClick={() => scrollToPage(Math.min(pages.length - 1, activeIndex + 1))}
          disabled={activeIndex === pages.length - 1}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
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
                    Swipe right to view a saved bag and tap &quot;Load in Simulator&quot;, or exit widget mode to add clubs.
                  </Text>
                </Box>
              )
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
                  p="6px 10px"
                  borderRadius="var(--radius-sm)"
                  border="1px solid var(--border)"
                  mb="4px"
                >
                  <Box>
                    <Text
                      fontWeight="bold"
                      fontSize="0.85rem"
                      color="var(--text-primary)"
                      lineHeight="1.2"
                      m="0"
                    >
                      {page.title}
                    </Text>
                    <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                      {page.settings?.ballName || "Basic"} Ball ·{" "}
                      {page.settings?.variant === "ring"
                        ? "Wind per Ring"
                        : "Rings per Wind"}
                      {Number(page.settings?.elevation) !== 0
                        ? ` · ${Number(page.settings.elevation) > 0 ? "+" : ""}${page.settings.elevation}% Elev`
                        : ""}
                    </Text>
                  </Box>
                  <Flex gap="6px" align="center">
                    {isSameBag(page.bag, bag) ? (
                      <Box
                        fontSize="0.68rem"
                        fontWeight="bold"
                        bg="var(--brand-primary)"
                        color="white"
                        px="8px"
                        py="3px"
                        borderRadius="10px"
                      >
                        In Simulator
                      </Box>
                    ) : (
                      <button
                        type="button"
                        className="widget-bag-load-btn"
                        onClick={() => handleLoadBag(page)}
                        title="Load this bag into the Simulator"
                      >
                        Load in Simulator
                      </button>
                    )}
                  </Flex>
                </Flex>

                {page.settings?.notes?.trim() && (
                  <Box
                    bg="var(--surface-1)"
                    p="6px 10px"
                    borderRadius="var(--radius-sm)"
                    border="1px solid var(--border)"
                    mb="4px"
                    fontSize="0.75rem"
                    color="var(--text-secondary)"
                    whiteSpace="pre-wrap"
                  >
                    {page.settings.notes.trim()}
                  </Box>
                )}

                <ChartOutput
                  bag={page.bag}
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
        gap="8px"
        mt="10px"
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
