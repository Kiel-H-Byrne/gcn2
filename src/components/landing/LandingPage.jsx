import React, { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Grid, Button, Badge } from "@chakra-ui/react";
import {
  ArrowLeft,
  Briefcase,
  Compass,
  FileText,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Printer,
  Sparkles,
  TrendingUp,
  Wind,
} from "lucide-react";
import balls from "../../data/balls";
import seedClubs from "../../data/clubs";
import { WIND_MODES, windPerRingByPower } from "../../lib/wind";
import { accentVar, CATEGORY_ORDER } from "../../utils";
import CategoryIcon from "../CategoryIcon";
import { ClubChartCard } from "../ChartOutput";
import ShotCalculator from "../ShotCalculator";
import Footer from "../Footer";
import { LANDING_PAGES, ALL_LANDING_PATHS } from "../../data/landingPages";

export default function LandingPage({
  config,
  navigate,
  bag,
  setBag,
  clubs = seedClubs,
  settings,
  setSettings,
}) {
  const currentClub = config.clubName
    ? clubs.find((c) => c.name === config.clubName) || clubs[0]
    : null;

  // Read level from URL query params (e.g. ?level=8) or use default
  const [selectedLevel, setSelectedLevel] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const lvl = parseInt(params.get("level"), 10);
      if (lvl && currentClub && lvl >= 1 && lvl <= currentClub.maxLevel) {
        return lvl;
      }
    }
    return config.defaultLevel || 1;
  });

  // Local settings for the landing page interactive experience
  const [localSettings, setLocalSettings] = useState({
    title: config.heading,
    variant: "ring",
    ballName: "Basic",
    elevation: config.type === "elevation" ? 10 : 0,
    windStep: 0.5,
  });

  const selectedBall =
    balls.find((b) => b.name === localSettings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];

  // If this is a club landing page, build a single-club bag for the live calculator
  const landingBag = currentClub
    ? [{ clubId: currentClub.id, level: selectedLevel }]
    : [
        // Standard high-level tournament bag for calculator page
        { clubId: "5558e5e6-1c29-4a4f-9521-5055c78fa002", level: 8 }, // Apoc 8
        { clubId: "7caab84b-c86b-4bc6-8089-df90b67b2002", level: 10 }, // Sniper 10
        { clubId: "b322d40d-5af5-425c-bc66-d421e2578ace", level: 9 }, // Grizzly 9
        { clubId: "a52c3884-252f-4c5c-9c3f-76495df02a24", level: 9 }, // Thorn 9
        { clubId: "f995c72a-d99f-43fb-be7c-c76b92135089", level: 7 }, // Endbringer 7
        { clubId: "d412bfeb-988c-4f7f-afef-4b465a3c2002", level: 9 }, // Nirvana 9
        { clubId: "cae5d4cb-784f-4d9f-a496-e1e35a111a11", level: 7 }, // Spitfire 7
      ];

  const handleLoadClubIntoBag = () => {
    if (!currentClub) {
      navigate("/");
      return;
    }
    const filtered = bag.filter(
      (b) =>
        clubs.find((c) => c.id === b.clubId)?.category !== currentClub.category,
    );
    const newBag = [
      ...filtered,
      { clubId: currentClub.id, level: selectedLevel },
    ];
    setBag(newBag);
    navigate("/");
  };

  // Structured Data Schema for FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  // Structured Data Schema for WebApplication
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${config.heading} | The Caddie's Compass`,
    url: `https://gcn.kielbyrne.com${config.path}`,
    description: config.description,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
  };

  return (
    <Box maxW="1180px" mx="auto" p="16px 16px 48px" className="landing-page">
      {/* Inlined JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      {/* Top Breadcrumb & Navigation Bar */}
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap="10px"
        mb="20px"
        pb="12px"
        borderBottom="1px solid var(--border)"
      >
        <Flex align="center" gap="8px">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/")}
            display="flex"
            alignItems="center"
            gap="6px"
            color="var(--text-secondary)"
            _hover={{ color: "var(--text-primary)" }}
          >
            <ArrowLeft size={16} />
            <span>Full Bag Builder</span>
          </Button>
          <Text color="var(--text-muted)">/</Text>
          <Text fontSize="0.82rem" fontWeight="600" color="var(--text-primary)">
            {config.badge}
          </Text>
        </Flex>

        <Flex gap="8px" align="center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/")}
            display="flex"
            alignItems="center"
            gap="6px"
          >
            <Briefcase size={14} />
            <span>Open Caddie&apos;s Compass</span>
          </Button>
        </Flex>
      </Flex>

      {/* Hero Section */}
      <Box
        bg="var(--surface-1)"
        p={{ base: "20px 16px", md: "28px 24px" }}
        borderRadius="var(--radius-lg)"
        border="1px solid var(--border)"
        boxShadow="var(--shadow-sm)"
        mb="24px"
      >
        <Flex gap="8px" align="center" mb="8px">
          <Badge
            colorScheme="blue"
            bg="var(--brand-primary)"
            color="white"
            px="10px"
            py="3px"
            borderRadius="full"
            fontSize="0.75rem"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.05em"
          >
            {config.badge}
          </Badge>
          {currentClub && (
            <Badge
              variant="outline"
              color="var(--text-secondary)"
              borderColor="var(--border-strong)"
              px="8px"
              py="2px"
              borderRadius="full"
              fontSize="0.75rem"
            >
              Tour {currentClub.tour} {currentClub.type}
            </Badge>
          )}
        </Flex>

        <Heading
          as="h1"
          fontSize={{ base: "1.5rem", md: "2.1rem" }}
          fontFamily="'Playfair Display', serif"
          fontWeight="700"
          color="var(--text-primary)"
          mb="10px"
          lineHeight="1.2"
        >
          {config.heading}
        </Heading>

        <Text
          fontSize="0.95rem"
          color="var(--text-secondary)"
          maxW="880px"
          lineHeight="1.6"
          mb="16px"
        >
          {config.intro}
        </Text>

        {/* Quick Jump Links */}
        <Flex gap="8px" wrap="wrap">
          <a href="#live-calculator" className="landing-jump-link">
            ⚡ Live Calculator
          </a>
          {config.type === "club" && (
            <>
              <a href="#wind-chart" className="landing-jump-link">
                📊 Wind Chart
              </a>
              <a href="#level-stats" className="landing-jump-link">
                📈 All Levels Table
              </a>
            </>
          )}
          <a href="#pro-tips" className="landing-jump-link">
            💡 Pro Tips
          </a>
          <a href="#faq" className="landing-jump-link">
            ❓ FAQs
          </a>
        </Flex>
      </Box>

      {/* Club Landing Page Interactive Controls: Level Selector */}
      {config.type === "club" && currentClub && (
        <Box
          bg="var(--surface-1)"
          p="16px 20px"
          borderRadius="var(--radius-lg)"
          border="1px solid var(--border)"
          mb="24px"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap="10px" mb="12px">
            <Flex align="center" gap="8px">
              <CategoryIcon
                category={currentClub.category}
                size={22}
                style={{ color: accentVar(currentClub.category) }}
              />
              <Heading as="h2" fontSize="1.1rem" m="0" color="var(--text-primary)">
                Select {currentClub.name} Level
              </Heading>
            </Flex>
            <Button
              size="sm"
              colorScheme="blue"
              bg="var(--brand-primary)"
              color="white"
              onClick={handleLoadClubIntoBag}
            >
              + Add {currentClub.name} Lv {selectedLevel} to My Bag
            </Button>
          </Flex>

          {/* Level Buttons */}
          <Flex gap="8px" wrap="wrap" mb="16px">
            {Array.from({ length: currentClub.maxLevel }, (_, i) => i + 1).map((lvl) => {
              const isSelected = lvl === selectedLevel;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    background: isSelected
                      ? accentVar(currentClub.category)
                      : "var(--surface-2)",
                    color: isSelected ? "#fff" : "var(--text-primary)",
                    border: `1px solid ${isSelected ? "transparent" : "var(--border-strong)"}`,
                    transition: "all 0.15s ease",
                  }}
                >
                  Level {lvl}
                </button>
              );
            })}
          </Flex>

          {/* Current Level Stat Pills */}
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }}
            gap="10px"
          >
            <Box bg="var(--surface-2)" p="10px 14px" borderRadius="var(--radius-sm)">
              <Text fontSize="0.72rem" color="var(--text-muted)" textTransform="uppercase">
                Power (Carry)
              </Text>
              <Text fontSize="1.15rem" fontWeight="bold" color="var(--text-primary)">
                {currentClub.power[selectedLevel - 1]} yds
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="10px 14px" borderRadius="var(--radius-sm)">
              <Text fontSize="0.72rem" color="var(--text-muted)" textTransform="uppercase">
                Accuracy
              </Text>
              <Text fontSize="1.15rem" fontWeight="bold" color="var(--text-primary)">
                {currentClub.accuracy[selectedLevel - 1]}
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="10px 14px" borderRadius="var(--radius-sm)">
              <Text fontSize="0.72rem" color="var(--text-muted)" textTransform="uppercase">
                Max Wind/Ring
              </Text>
              <Text fontSize="1.15rem" fontWeight="bold" color="var(--brand-primary)">
                {windPerRingByPower(currentClub, selectedLevel, mode).max.toFixed(2)} mph
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="10px 14px" borderRadius="var(--radius-sm)">
              <Text fontSize="0.72rem" color="var(--text-muted)" textTransform="uppercase">
                Mid Wind/Ring
              </Text>
              <Text fontSize="1.15rem" fontWeight="bold" color="var(--text-primary)">
                {windPerRingByPower(currentClub, selectedLevel, mode).mid.toFixed(2)} mph
              </Text>
            </Box>
          </Grid>
        </Box>
      )}

      {/* 1. Live Shot Calculator Experience */}
      <Box id="live-calculator" mb="32px">
        <Flex justify="space-between" align="center" mb="12px">
          <Flex align="center" gap="8px">
            <Compass size={20} color="var(--series-1, #3b82f6)" />
            <Heading as="h2" fontSize="1.25rem" m="0" color="var(--text-primary)">
              Live Shot Calculator &amp; Vector Compass
            </Heading>
          </Flex>
          <Text fontSize="0.75rem" color="var(--text-muted)">
            Drag compass arrow to set wind speed &amp; angle
          </Text>
        </Flex>

        <ShotCalculator
          bag={landingBag}
          clubs={clubs}
          settings={localSettings}
          setSettings={setLocalSettings}
        />
      </Box>

      {/* 2. Interactive Wind Adjustment Chart (for Club pages) */}
      {config.type === "club" && currentClub && (
        <Box id="wind-chart" mb="32px">
          <Flex justify="space-between" align="center" mb="12px" wrap="wrap" gap="8px">
            <Flex align="center" gap="8px">
              <Wind size={20} color="var(--series-2, #10b981)" />
              <Heading as="h2" fontSize="1.25rem" m="0" color="var(--text-primary)">
                {currentClub.name} Level {selectedLevel} Wind Chart
              </Heading>
            </Flex>
            <Flex gap="6px" align="center">
              <Button
                size="xs"
                variant={localSettings.variant === "ring" ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() =>
                  setLocalSettings({ ...localSettings, variant: "ring" })
                }
              >
                Wind per Ring
              </Button>
              <Button
                size="xs"
                variant={localSettings.variant === "wind" ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() =>
                  setLocalSettings({ ...localSettings, variant: "wind" })
                }
              >
                Rings per Wind
              </Button>
            </Flex>
          </Flex>

          <Box maxW="480px">
            <ClubChartCard
              club={currentClub}
              level={selectedLevel}
              mode={mode}
              settings={localSettings}
              isFullscreen={false}
            />
          </Box>
        </Box>
      )}

      {/* 3. Comprehensive Level Progression Table (All Levels) */}
      {config.type === "club" && currentClub && (
        <Box
          id="level-stats"
          bg="var(--surface-1)"
          p="20px"
          borderRadius="var(--radius-lg)"
          border="1px solid var(--border)"
          mb="32px"
        >
          <Heading as="h2" fontSize="1.2rem" mb="12px" color="var(--text-primary)">
            {currentClub.name} Levels 1 through {currentClub.maxLevel} Wind Adjustment Matrix
          </Heading>
          <Text fontSize="0.82rem" color="var(--text-secondary)" mb="16px">
            Values calculated with standard Power 0 ball at 0% elevation. Click any level to inspect.
          </Text>

          <Box overflowX="auto">
            <table className="wind-table" style={{ width: "100%", textAlign: "center" }}>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Power (yds)</th>
                  <th>Accuracy</th>
                  <th>Max WPR</th>
                  <th>Mid WPR</th>
                  <th>Min WPR</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: currentClub.maxLevel }, (_, i) => i + 1).map((lvl) => {
                  const pwr = currentClub.power[lvl - 1];
                  const acc = currentClub.accuracy[lvl - 1];
                  const wpr = windPerRingByPower(currentClub, lvl, mode);
                  const isSelected = lvl === selectedLevel;

                  return (
                    <tr
                      key={lvl}
                      style={{
                        background: isSelected ? "var(--surface-3)" : "transparent",
                        fontWeight: isSelected ? "bold" : "normal",
                      }}
                    >
                      <td>
                        <Badge
                          bg={isSelected ? accentVar(currentClub.category) : "var(--surface-2)"}
                          color={isSelected ? "#fff" : "var(--text-primary)"}
                          px="8px"
                          py="2px"
                          borderRadius="full"
                        >
                          Level {lvl}
                        </Badge>
                      </td>
                      <td>{pwr}</td>
                      <td>{acc}</td>
                      <td style={{ color: "var(--brand-primary)", fontWeight: "bold" }}>
                        {wpr.max.toFixed(2)}
                      </td>
                      <td>{wpr.mid.toFixed(2)}</td>
                      <td>{wpr.min.toFixed(2)}</td>
                      <td>
                        <Button
                          size="xs"
                          variant={isSelected ? "solid" : "ghost"}
                          colorScheme="blue"
                          onClick={() => setSelectedLevel(lvl)}
                        >
                          {isSelected ? "Active" : "Inspect"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>
      )}

      {/* Ring System Diagram (for /golf-clash-ring-system) */}
      {config.type === "ring-system" && (
        <Box
          bg="var(--surface-1)"
          p="20px"
          borderRadius="var(--radius-lg)"
          border="1px solid var(--border)"
          mb="32px"
        >
          <Heading as="h2" fontSize="1.2rem" mb="12px" color="var(--text-primary)">
            Anatomy of the 5 Target Rings
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "260px 1fr" }} gap="20px" alignItems="center">
            {/* Target SVG */}
            <Flex justify="center">
              <svg viewBox="0 0 200 200" style={{ width: "200px", height: "200px" }}>
                <circle cx="100" cy="100" r="100" fill="var(--ring-5, #e2e8f0)" />
                <circle cx="100" cy="100" r="80" fill="var(--ring-4, #94a3b8)" />
                <circle cx="100" cy="100" r="60" fill="var(--ring-3, #38bdf8)" />
                <circle cx="100" cy="100" r="40" fill="var(--ring-2, #fb923c)" />
                <circle cx="100" cy="100" r="20" fill="var(--ring-1, #facc15)" />
                <circle cx="100" cy="100" r="3" fill="#000" />
              </svg>
            </Flex>

            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap="10px">
              <Box bg="var(--surface-2)" p="10px 12px" borderRadius="var(--radius-sm)">
                <Text fontWeight="bold" fontSize="0.85rem" color="var(--ring-1, #eab308)">
                  1. Yellow (Bullseye) = 1.0 Ring
                </Text>
                <Text fontSize="0.75rem" color="var(--text-secondary)">
                  Radius from center dot to yellow border is exactly 1.0 ring.
                </Text>
              </Box>
              <Box bg="var(--surface-2)" p="10px 12px" borderRadius="var(--radius-sm)">
                <Text fontWeight="bold" fontSize="0.85rem" color="var(--ring-2, #f97316)">
                  2. Orange (Inner) = 2.0 Rings
                </Text>
                <Text fontSize="0.75rem" color="var(--text-secondary)">
                  From center to orange border is 2.0 rings.
                </Text>
              </Box>
              <Box bg="var(--surface-2)" p="10px 12px" borderRadius="var(--radius-sm)">
                <Text fontWeight="bold" fontSize="0.85rem" color="var(--ring-3, #0ea5e9)">
                  3. Blue (Middle) = 3.0 Rings
                </Text>
                <Text fontSize="0.75rem" color="var(--text-secondary)">
                  From center to blue border is 3.0 rings.
                </Text>
              </Box>
              <Box bg="var(--surface-2)" p="10px 12px" borderRadius="var(--radius-sm)">
                <Text fontWeight="bold" fontSize="0.85rem" color="var(--ring-4, #64748b)">
                  4. Clear (Outer) = 4.0 Rings
                </Text>
                <Text fontSize="0.75rem" color="var(--text-secondary)">
                  From center to clear border is 4.0 rings.
                </Text>
              </Box>
              <Box bg="var(--surface-2)" p="10px 12px" borderRadius="var(--radius-sm)" gridColumn={{ sm: "span 2" }}>
                <Text fontWeight="bold" fontSize="0.85rem" color="var(--text-primary)">
                  5. White (Target Edge) = 5.0 Rings
                </Text>
                <Text fontSize="0.75rem" color="var(--text-secondary)">
                  The full circle edge measures exactly 5.0 rings from center (10 rings total diameter).
                </Text>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Elevation Baseline Table (for /golf-clash-elevation-calculator) */}
      {config.type === "elevation" && (
        <Box
          bg="var(--surface-1)"
          p="20px"
          borderRadius="var(--radius-lg)"
          border="1px solid var(--border)"
          mb="32px"
        >
          <Heading as="h2" fontSize="1.2rem" mb="12px" color="var(--text-primary)">
            Tournament Elevation Rules of Thumb
          </Heading>
          <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap="12px">
            <Box bg="var(--surface-2)" p="12px" borderRadius="var(--radius-sm)">
              <Text fontWeight="bold" fontSize="0.9rem" color="var(--brand-primary)" mb="4px">
                +10% Baseline (Tee Shots)
              </Text>
              <Text fontSize="0.78rem" color="var(--text-secondary)">
                Most driver tee shots drop slightly into fairways. Standard baseline for tour play.
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="12px" borderRadius="var(--radius-sm)">
              <Text fontWeight="bold" fontSize="0.9rem" color="var(--brand-primary)" mb="4px">
                +20% to +35% (Island Drops)
              </Text>
              <Text fontSize="0.78rem" color="var(--text-secondary)">
                Steep cliff shots and island greens. Wind has extended hangtime to blow the ball.
              </Text>
            </Box>
            <Box bg="var(--surface-2)" p="12px" borderRadius="var(--radius-sm)">
              <Text fontWeight="bold" fontSize="0.9rem" color="var(--brand-primary)" mb="4px">
                -10% to -15% (Uphill Greens)
              </Text>
              <Text fontSize="0.78rem" color="var(--text-secondary)">
                Hitting up to an elevated green. Ball hits the slope early, reducing wind impact.
              </Text>
            </Box>
          </Grid>
        </Box>
      )}

      {/* Pro Tips Section */}
      <Box
        id="pro-tips"
        bg="var(--surface-1)"
        p="20px"
        borderRadius="var(--radius-lg)"
        border="1px solid var(--border)"
        mb="32px"
      >
        <Flex align="center" gap="8px" mb="16px">
          <Lightbulb size={20} color="var(--brand-primary, #f59e0b)" />
          <Heading as="h2" fontSize="1.2rem" m="0" color="var(--text-primary)">
            Pro Strategy &amp; Tournament Execution Tips
          </Heading>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="14px">
          {config.proTips.map((tip, idx) => (
            <Box
              key={idx}
              bg="var(--surface-2)"
              p="14px 16px"
              borderRadius="var(--radius-sm)"
              borderLeft="3px solid var(--brand-primary)"
            >
              <Text fontWeight="bold" fontSize="0.88rem" color="var(--text-primary)" mb="4px">
                {tip.title}
              </Text>
              <Text fontSize="0.8rem" color="var(--text-secondary)" lineHeight="1.5" m="0">
                {tip.text}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box
        id="faq"
        bg="var(--surface-1)"
        p="20px"
        borderRadius="var(--radius-lg)"
        border="1px solid var(--border)"
        mb="32px"
      >
        <Flex align="center" gap="8px" mb="16px">
          <HelpCircle size={20} color="var(--series-1, #3b82f6)" />
          <Heading as="h2" fontSize="1.2rem" m="0" color="var(--text-primary)">
            Frequently Asked Questions
          </Heading>
        </Flex>

        <Flex direction="column" gap="12px">
          {config.faqs.map((faq, idx) => (
            <Box
              key={idx}
              bg="var(--surface-2)"
              p="14px 16px"
              borderRadius="var(--radius-sm)"
            >
              <Text fontWeight="bold" fontSize="0.9rem" color="var(--text-primary)" mb="6px">
                {faq.q}
              </Text>
              <Text fontSize="0.82rem" color="var(--text-secondary)" lineHeight="1.5" m="0">
                {faq.a}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Explore More Guides Grid (SEO Interlinking) */}
      <Box
        bg="var(--surface-1)"
        p="20px"
        borderRadius="var(--radius-lg)"
        border="1px solid var(--border)"
        mb="32px"
      >
        <Heading as="h3" fontSize="1.05rem" mb="12px" color="var(--text-primary)">
          Explore More Golf Clash Wind &amp; Ring Calculators
        </Heading>
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          }}
          gap="10px"
        >
          {ALL_LANDING_PATHS.filter((p) => p !== config.path).map((pathKey) => {
            const page = LANDING_PAGES[pathKey];
            return (
              <Box
                key={pathKey}
                as="button"
                type="button"
                onClick={() => navigate(pathKey)}
                p="10px 12px"
                bg="var(--surface-2)"
                borderRadius="var(--radius-sm)"
                border="1px solid var(--border)"
                textAlign="left"
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{
                  borderColor: "var(--brand-primary)",
                  transform: "translateY(-1px)",
                }}
              >
                <Badge fontSize="0.65rem" colorScheme="blue" mb="4px">
                  {page.badge}
                </Badge>
                <Text
                  fontSize="0.8rem"
                  fontWeight="600"
                  color="var(--text-primary)"
                  lineHeight="1.2"
                >
                  {page.heading}
                </Text>
              </Box>
            );
          })}
        </Grid>
      </Box>

      <Footer />
    </Box>
  );
}
