import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  ExternalLink,
  Flame,
  Info,
  Lightbulb,
  Mountain,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Wind,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import Footer from "./Footer";

export const VETTED_TIPS = [
  {
    id: "elevation-reading",
    category: "Elevation",
    title: "How to Read Elevation (Downhill vs Uphill)",
    takeaway: "Downhill shots always require POSITIVE elevation (+10% to +35%); uphill shots require NEGATIVE elevation (-10% to -20%).",
    mechanics: [
      "When shooting downhill, the ball spends longer airborne, allowing the wind to push it significantly farther. When shooting uphill, the ball impacts the ground earlier in its trajectory, giving wind less time to affect it.",
      "Water is the universal flat plane (0 elevation): compare your tee box height and your landing zone height against the nearest water hazard.",
      "Watch the pre-shot hole flyover camera angle: a steep downward camera pan indicates a heavy downhill drop (+15% to +30%).",
      "Green cliff banks and bunker lips: if the fairway slopes sharply down toward the green, add +10% to +15% minimum.",
    ],
    example: "Hole with a 15% downhill drop into 10.0 mph crosswind: enter +15% elevation. 10.0 mph × 1.15 = 11.5 mph effective wind to adjust for.",
    citation: {
      source: "Golf Clash Tommy Elevation Masterclass & GC Notebook",
      author: "Golf Clash Tommy & GC Notebook Community",
      url: "https://golfclashtommy.com",
    },
  },
  {
    id: "elevation-ring-math",
    category: "Elevation",
    title: "Elevation Ring Math: The 10% Quick-Rule",
    takeaway: "Every +10% of elevation adds 10% to your ring pull (or 1 extra ring per 10 rings of base adjustment).",
    mechanics: [
      "Elevation formula: Adjusted Wind = Actual Wind × (1 + Elevation / 100).",
      "Quick mental calculation in-game without a calculator:",
      "• If base adjustment is 5.0 rings: +10% elevation = 5.5 rings (+0.5 ring).",
      "• If base adjustment is 5.0 rings: +20% elevation = 6.0 rings (+1.0 ring).",
      "• If base adjustment is 5.0 rings: -10% elevation = 4.5 rings (-0.5 ring).",
      "• If base adjustment is 10.0 rings: +10% elevation = 11.0 rings (+1.0 ring).",
    ],
    example: "Sniper 10 (1.0 WPR at max) in 8.0 mph wind with +10% elevation: 8.0 × 1.10 = 8.8 rings pull instead of 8.0.",
    citation: {
      source: "Zachary Jones Ring System Foundations & Playdemic Guides",
      author: "Zachary Jones",
      url: "https://golfclashnotebook.io",
    },
  },
  {
    id: "negative-pullback",
    category: "Pullback",
    title: "Negative 'Pullback' for Downhill Tee Shots & Slider Control",
    takeaway: "Downhill tee shots extend total carry past the club's normal max line. Pull back target rings from the boundary line to control landing spot.",
    mechanics: [
      "Find your club's hard maximum line by pushing the target forward until the red boundary circle stops moving.",
      "Count rings straight backward toward your tee box before making the wind adjustment: on a 240y Driver, 1 ring of pullback moves your landing spot back by ~1.5 to 2.0 yards (approx 1.5% slider).",
      "When a tournament guide specifies 'pull back 3 rings from max': slide the target 3 rings backward from the max boundary, then perform your ring adjustment from that exact spot.",
      "In heavy tailwinds (+10 to +15 mph), pull back 2-4 rings to prevent the ball from bouncing through the fairway into rough or bunkers.",
    ],
    example: "Apocalypse 5 in a 12 mph tailwind: push to max, pull back 4 rings toward tee box, then adjust for 12 mph. The drive lands safely in mid-fairway.",
    citation: {
      source: "GC India Tournament Strategy & Neo Masterclass",
      author: "GC India & Neo Golf Clash",
      url: "https://www.youtube.com/@GCIndia",
    },
  },
  {
    id: "scaling-club-classes",
    category: "Scaling",
    title: "Why Wedges are 2 Rings for 20mph while Drivers are 10 Rings",
    takeaway: "Ring adjustments measure physical ground yards. Clubs with short airtime and small power carry need far fewer rings than long-carry drivers.",
    mechanics: [
      "The ring adjustment formula is: Rings = Wind / WPR.",
      "A Driver at max distance flies ~240+ yards and stays airborne for 4.5 seconds. A 20 mph wind will push that ball ~40 yards off target! On an Extra Mile 8 (Acc 45, WPR 2.1), that requires ~9.5 to 10 rings.",
      "An Endbringer Wedge at minimum distance carries only 12–15 yards, airborne for less than 1.2 seconds. That same 20 mph wind only pushes the ball ~3–4 yards off target. With 100 accuracy, min WPR is ~6.0–7.0, requiring only 2.5 to 3 rings!",
      "General Rule of Thumb:",
      "• Drivers: 1 ring ≈ 1.5 to 3.0 mph (Big adjustments: 4–10 rings common).",
      "• Woods: 1 ring ≈ 1.0 to 2.5 mph (Sniper 10 is 1:1 at max).",
      "• Long Irons: 1 ring ≈ 1.0 to 2.0 mph (Grizzly 7-9 is ~1.0–1.1 WPR at max).",
      "• Short Irons: 1 ring ≈ 1.2 to 2.2 mph (Thorn 8 is ~1.8 WPR at max).",
      "• Wedges at Min: 1 ring ≈ 4.0 to 8.0 mph (Tiny adjustments: 1–3 rings common).",
    ],
    example: "Pitch shot near the green: 14 mph wind. Do NOT pull 14 rings! On an Endbringer at min, 14 mph is only ~2.1 rings.",
    citation: {
      source: "Golf Clash Notebook Wind Mechanics & Club Physics",
      author: "Golf Clash Notebook Community",
      url: "https://golfclashnotebook.io/wind/",
    },
  },
  {
    id: "take-shot-needle-alignment",
    category: "Technique",
    title: "Precision Ring Pulling: The 'Take Shot' Button Horizon",
    takeaway: "Always rotate your screen so the wind points dead North (12:00) or South (6:00). Use the curved top of the Take Shot button as your straight edge.",
    mechanics: [
      "Never pull diagonally or at an angle across the target rings — diagonal pulls introduce human angle distortion and missed ring counts.",
      "Rotate screen until the wind arrow points directly at the top of your screen (12:00) or directly at the bottom (6:00).",
      "Anchor the center yellow bullseye or outer white ring directly against the circular top rim of the orange 'Take Shot' button.",
      "Pull downward in one straight, smooth motion until your desired ring boundary meets that same rim.",
      "Use ring color boundaries as precise increments: Yellow edge = 1.0, Orange edge = 2.0, Blue edge = 3.0, Brown edge = 4.0, White edge = 5.0 rings.",
    ],
    example: "Adjusting 4.2 rings North wind: rotate arrow to 12:00, align bullseye on Take Shot button rim, pull down until the clear/white ring (4.0) plus 0.2 rings crosses the rim.",
    citation: {
      source: "Golf Clash Tommy Ring Pull Alignment Guide",
      author: "Golf Clash Tommy",
      url: "https://golfclashtommy.com",
    },
  },
  {
    id: "secondary-wind-effect",
    category: "Wind Effect",
    title: "Secondary Wind Effect (SWE): Post-Bounce Drift & Compression",
    takeaway: "Rings only position the ball's FIRST bounce. Wind continues pushing the ball on every subsequent bounce and roll-out.",
    mechanics: [
      "The ball guide shows where the ball rolls in ZERO wind. When wind is blowing, the ball drifts with the wind after hitting the ground.",
      "• Direct Headwind: Compresses bounce 2 and 3; the ball stops earlier than the ball guide predicts. Add 1 to 2 bars of topspin or pull 0.2 rings less.",
      "• Direct Tailwind: Elongates bounce 2 and 3; the ball rolls 1 to 3 green squares farther than predicted. Add 1 to 2 bars of backspin or pull 0.2 rings extra.",
      "• Direct Crosswind: Pushes the roll-out sideways. If wind is 10 mph blowing left-to-right, the ball will roll 0.5 to 1.5 green squares right of the cup after bouncing.",
      "Counter-offset: In strong crosswinds (8+ mph), aim the tip of your ball guide 0.5 to 1 cup width against the wind direction.",
    ],
    example: "Par 3 with 9.0 mph right-to-left wind: after adjusting rings, offset your ball guide 1 green square to the RIGHT of the hole to account for secondary wind push.",
    citation: {
      source: "Golf Clash Tommy Secondary Wind Effect Breakdown & BK Golf",
      author: "Golf Clash Tommy & BK Golf",
      url: "https://www.youtube.com/@BKGolf",
    },
  },
  {
    id: "overpower-and-curl",
    category: "Technique",
    title: "Overpower & Curl Ring Mechanics",
    takeaway: "1 ring of overpower adds ~2.5% distance on Driver. Overpower increases target ring size and needle speed.",
    mechanics: [
      "Overpower is measured in rings: pulling the ball down until the top edge of the ball touches the top of the circle is 1 ring overpower.",
      "When using overpower, the ball stays in the air longer, so add extra wind compensation: +0.2 to +0.5 rings for full overpower.",
      "Curl does NOT add distance; curl only curves the flight path in the air. Curl causes the ball to land slightly shorter than a straight shot.",
      "Curl against the wind straightens the ball flight; curl with the wind severely accentuates the flight path and roll.",
    ],
    example: "Tee shot with Full Overpower in a 10 mph headwind: add +0.5 rings to your wind pull to account for the extended airborne duration.",
    citation: {
      source: "GC Notebook Overpower Guide & Playdemic Mechanics",
      author: "Golf Clash Notebook",
      url: "https://golfclashnotebook.io/overpower/",
    },
  },
  {
    id: "golden-shot-rules",
    category: "Golden Shot",
    title: "Golden Shot Bi-Weekly Golden Rules",
    takeaway: "Golden Driver and Wood have fixed stats. Never guess spin — use standard guide elevations (+10% to +15% for Wood) at Mid distance.",
    mechanics: [
      "The Golden Ball used in Golden Shot has Power 1 (sometimes Power 0) and 0% Wind Resistance. Never rely on wind reduction.",
      "Golden Wood stats: Power 166, Accuracy 51 (Max WPR ~1.95, Mid WPR ~2.15 at 10% elevation).",
      "Golden Driver stats: Power 202, Accuracy 83 (Max WPR ~1.60, Mid WPR ~1.70).",
      "Most Golden Wood holes play downhill: default to +10% or +15% elevation at Mid distance unless the specific hole calls for 0% or +20%.",
      "Always take a practice alignment screenshot or review community guides (Tommy / GC India) before taking your single free Golden Shot attempt.",
    ],
    example: "Golden Wood, wind 8.8 mph: at +10% elevation, mid distance WPR is 2.15. Adjustment = 8.8 / 2.15 = 4.1 rings.",
    citation: {
      source: "Golf Clash Tommy Golden Shot Masterclass & GC India",
      author: "Golf Clash Tommy & GC India",
      url: "https://www.youtube.com/@GCIndia",
    },
  },
  {
    id: "checkpoint-challenge-rules",
    category: "Checkpoint",
    title: "Checkpoint Challenge (CPC) Survival Rules",
    takeaway: "In CPC you don't control your clubs. Focus on Accuracy stats and keep a mental rule for low vs high accuracy clubs.",
    mechanics: [
      "When a new Checkpoint hole starts, immediately check the Accuracy stat of your assigned club in the 10-second setup window.",
      "If Accuracy is 100: WPR is 1.0 at Max distance (1 ring per 1 mph on Woods/Long Irons).",
      "If Accuracy is 50: WPR is 2.0 at Max distance (1 ring per 2 mph on Woods/Long Irons).",
      "If Accuracy is 0: WPR is 3.0 at Max distance (1 ring per 3 mph).",
      "Use our Universal Chart / CPC Quick Roster tab in Live Play to look up your club in 2 taps without touching your saved bags.",
    ],
    example: "Handed a Sniper 8 (Acc 100) on a shootout: adjust 1 ring per 1.0 mph wind. Handed a Big Dawg 5 (Acc 30): adjust 1 ring per 2.4 mph wind.",
    citation: {
      source: "Reddit r/GolfClash CPC Strategy Thread & GC Notebook",
      author: "Reddit r/GolfClash Community",
      url: "https://www.reddit.com/r/GolfClash/",
    },
  },
];

const CATEGORIES = [
  "All",
  "Elevation",
  "Pullback",
  "Scaling",
  "Technique",
  "Wind Effect",
  "Golden Shot",
  "Checkpoint",
];

export default function TipsPage({ navigate, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTips = useMemo(() => {
    return VETTED_TIPS.filter((tip) => {
      const matchesCategory =
        selectedCategory === "All" || tip.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        tip.title.toLowerCase().includes(query) ||
        tip.takeaway.toLowerCase().includes(query) ||
        tip.category.toLowerCase().includes(query) ||
        tip.mechanics.some((m) => m.toLowerCase().includes(query)) ||
        tip.citation.author.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <Box className="tips-page" maxW="1100px" mx="auto" px="16px" py="24px">
      {/* Top Breadcrumb & Navigation */}
      <Flex justify="space-between" align="center" mb="20px" flexWrap="wrap" gap="10px">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => {
            if (onBack) onBack();
            else if (navigate) navigate("/");
          }}
          borderRadius="var(--radius-sm)"
        >
          Back to Calculator
        </Button>

        <Flex gap="8px" align="center">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<BookOpen size={14} />}
            onClick={() => navigate?.("/resources")}
            color="var(--brand-primary, #3b82f6)"
          >
            Community Resources
          </Button>
        </Flex>
      </Flex>

      {/* Page Header */}
      <Box mb="24px" textAlign="center">
        <Flex justify="center" align="center" gap="10px" mb="8px">
          <Box
            p="8px"
            borderRadius="10px"
            bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            color="#fff"
            boxShadow="0 2px 8px rgba(59, 130, 246, 0.4)"
          >
            <Lightbulb size={24} />
          </Box>
          <Heading
            as="h1"
            fontSize={{ base: "1.6rem", md: "2.2rem" }}
            fontFamily="'Playfair Display', serif"
            fontWeight="800"
            color="var(--text-primary)"
            m="0"
          >
            Vetted Pro Tips &amp; Game Mechanics
          </Heading>
        </Flex>
        <Text fontSize="0.9rem" color="var(--text-muted)" maxW="720px" mx="auto" m="0">
          Concise, high-impact strategies for Golf Clash. Every tip listed here is tested, verified by top tournament players, and backed by proper community citations.
        </Text>
      </Box>

      {/* Filter and Search Bar */}
      <Flex
        direction="column"
        gap="12px"
        bg="var(--surface-1)"
        p="14px"
        borderRadius="var(--radius-md)"
        border="1px solid var(--border)"
        boxShadow="var(--shadow-sm)"
        mb="24px"
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="10px">
          {/* Search Input */}
          <Flex align="center" gap="8px" flex="1" minW="240px">
            <Search size={16} style={{ color: "var(--text-muted)" }} />
            <Input
              size="sm"
              placeholder="Search tips (e.g. pullback, elevation, wedge, secondary wind)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="var(--surface-2)"
              borderColor="var(--border)"
              borderRadius="var(--radius-sm)"
              fontSize="0.85rem"
            />
            {searchQuery && (
              <Button size="xs" variant="ghost" onClick={() => setSearchQuery("")}>
                Clear
              </Button>
            )}
          </Flex>

          <Text fontSize="0.75rem" color="var(--text-muted)">
            Showing <strong>{filteredTips.length}</strong> of {VETTED_TIPS.length} vetted tips
          </Text>
        </Flex>

        {/* Category Pills */}
        <Flex gap="6px" overflowX="auto" pb="4px" className="no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`universal-subtab-btn ${selectedCategory === cat ? "is-active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: "0.76rem",
                padding: "4px 10px",
                whiteSpace: "nowrap",
              }}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </Flex>
      </Flex>

      {/* Tips Cards Grid */}
      <Grid templateColumns={{ base: "1fr" }} gap="18px" mb="40px">
        {filteredTips.map((tip) => (
          <Box
            key={tip.id}
            bg="var(--surface-1)"
            border="1px solid var(--border)"
            borderRadius="var(--radius-md)"
            p={{ base: "14px", md: "18px" }}
            boxShadow="var(--shadow-sm)"
            transition="all 0.15s ease"
            _hover={{ borderColor: "var(--border-strong)", boxShadow: "var(--shadow-md)" }}
          >
            {/* Header: Category Badge & Title */}
            <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap="8px" mb="10px">
              <Flex align="center" gap="8px">
                <Box
                  px="8px"
                  py="2px"
                  borderRadius="4px"
                  fontSize="0.68rem"
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  bg="var(--surface-3)"
                  color="var(--brand-primary, #3b82f6)"
                  border="1px solid var(--border)"
                >
                  {tip.category}
                </Box>
                <Heading as="h3" fontSize="1.05rem" fontWeight="700" color="var(--text-primary)" m="0">
                  {tip.title}
                </Heading>
              </Flex>
            </Flex>

            {/* Core Takeaway Pill */}
            <Box
              bg="var(--surface-2)"
              p="10px 12px"
              borderRadius="var(--radius-sm)"
              borderLeft="3px solid var(--brand-primary, #3b82f6)"
              mb="12px"
            >
              <Text fontSize="0.85rem" fontWeight="600" color="var(--text-primary)" m="0">
                💡 {tip.takeaway}
              </Text>
            </Box>

            {/* Mechanics Bullet Points */}
            <Box mb="12px">
              <Text fontSize="0.75rem" fontWeight="700" color="var(--text-secondary)" mb="6px">
                HOW &amp; WHY IT WORKS:
              </Text>
              <Box as="ul" pl="18px" m="0" fontSize="0.82rem" color="var(--text-secondary)" lineHeight="1.6">
                {tip.mechanics.map((m, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>
                    {m}
                  </li>
                ))}
              </Box>
            </Box>

            {/* Concrete Example */}
            {tip.example && (
              <Box
                bg="rgba(59, 130, 246, 0.06)"
                border="1px dashed rgba(59, 130, 246, 0.25)"
                borderRadius="var(--radius-sm)"
                p="8px 12px"
                mb="12px"
                fontSize="0.78rem"
                color="var(--text-primary)"
              >
                <strong style={{ color: "var(--brand-primary, #3b82f6)" }}>Practical Example:</strong>{" "}
                {tip.example}
              </Box>
            )}

            {/* Proper Vetted Citation */}
            <Flex
              justify="space-between"
              align="center"
              pt="8px"
              borderTop="1px solid var(--border)"
              fontSize="0.72rem"
              color="var(--text-muted)"
              flexWrap="wrap"
              gap="6px"
            >
              <Flex align="center" gap="4px">
                <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
                <span>
                  Vetted Citation: <strong>{tip.citation.author}</strong> ({tip.citation.source})
                </span>
              </Flex>
              {tip.citation.url && (
                <a
                  href={tip.citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    color: "var(--brand-primary, #3b82f6)",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Verify Source <ExternalLink size={11} />
                </a>
              )}
            </Flex>
          </Box>
        ))}
      </Grid>

      <Footer onNavigate={navigate} />
    </Box>
  );
}

