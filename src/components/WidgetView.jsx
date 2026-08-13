import { Box, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChartOutput from "./ChartOutput";
import ShotCalculator from "./ShotCalculator";

const PAGES = [
  { id: "calculator", label: "Shot Calculator" },
  { id: "chart", label: "Wind Chart" },
];

export default function WidgetView({ bag, clubs, settings, setSettings }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track scroll position to update the active dot/tab
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const pageWidth = el.offsetWidth;
    const index = Math.round(scrollLeft / pageWidth);
    setActiveIndex(index);
  }, []);

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
  };

  return (
    <Box className="widget-view">
      {/* Swipeable scroll container */}
      <div className="widget-scroll-container" ref={scrollRef}>
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

      {/* Dot indicators */}
      <Flex className="widget-dots" justify="center" align="center" gap="8px" mt="10px">
        {PAGES.map((page, i) => (
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
