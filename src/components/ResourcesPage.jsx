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
  Award,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  Lightbulb,
  MessageSquare,
  Play,
  Search,
  Sparkles,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import Footer from "./Footer";

export const VETTED_RESOURCES = [
  // ----------------------------------------------------
  // 1. YOUTUBE CHANNELS & VIDEO GUIDES
  // ----------------------------------------------------
  {
    id: "yt-tommy",
    category: "YouTube Creators",
    name: "Golf Clash Tommy",
    creator: "Tommy",
    url: "https://www.youtube.com/@GolfClashTommy",
    badge: "Official Playdemic Partner",
    badgeColor: "#eab308",
    description: "The #1 authority on Golf Clash tournament guides, bi-weekly Golden Shot tutorials, and ring system masterclasses. Produces comprehensive Rookie, Pro, Expert, and Master tournament walkthroughs.",
    bestFor: "Tournament guides, Golden Shot tutorials, elevation masterclasses, secondary wind effect breakdowns",
    tags: ["Tournament Guides", "Golden Shot", "Elevation Sheets", "Masterclasses"],
    verifiedNotes: "Official partner with over 80,000 subscribers; referenced by virtually all competitive clans.",
  },
  {
    id: "yt-bkgolf",
    category: "YouTube Creators",
    name: "BK Golf",
    creator: "Ben (BK Golf)",
    url: "https://www.youtube.com/@BKGolf",
    badge: "Master Specialist",
    badgeColor: "#3b82f6",
    description: "Expert and Master division tournament playthroughs, hole-by-hole shootout tutorials, and precise ring pull demonstrations with clear voiceover commentary.",
    bestFor: "Master division guides, shootout hole-in-one lines, elevation adjustments",
    tags: ["Master Guides", "Shootouts", "Tour Guides"],
    verifiedNotes: "Highly praised by tournament players for calm, methodical walkthroughs and exact pull angles.",
  },
  {
    id: "yt-gcindia",
    category: "YouTube Creators",
    name: "GC India",
    creator: "GC India Team",
    url: "https://www.youtube.com/@GCIndia",
    badge: "Golden Shot Specialist",
    badgeColor: "#eab308",
    description: "The fastest, most reliable source for bi-weekly Golden Shot guides (Hard & Medium ring maps) within hours of event launch, plus Checkpoint Challenge strategies.",
    bestFor: "Golden Shot bi-weekly releases, Checkpoint Challenge, free-to-play tournament guides",
    tags: ["Golden Shot", "Checkpoint Challenge", "F2P Guides"],
    verifiedNotes: "Delivers verified Golden Shot ring pulls and elevations within 2 hours of every new event.",
  },
  {
    id: "yt-neo",
    category: "YouTube Creators",
    name: "Neo Golf Clash",
    creator: "Neo",
    url: "https://www.youtube.com/@NeoGolfClash",
    badge: "Elite Streamer",
    badgeColor: "#8b5cf6",
    description: "Top-tier Master tournament player and live streamer. Renowned for elite ring pulling speed, negative pullback techniques, and tournament bracket reviews.",
    bestFor: "Live tournament streams, ring pulling speed, high-wind Master techniques",
    tags: ["Live Streams", "Master Tournament", "Pro Pulls"],
    verifiedNotes: "Multi-time Master gold medalist demonstrating live tournament play under pressure.",
  },
  {
    id: "yt-zachary-jones",
    category: "YouTube Creators",
    name: "Zachary Jones Golf Clash",
    creator: "Zachary Jones",
    url: "https://www.youtube.com/@ZacharyJonesGolfClash",
    badge: "Ring System Pioneer",
    badgeColor: "#22c55e",
    description: "The foundational creator who mathematically documented the Golf Clash ring system and published the original tutorial videos that formed the basis for modern wind calculators.",
    bestFor: "Understanding the foundational mathematics of target rings, accuracy scaling, and curl",
    tags: ["Foundations", "Ring Math", "Pioneer"],
    verifiedNotes: "The original math creator behind the ring method; historical foundation of the entire community.",
  },
  {
    id: "yt-fenzl",
    category: "YouTube Creators",
    name: "Fenzl Golf Clash",
    creator: "Fenzl",
    url: "https://www.youtube.com/@FenzlGolfClash",
    badge: "Precision Master",
    badgeColor: "#06b6d4",
    description: "Specializes in precision micro-adjustments, exact secondary wind offsets, and consistent tournament drop routines for Expert and Master players.",
    bestFor: "Precision drops, secondary wind offsets, tournament text guides",
    tags: ["Precision Drops", "Text Guides", "Offsets"],
    verifiedNotes: "Author of highly regarded tournament text guide sheets used by top 10 clans.",
  },

  // ----------------------------------------------------
  // 2. REFERENCE WEBSITES & DATABASES
  // ----------------------------------------------------
  {
    id: "web-gcnotebook",
    category: "Reference Websites",
    name: "Golf Clash Notebook",
    creator: "Notebook Community",
    url: "https://golfclashnotebook.io",
    badge: "Foundational Wiki",
    badgeColor: "#3b82f6",
    description: "The definitive open-source community database for Golf Clash. Complete database of club stats across every level, course hole maps, tour guides, and wind formula specifications.",
    bestFor: "Club stats by level, course hole layouts, wind formula documentation, ball stats",
    tags: ["Club Stats", "Hole Guides", "Open Source", "Formulas"],
    verifiedNotes: "MIT licensed community project that provided the seed club math for this app.",
  },
  {
    id: "web-gctommy",
    category: "Reference Websites",
    name: "Golf Clash Tommy Official Hub",
    creator: "Golf Clash Tommy",
    url: "https://golfclashtommy.com",
    badge: "Official Tournament Hub",
    badgeColor: "#eab308",
    description: "The central website for tournament text guides, course elevation sheets, shootout hole guides, and tournament schedule calendars.",
    bestFor: "Downloadable elevation sheets, tournament text sheets, Golden Shot charts",
    tags: ["Elevation Sheets", "Tour Guides", "Tournament Sheets"],
    verifiedNotes: "Continuously updated before and during every single tournament cycle.",
  },
  {
    id: "web-playdemic-support",
    category: "Reference Websites",
    name: "Playdemic Official Golf Clash Support & FAQ",
    creator: "Playdemic / EA",
    url: "https://playdemic.helpshift.com/hc/en/3-golf-clash/",
    badge: "Official Game Publisher",
    badgeColor: "#64748b",
    description: "Official publisher knowledge base covering tournament tier criteria, clan season rules, ball stats, matchmaking mechanics, and game update release notes.",
    bestFor: "Official tournament rules, matchmaking algorithms, clan points formulas",
    tags: ["Official Rules", "Matchmaking", "Patch Notes"],
    verifiedNotes: "Authoritative official documentation directly from the game's development team.",
  },

  // ----------------------------------------------------
  // 3. COMMUNITY FORUMS & DISCUSSION GROUPS
  // ----------------------------------------------------
  {
    id: "forum-reddit",
    category: "Community Forums",
    name: "Reddit r/GolfClash",
    creator: "Reddit Community",
    url: "https://www.reddit.com/r/GolfClash/",
    badge: "25k+ Members",
    badgeColor: "#ff4500",
    description: "Active community subreddit featuring tournament bracket discussions, bankroll management guides, clan recruitment threads, and community Q&A.",
    bestFor: "Tour progression advice, bankroll management tips, clan recruitment, strategy checks",
    tags: ["Community Q&A", "Brackets", "Discussions", "Bankroll"],
    verifiedNotes: "Active daily discussions with seasoned players and community representatives.",
  },
  {
    id: "forum-facebook",
    category: "Community Forums",
    name: "Golf Clash Community on Facebook",
    creator: "Facebook Group",
    url: "https://www.facebook.com/groups/golfclashcommunity",
    badge: "120k+ Members",
    badgeColor: "#1877f2",
    description: "The largest global social community for Golf Clash players. Players share shootout drop videos, tournament brackets, clan tips, and event announcements.",
    bestFor: "Video shares, tournament discussion, clan networking, community announcements",
    tags: ["Social", "Drops", "Clan Networking"],
    verifiedNotes: "The biggest online gathering of active Golf Clash players worldwide.",
  },
  {
    id: "forum-discord",
    category: "Community Forums",
    name: "Golf Clash Elite Discord Communities",
    creator: "Discord Communities",
    url: "https://discord.gg/golfclash",
    badge: "Live Chat",
    badgeColor: "#5865f2",
    description: "Real-time Discord channels for live tournament shot-sharing, C100 clan communication, Checkpoint Challenge assistance, and wind discussions.",
    bestFor: "Real-time tournament chatter, live shot advice, clan coordination",
    tags: ["Live Chat", "C100 Clans", "Real-Time"],
    verifiedNotes: "Real-time chat platform used by top tournament clans during weekend rounds.",
  },
];

const RESOURCE_CATEGORIES = [
  "All",
  "YouTube Creators",
  "Reference Websites",
  "Community Forums",
];

export default function ResourcesPage({ navigate, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = useMemo(() => {
    return VETTED_RESOURCES.filter((res) => {
      const matchesCategory =
        selectedCategory === "All" || res.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        res.name.toLowerCase().includes(query) ||
        res.creator.toLowerCase().includes(query) ||
        res.description.toLowerCase().includes(query) ||
        res.bestFor.toLowerCase().includes(query) ||
        res.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <Box className="resources-page" maxW="1100px" mx="auto" px="16px" py="24px">
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
            leftIcon={<Lightbulb size={14} />}
            onClick={() => navigate?.("/tips")}
            color="var(--brand-primary, #3b82f6)"
          >
            Vetted Pro Tips
          </Button>
        </Flex>
      </Flex>

      {/* Page Header */}
      <Box mb="24px" textAlign="center">
        <Flex justify="center" align="center" gap="10px" mb="8px">
          <Box
            p="8px"
            borderRadius="10px"
            bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            color="#fff"
            boxShadow="0 2px 8px rgba(16, 185, 129, 0.4)"
          >
            <BookOpen size={24} />
          </Box>
          <Heading
            as="h1"
            fontSize={{ base: "1.6rem", md: "2.2rem" }}
            fontFamily="'Playfair Display', serif"
            fontWeight="800"
            color="var(--text-primary)"
            m="0"
          >
            Curated Community Resources
          </Heading>
        </Flex>
        <Text fontSize="0.9rem" color="var(--text-muted)" maxW="720px" mx="auto" m="0">
          Hand-picked, vetted external resources, guides, creator channels, and player forums dedicated specifically to Golf Clash.
        </Text>
      </Box>

      {/* Search and Category Filter */}
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
          <Flex align="center" gap="8px" flex="1" minW="240px">
            <Search size={16} style={{ color: "var(--text-muted)" }} />
            <Input
              size="sm"
              placeholder="Search resources (e.g. Tommy, Golden Shot, Reddit, elevation, shootout)..."
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
            Showing <strong>{filteredResources.length}</strong> of {VETTED_RESOURCES.length} resources
          </Text>
        </Flex>

        {/* Category Filter Pills */}
        <Flex gap="6px" overflowX="auto" pb="4px" className="no-scrollbar">
          {RESOURCE_CATEGORIES.map((cat) => (
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

      {/* Resource Cards Grid */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(auto-fill, minmax(320px, 1fr))" }} gap="18px" mb="40px">
        {filteredResources.map((res) => (
          <Box
            key={res.id}
            as="article"
            bg="var(--surface-1)"
            border="1px solid var(--border)"
            borderRadius="var(--radius-md)"
            p="16px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            boxShadow="var(--shadow-sm)"
            transition="all 0.15s ease"
            _hover={{
              borderColor: "var(--border-strong)",
              boxShadow: "var(--shadow-md)",
              transform: "translateY(-2px)",
            }}
          >
            <Box>
              {/* Header with category and badge */}
              <Flex justify="space-between" align="center" mb="8px" flexWrap="wrap" gap="6px">
                <Text
                  fontSize="0.68rem"
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  color="var(--text-muted)"
                  m="0"
                >
                  {res.category}
                </Text>
                {res.badge && (
                  <Box
                    px="6px"
                    py="1px"
                    borderRadius="4px"
                    fontSize="0.68rem"
                    fontWeight="800"
                    bg="var(--surface-3)"
                    color={res.badgeColor || "var(--brand-primary)"}
                    border="1px solid var(--border)"
                  >
                    {res.badge}
                  </Box>
                )}
              </Flex>

              {/* Title & Creator */}
              <Heading as="h3" fontSize="1.1rem" fontWeight="700" color="var(--text-primary)" m="0 0 4px">
                {res.name}
              </Heading>
              <Text fontSize="0.75rem" color="var(--text-muted)" mb="10px">
                By <strong>{res.creator}</strong>
              </Text>

              {/* Description */}
              <Text fontSize="0.82rem" color="var(--text-secondary)" lineHeight="1.5" mb="12px">
                {res.description}
              </Text>

              {/* Best For Callout */}
              <Box
                bg="var(--surface-2)"
                p="8px 10px"
                borderRadius="var(--radius-sm)"
                borderLeft="3px solid var(--brand-primary, #3b82f6)"
                mb="12px"
              >
                <Text fontSize="0.75rem" fontWeight="700" color="var(--text-primary)" m="0">
                  Best For:
                </Text>
                <Text fontSize="0.75rem" color="var(--text-secondary)" m="0">
                  {res.bestFor}
                </Text>
              </Box>

              {/* Tags */}
              <Flex gap="4px" flexWrap="wrap" mb="14px">
                {res.tags.map((tag) => (
                  <Box
                    key={tag}
                    px="6px"
                    py="2px"
                    borderRadius="4px"
                    fontSize="0.68rem"
                    bg="var(--surface-3)"
                    color="var(--text-muted)"
                    border="1px solid var(--border)"
                  >
                    {tag}
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* Bottom Actions and Verification */}
            <Box pt="10px" borderTop="1px solid var(--border)">
              <Flex justify="space-between" align="center" gap="8px">
                <Flex align="center" gap="4px" fontSize="0.68rem" color="var(--text-muted)">
                  <CheckCircle2 size={12} style={{ color: "#22c55e" }} />
                  <span>Vetted &amp; Confirmed</span>
                </Flex>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 12px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--brand-primary, #3b82f6)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  className="resource-visit-btn"
                >
                  Visit Resource <ExternalLink size={12} />
                </a>
              </Flex>
            </Box>
          </Box>
        ))}
      </Grid>

      <Footer onNavigate={navigate} />
    </Box>
  );
}
