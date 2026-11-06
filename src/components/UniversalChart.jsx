import { Box, Button, Flex, Grid, Heading, Image, Input, Text } from "@chakra-ui/react";
import {
  ArrowUpDown,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import balls from "../data/balls";
import {
  WIND_MODES,
  buildRingsPerWindTable,
  buildWindPerRingTable,
} from "../lib/wind";
import { accentVar, CATEGORY_ORDER, getClubImageUrl, sortBagClubs } from "../utils";
import CategoryIcon from "./CategoryIcon";
import { ClubChartCard } from "./ChartOutput";
import DistanceSlider from "./DistanceSlider";
import LevelPicker from "./LevelPicker";
import QuickChart from "./QuickChart";

// Category nominal max carry distances and multipliers (Golf Clash physics)
const CATEGORY_NOMINAL = {
  All: { name: "All Clubs (Normalized 1.0)", maxDist: 240, floor: 0.75, mult: 1.0, halfSwing: false },
  Drivers: { name: "Drivers", maxDist: 240, floor: 0.75, mult: 1.0, halfSwing: false },
  Woods: { name: "Woods", maxDist: 180, floor: 0.75, mult: 1.0, halfSwing: false },
  LongIrons: { name: "Long Irons", maxDist: 135, floor: 0.66, mult: 1.0, halfSwing: false },
  ShortIrons: { name: "Short Irons", maxDist: 90, floor: 0.5, mult: 1.0, halfSwing: false },
  Wedges: { name: "Wedges", maxDist: 45, floor: 0.25, mult: 1.0, halfSwing: true },
  RoughIrons: { name: "Rough Irons", maxDist: 135, floor: 0.25, mult: 1.45, halfSwing: true },
  SandWedges: { name: "Sand Wedges", maxDist: 120, floor: 0.25, mult: 1.15, halfSwing: true },
};

function getAccuracyColor(acc) {
  if (acc < 20) return "#dc2626"; // Dark Red
  if (acc < 40) return "#ea580c"; // Orange
  if (acc < 60) return "#eab308"; // Yellow
  if (acc < 85) return "#3b82f6"; // Blue
  return "#22c55e"; // Bright Green
}

const STORAGE_KEY_CPC = "gcwind.cpcBag";

export default function UniversalChart({
  clubs = [],
  settings = {},
  setSettings,
  setBag,
  onLoadToSimulator,
  isWidgetMode = false,
  onClose,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState("quick"); // "quick" | "matrix" | "golden" | "cpc"

  // ----------------------------------------------------
  // SUB-MODE 1: UNIVERSAL ACCURACY MATRIX
  // ----------------------------------------------------
  const [matrixCategory, setMatrixCategory] = useState("All");
  const [matrixPowerIdx, setMatrixPowerIdx] = useState(0); // Power 0 by default
  const [matrixElevation, setMatrixElevation] = useState(0); // -50 to +50
  const [matrixTableStep, setMatrixTableStep] = useState(10); // 10 or 5
  const [matrixCalcAcc, setMatrixCalcAcc] = useState(70);
  const [matrixCalcWind, setMatrixCalcWind] = useState(8.0);
  const [matrixCalcDistance, setMatrixCalcDistance] = useState(50);
  const [matrixTableMode, setMatrixTableMode] = useState("wpr"); // "wpr" (Wind Per Ring) | "rings" (Rings per 10 MPH)

  // Calculate WPR for arbitrary accuracy and category
  const calculateAccuracyWpr = (acc, catKey, pwrIdx, elev) => {
    const config = CATEGORY_NOMINAL[catKey] || CATEGORY_NOMINAL.All;
    const mode = WIND_MODES[pwrIdx] || WIND_MODES[0];
    const powerCoeff = mode.powerCoefficient;

    const maxPower = 1.0 * powerCoeff;
    const midPower = config.halfSwing
      ? 0.5 * powerCoeff
      : ((config.floor + 1.0) / 2) * powerCoeff;
    const minPower = config.halfSwing
      ? 0.25 * powerCoeff
      : config.floor * powerCoeff;

    const baseWpr = (1 + (100 - acc) * 0.02) * config.mult;
    const elevMult = 1 + (Number(elev) || 0) / 100;

    const max = baseWpr / maxPower / elevMult;
    const mid = baseWpr / midPower / elevMult;
    const min = baseWpr / minPower / elevMult;

    return { max, mid, min };
  };

  // Matrix live calculation result for the dial-in accuracy
  const matrixResult = useMemo(() => {
    const { max, mid, min } = calculateAccuracyWpr(
      matrixCalcAcc,
      matrixCategory,
      matrixPowerIdx,
      matrixElevation,
    );

    let effectiveWpr;
    if (matrixCalcDistance <= 50) {
      effectiveWpr = min + (mid - min) * (matrixCalcDistance / 50);
    } else {
      effectiveWpr = mid + (max - mid) * ((matrixCalcDistance - 50) / 50);
    }

    const rings = effectiveWpr > 0 ? matrixCalcWind / effectiveWpr : 0;
    return {
      max,
      mid,
      min,
      effectiveWpr,
      rings,
    };
  }, [
    matrixCalcAcc,
    matrixCategory,
    matrixPowerIdx,
    matrixElevation,
    matrixCalcDistance,
    matrixCalcWind,
  ]);

  // Matrix rows (0 to 100)
  const matrixRows = useMemo(() => {
    const rows = [];
    const step = matrixTableStep;
    for (let acc = 0; acc <= 100; acc += step) {
      const { max, mid, min } = calculateAccuracyWpr(
        acc,
        matrixCategory,
        matrixPowerIdx,
        matrixElevation,
      );
      rows.push({
        accuracy: acc,
        max,
        mid,
        min,
      });
    }
    return rows;
  }, [matrixCategory, matrixPowerIdx, matrixElevation, matrixTableStep]);

  // ----------------------------------------------------
  // SUB-MODE 2: GOLDEN SHOT
  // ----------------------------------------------------
  const goldenClubs = useMemo(() => {
    const list = clubs.filter(
      (c) =>
        c.type === "Golden" ||
        c.name.toLowerCase().includes("golden"),
    );

    // Fallback if seed data has none
    if (list.length === 0) {
      return [
        {
          id: "golden-wood-fallback",
          name: "Golden Wood",
          category: "Woods",
          tour: 0,
          type: "Golden",
          power: [166],
          accuracy: [51],
          maxLevel: 1,
        },
        {
          id: "golden-driver-fallback",
          name: "Golden Driver",
          category: "Drivers",
          tour: 0,
          type: "Golden",
          power: [202],
          accuracy: [83],
          maxLevel: 1,
        },
      ];
    }

    // Sort: Golden Wood first (most common), then Driver, Long Iron, Short Iron, Wedge
    const order = ["Golden Wood", "Golden Driver", "Golden Long Iron", "Golden Short Iron", "Golden Wedge"];
    return [...list].sort((a, b) => {
      const idxA = order.indexOf(a.name);
      const idxB = order.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [clubs]);

  const [selectedGoldenClubId, setSelectedGoldenClubId] = useState(() => {
    const gw = goldenClubs.find((c) => c.name.toLowerCase().includes("wood"));
    return gw?.id || goldenClubs[0]?.id;
  });

  const selectedGoldenClub = useMemo(() => {
    return goldenClubs.find((c) => c.id === selectedGoldenClubId) || goldenClubs[0];
  }, [goldenClubs, selectedGoldenClubId]);

  const [goldenBallName, setGoldenBallName] = useState("Golden");
  const [goldenElevation, setGoldenElevation] = useState(10); // +10% is standard for Golden Wood
  const [goldenDistance, setGoldenDistance] = useState(50);
  const [goldenWind, setGoldenWind] = useState(8.5);

  const selectedGoldenBall = useMemo(() => {
    return (
      balls.find((b) => b.name.toLowerCase() === goldenBallName.toLowerCase()) || {
        name: "Golden",
        power: 1,
        windResistance: 0,
      }
    );
  }, [goldenBallName]);

  const goldenPowerMode = useMemo(() => {
    const pwr = selectedGoldenBall.power ?? 1;
    return WIND_MODES[pwr] || WIND_MODES[0];
  }, [selectedGoldenBall]);

  // Golden Shot calculation
  const goldenResult = useMemo(() => {
    if (!selectedGoldenClub) return { max: 1, mid: 1, min: 1, effectiveWpr: 1, rings: 0 };
    const rows = buildWindPerRingTable(
      selectedGoldenClub,
      1,
      goldenPowerMode,
      goldenElevation,
      1,
    );
    const row = rows[0] || { max: 2, mid: 2, min: 2 };

    let effectiveWpr;
    if (goldenDistance <= 50) {
      effectiveWpr = row.min + (row.mid - row.min) * (goldenDistance / 50);
    } else {
      effectiveWpr = row.mid + (row.max - row.mid) * ((goldenDistance - 50) / 50);
    }

    const rings = effectiveWpr > 0 ? goldenWind / effectiveWpr : 0;
    return {
      max: row.max,
      mid: row.mid,
      min: row.min,
      effectiveWpr,
      rings,
    };
  }, [selectedGoldenClub, goldenPowerMode, goldenElevation, goldenDistance, goldenWind]);

  // ----------------------------------------------------
  // SUB-MODE 3: CHECKPOINT CHALLENGE (CPC)
  // ----------------------------------------------------
  const [cpcActiveCategory, setCpcActiveCategory] = useState("Drivers");
  const [cpcBallName, setCpcBallName] = useState(settings?.ballName || "Basic");
  const [cpcElevation, setCpcElevation] = useState(0);

  // Initialize or load temporary CPC lineup
  const [cpcBag, setCpcBag] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CPC);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Default 7-club starter lineup for CPC
    const defaults = [
      { name: "The Extra Mile", level: 8 },
      { name: "The Sniper", level: 10 },
      { name: "The Backbone", level: 10 },
      { name: "The Thorn", level: 8 },
      { name: "The Dart", level: 9 },
      { name: "The Razor", level: 7 },
      { name: "The Malibu", level: 7 },
    ];

    const built = [];
    defaults.forEach((def) => {
      const found = clubs.find((c) =>
        c.name.toLowerCase().includes(def.name.toLowerCase().replace("the ", "")),
      );
      if (found) {
        built.push({
          clubId: found.id,
          level: Math.min(def.level, found.maxLevel || found.power.length),
        });
      }
    });

    return built.length > 0 ? built : [];
  });

  // Save CPC bag to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CPC, JSON.stringify(cpcBag));
    } catch {}
  }, [cpcBag]);

  // Clubs in active CPC category
  const clubsInCategory = useMemo(() => {
    return clubs.filter((c) => c.category === cpcActiveCategory);
  }, [clubs, cpcActiveCategory]);

  // Current equipped club for active CPC category
  const equippedInActiveCategory = useMemo(() => {
    const match = cpcBag.find((b) => {
      const c = clubs.find((x) => x.id === b.clubId);
      return c?.category === cpcActiveCategory;
    });
    return match || null;
  }, [cpcBag, clubs, cpcActiveCategory]);

  const [cpcSelectedClubId, setCpcSelectedClubId] = useState(() => {
    return equippedInActiveCategory?.clubId || clubsInCategory[0]?.id || "";
  });

  const [cpcSelectedLevel, setCpcSelectedLevel] = useState(() => {
    return equippedInActiveCategory?.level || 8;
  });

  // When active category changes, update selected club to equipped one or first in category
  useEffect(() => {
    if (equippedInActiveCategory) {
      setCpcSelectedClubId(equippedInActiveCategory.clubId);
      setCpcSelectedLevel(equippedInActiveCategory.level);
    } else if (clubsInCategory[0]) {
      setCpcSelectedClubId(clubsInCategory[0].id);
      setCpcSelectedLevel(clubsInCategory[0].maxLevel || clubsInCategory[0].power.length);
    }
  }, [cpcActiveCategory, equippedInActiveCategory, clubsInCategory]);

  const activeCpcClub = useMemo(() => {
    return clubs.find((c) => c.id === cpcSelectedClubId) || clubsInCategory[0] || null;
  }, [clubs, cpcSelectedClubId, clubsInCategory]);

  // Equip selected club into the CPC bag
  const handleEquipToCpc = (clubToEquip, levelToEquip) => {
    if (!clubToEquip) return;
    const cat = clubToEquip.category;
    const nextBag = cpcBag.filter((b) => {
      const c = clubs.find((x) => x.id === b.clubId);
      return c?.category !== cat;
    });

    nextBag.push({
      clubId: clubToEquip.id,
      level: levelToEquip,
    });

    const sorted = sortBagClubs(nextBag, clubs);
    setCpcBag(sorted);
  };

  const handleCpcReorder = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= cpcBag.length) return;
    const updated = [...cpcBag];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCpcBag(updated);
  };

  const handleSortCpcStandard = () => {
    setCpcBag(sortBagClubs(cpcBag, clubs));
  };

  // Ball & mode for CPC
  const cpcBall = useMemo(() => {
    return (
      balls.find((b) => b.name.toLowerCase() === cpcBallName.toLowerCase()) || {
        name: "Basic",
        power: 0,
        windResistance: 0,
      }
    );
  }, [cpcBallName]);

  const cpcPowerMode = useMemo(() => {
    const pwr = cpcBall.power ?? 0;
    return WIND_MODES[pwr] || WIND_MODES[0];
  }, [cpcBall]);

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------
  const handleLoadGoldenToSimulator = () => {
    if (!selectedGoldenClub) return;
    const targetBag = [{ clubId: selectedGoldenClub.id, level: 1 }];
    const targetSettings = {
      ...settings,
      ballName: selectedGoldenBall.name,
      elevation: goldenElevation,
      slider: goldenDistance,
      title: "Golden Shot",
    };

    if (onLoadToSimulator) {
      onLoadToSimulator(targetBag, targetSettings);
    } else {
      if (setBag) setBag(targetBag);
      if (setSettings) setSettings(targetSettings);
    }
  };

  const handleLoadCpcToSimulator = (singleClubOnly = false) => {
    let targetBag;
    if (singleClubOnly && activeCpcClub) {
      targetBag = [{ clubId: activeCpcClub.id, level: cpcSelectedLevel }];
    } else {
      targetBag = cpcBag.length > 0 ? cpcBag : [{ clubId: activeCpcClub.id, level: cpcSelectedLevel }];
    }

    const targetSettings = {
      ...settings,
      ballName: cpcBall.name,
      elevation: cpcElevation,
      title: "Checkpoint Challenge",
    };

    if (onLoadToSimulator) {
      onLoadToSimulator(targetBag, targetSettings);
    } else {
      if (setBag) setBag(targetBag);
      if (setSettings) setSettings(targetSettings);
    }
  };

  return (
    <Box
      className={`universal-chart-panel ${isWidgetMode ? "is-widget" : ""}`}
      bg="var(--surface-1)"
      border="1px solid var(--border)"
      borderRadius="var(--radius-lg)"
      p={isWidgetMode ? "8px" : "16px"}
      boxShadow="var(--shadow-md)"
    >
      {/* Top Main Mode Header & Tabs */}
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap="8px"
        mb="12px"
        pb={isWidgetMode ? "6px" : "10px"}
        borderBottom="1px solid var(--border)"
      >
        {isWidgetMode ? (
          <Flex align="center" gap="6px">
            <Trophy size={16} style={{ color: "#eab308" }} />
            <Text fontSize="0.85rem" fontWeight="800" m="0" color="var(--text-primary)">
              Universal Reference Chart
            </Text>
          </Flex>
        ) : (
          <Text fontSize="0.75rem" color="var(--text-muted)" m="0">
            Quick chart works for any club · Golden Shot & Checkpoint Challenge tools
          </Text>
        )}

        {/* 4 Main Mode Switcher Pills */}
        <Flex
          bg="var(--surface-2)"
          p="3px"
          borderRadius="var(--radius-sm)"
          border="1px solid var(--border)"
          gap="2px"
          maxW="100%"
          overflowX="auto"
          className="no-scrollbar"
          css={{ "& button": { whiteSpace: "nowrap", flexShrink: 0 } }}
        >
          <button
            type="button"
            className={`universal-subtab-btn ${activeTab === "quick" ? "is-active" : ""}`}
            onClick={() => setActiveTab("quick")}
            title="Quick Chart: one generic table for any club, no setup"
          >
            <Zap size={13} style={{ marginRight: "4px", color: "#22c55e" }} />
            Quick
          </button>
          <button
            type="button"
            className={`universal-subtab-btn ${activeTab === "matrix" ? "is-active" : ""}`}
            onClick={() => setActiveTab("matrix")}
            title="Universal Accuracy Matrix: 0 to 100 Accuracy reference table"
          >
            <Target size={13} style={{ marginRight: "4px" }} />
            {isWidgetMode ? "Matrix" : "Accuracy Matrix"}
          </button>
          <button
            type="button"
            className={`universal-subtab-btn ${activeTab === "golden" ? "is-active" : ""}`}
            onClick={() => setActiveTab("golden")}
            title="Golden Shot: Golden Wood & Golden Driver presets with Golden Ball and Elevation"
          >
            <Award size={13} style={{ marginRight: "4px", color: "#eab308" }} />
            Golden Shot
          </button>
          <button
            type="button"
            className={`universal-subtab-btn ${activeTab === "cpc" ? "is-active" : ""}`}
            onClick={() => setActiveTab("cpc")}
            title="Checkpoint Challenge: Quick on-the-fly club and level lookup without saving to bag"
          >
            <Zap size={13} style={{ marginRight: "4px", color: "#3b82f6" }} />
            {isWidgetMode ? "CPC" : "Checkpoint (CPC)"}
          </button>
        </Flex>
      </Flex>

      {activeTab === "quick" && <QuickChart isWidgetMode={isWidgetMode} />}

      {/* ==================================================== */}
      {/* 1. ACCURACY MATRIX TAB                               */}
      {/* ==================================================== */}
      {activeTab === "matrix" && (
        <Box className="universal-matrix-view">
          {/* Controls Bar */}
          <Flex
            direction="column"
            gap="10px"
            bg="var(--surface-2)"
            p="10px"
            borderRadius="var(--radius-md)"
            border="1px solid var(--border)"
            mb="12px"
          >
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap="10px"
            >
              {/* Category Selector */}
              <Flex align="center" gap="6px" flex="1" minW="180px">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Category:
                </Text>
                <select
                  className="hud-club-select"
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                    background: "var(--surface-1)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    height: "32px",
                  }}
                  value={matrixCategory}
                  onChange={(e) => setMatrixCategory(e.target.value)}
                >
                  <option value="All">All Clubs (Normalized 1.0)</option>
                  <option value="Drivers">Drivers (240y)</option>
                  <option value="Woods">Woods (180y)</option>
                  <option value="LongIrons">Long Irons (135y)</option>
                  <option value="ShortIrons">Short Irons (90y)</option>
                  <option value="Wedges">Wedges (45y)</option>
                  <option value="RoughIrons">Rough Irons (135y, 1.45×)</option>
                  <option value="SandWedges">Sand Wedges (120y, 1.15×)</option>
                </select>
              </Flex>

              {/* Ball Power Selector */}
              <Flex align="center" gap="6px">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Ball:
                </Text>
                <Flex gap="3px">
                  {WIND_MODES.map((mode, idx) => (
                    <button
                      key={mode.name}
                      type="button"
                      className={`hud-calc-preset-btn ${matrixPowerIdx === idx ? "is-active" : ""}`}
                      onClick={() => setMatrixPowerIdx(idx)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                      title={`${mode.name} (${mode.powerCoefficient}×)`}
                    >
                      P{idx}
                    </button>
                  ))}
                </Flex>
              </Flex>

              {/* Elevation */}
              <Flex align="center" gap="6px">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Elev:
                </Text>
                <Flex align="center" gap="3px">
                  <button
                    type="button"
                    className="hud-calc-stepper-btn"
                    onClick={() => setMatrixElevation((prev) => Math.max(-50, prev - 5))}
                    title="Decrease elevation by 5%"
                    style={{ padding: "3px 6px", height: "26px", fontSize: "0.75rem" }}
                  >
                    -5%
                  </button>
                  <Box
                    px="8px"
                    py="2px"
                    bg="var(--surface-1)"
                    border="1px solid var(--border)"
                    borderRadius="var(--radius-sm)"
                    fontSize="0.8rem"
                    fontWeight="bold"
                    color={
                      matrixElevation > 0
                        ? "#22c55e"
                        : matrixElevation < 0
                        ? "#f59e0b"
                        : "var(--text-primary)"
                    }
                  >
                    {matrixElevation > 0 ? `+${matrixElevation}%` : `${matrixElevation}%`}
                  </Box>
                  <button
                    type="button"
                    className="hud-calc-stepper-btn"
                    onClick={() => setMatrixElevation((prev) => Math.min(50, prev + 5))}
                    title="Increase elevation by 5%"
                    style={{ padding: "3px 6px", height: "26px", fontSize: "0.75rem" }}
                  >
                    +5%
                  </button>
                  {matrixElevation !== 0 && (
                    <button
                      type="button"
                      className="hud-calc-stepper-btn"
                      onClick={() => setMatrixElevation(0)}
                      title="Reset elevation to 0%"
                      style={{ padding: "3px 6px", height: "26px", fontSize: "0.7rem" }}
                    >
                      0%
                    </button>
                  )}
                </Flex>
              </Flex>
            </Flex>

            {/* Quick Accuracy Dial-in Calculator */}
            <Box
              bg="var(--surface-1)"
              p="10px"
              borderRadius="var(--radius-sm)"
              border="1px solid var(--border)"
            >
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap="10px"
                mb="8px"
              >
                <Flex align="center" gap="8px">
                  <Text fontSize="0.78rem" fontWeight="bold" color="var(--text-primary)">
                    Target Accuracy:
                  </Text>
                  <Flex align="center" gap="4px">
                    <button
                      type="button"
                      className="hud-calc-stepper-btn"
                      onClick={() => setMatrixCalcAcc((prev) => Math.max(0, prev - 1))}
                      style={{ height: "24px", width: "24px", padding: 0 }}
                    >
                      <Minus size={12} />
                    </button>
                    <Input
                      size="xs"
                      width="48px"
                      textAlign="center"
                      fontWeight="bold"
                      value={matrixCalcAcc}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setMatrixCalcAcc(Math.max(0, Math.min(100, val)));
                      }}
                      borderColor={getAccuracyColor(matrixCalcAcc)}
                    />
                    <button
                      type="button"
                      className="hud-calc-stepper-btn"
                      onClick={() => setMatrixCalcAcc((prev) => Math.min(100, prev + 1))}
                      style={{ height: "24px", width: "24px", padding: 0 }}
                    >
                      <Plus size={12} />
                    </button>
                  </Flex>
                  <Box
                    px="6px"
                    py="1px"
                    borderRadius="4px"
                    fontSize="0.7rem"
                    fontWeight="800"
                    color="#fff"
                    bg={getAccuracyColor(matrixCalcAcc)}
                  >
                    Acc {matrixCalcAcc}
                  </Box>
                </Flex>

                <Flex align="center" gap="8px">
                  <Text fontSize="0.78rem" fontWeight="bold" color="var(--text-primary)">
                    Wind Speed:
                  </Text>
                  <Flex align="center" gap="4px">
                    <Input
                      size="xs"
                      width="54px"
                      textAlign="center"
                      fontWeight="bold"
                      value={matrixCalcWind}
                      type="number"
                      step="0.1"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setMatrixCalcWind(Math.max(0.1, val));
                      }}
                    />
                    <Text fontSize="0.75rem" color="var(--text-muted)">mph</Text>
                  </Flex>
                </Flex>

                {/* Big Adjustment Result Pill */}
                <Flex
                  align="center"
                  gap="8px"
                  bg="var(--surface-2)"
                  px="12px"
                  py="4px"
                  borderRadius="20px"
                  border="1px solid var(--border-strong)"
                >
                  <Text fontSize="0.75rem" color="var(--text-muted)" m="0">
                    Adjustment:
                  </Text>
                  <Text
                    fontSize="1.15rem"
                    fontWeight="900"
                    color="var(--brand-primary, #3b82f6)"
                    m="0"
                  >
                    {matrixResult.rings.toFixed(1)}{" "}
                    <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>rings</span>
                  </Text>
                  <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                    ({matrixResult.effectiveWpr.toFixed(2)} WPR)
                  </Text>
                </Flex>
              </Flex>

              {/* Continuous Distance Slider */}
              <DistanceSlider
                value={matrixCalcDistance}
                onChange={setMatrixCalcDistance}
                wpr={matrixResult.effectiveWpr}
                accentColor="var(--brand-primary, #3b82f6)"
                isCompact={true}
              />
            </Box>
          </Flex>

          {/* Matrix Table Toolbar */}
          <Flex justify="space-between" align="center" mb="6px">
            <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-secondary)">
              Universal Ring Table (Accuracy 0 → 100)
            </Text>
            <Flex gap="6px" align="center">
              <button
                type="button"
                className={`hud-calc-preset-btn ${matrixTableStep === 10 ? "is-active" : ""}`}
                onClick={() => setMatrixTableStep(10)}
                style={{ padding: "2px 6px", fontSize: "0.68rem" }}
              >
                Steps of 10
              </button>
              <button
                type="button"
                className={`hud-calc-preset-btn ${matrixTableStep === 5 ? "is-active" : ""}`}
                onClick={() => setMatrixTableStep(5)}
                style={{ padding: "2px 6px", fontSize: "0.68rem" }}
              >
                Steps of 5
              </button>
              <button
                type="button"
                className={`hud-calc-preset-btn ${matrixTableMode === "wpr" ? "is-active" : ""}`}
                onClick={() => setMatrixTableMode(matrixTableMode === "wpr" ? "rings" : "wpr")}
                style={{ padding: "2px 6px", fontSize: "0.68rem" }}
                title="Toggle between Wind-per-Ring and Rings-for-10mph"
              >
                {matrixTableMode === "wpr" ? "Show 10mph Rings" : "Show WPR"}
              </button>
            </Flex>
          </Flex>

          {/* The Universal Matrix Table */}
          <Box
            className="club-chart-table-wrap"
            overflowX="auto"
          >
            <table className="wind-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Acc</th>
                  <th>Max WPR</th>
                  <th>Mid WPR</th>
                  <th>Min WPR</th>
                  <th>1 Ring</th>
                  <th>2 Rings</th>
                  <th>3 Rings</th>
                  <th>5 Rings</th>
                  <th>10 Rings</th>
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row) => {
                  const isHighlighted =
                    Math.abs(row.accuracy - matrixCalcAcc) < matrixTableStep / 2;
                  const accColor = getAccuracyColor(row.accuracy);
                  return (
                    <tr
                      key={row.accuracy}
                      style={
                        isHighlighted
                          ? {
                              backgroundColor: "rgba(59, 130, 246, 0.12)",
                              fontWeight: "bold",
                            }
                          : {}
                      }
                      onClick={() => setMatrixCalcAcc(row.accuracy)}
                      className="matrix-table-row"
                    >
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: accColor,
                            color: "#fff",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                          }}
                        >
                          {row.accuracy}
                        </span>
                      </td>
                      <td style={{ color: "var(--ring-1)" }}>{row.max.toFixed(2)}</td>
                      <td style={{ color: "var(--ring-2)" }}>{row.mid.toFixed(2)}</td>
                      <td style={{ color: "var(--ring-3)" }}>{row.min.toFixed(2)}</td>
                      <td>{(row.max * 1).toFixed(1)}</td>
                      <td>{(row.max * 2).toFixed(1)}</td>
                      <td>{(row.max * 3).toFixed(1)}</td>
                      <td>{(row.max * 5).toFixed(1)}</td>
                      <td>{(row.max * 10).toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>
      )}

      {/* ==================================================== */}
      {/* 2. GOLDEN SHOT TAB                                   */}
      {/* ==================================================== */}
      {activeTab === "golden" && (
        <Box className="universal-golden-view">
          {/* Golden Club Selector Banner */}
          <Flex
            gap="8px"
            overflowX="auto"
            pb="8px"
            mb="12px"
            align="center"
            className="no-scrollbar"
          >
            {goldenClubs.map((club) => {
              const isSelected = club.id === selectedGoldenClubId;
              return (
                <button
                  key={club.id}
                  type="button"
                  className={`golden-club-chip ${isSelected ? "is-active" : ""}`}
                  onClick={() => setSelectedGoldenClubId(club.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected
                      ? "2px solid #eab308"
                      : "1px solid var(--border)",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.08))"
                      : "var(--surface-2)",
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  <Image
                    src={getClubImageUrl(club.name, "32x32")}
                    alt=""
                    width="26px"
                    height="26px"
                    objectFit="contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <Box textAlign="left">
                    <Text fontSize="0.82rem" fontWeight="bold" m="0" lineHeight="1.2">
                      {club.name}
                    </Text>
                    <Text fontSize="0.68rem" color="var(--text-muted)" m="0">
                      Power {club.power[0]} · Acc {club.accuracy[0]}
                    </Text>
                  </Box>
                </button>
              );
            })}
          </Flex>

          {/* Golden Controls & Live Adjustment HUD */}
          {selectedGoldenClub && (
            <Flex
              direction="column"
              gap="10px"
              bg="var(--surface-2)"
              p="12px"
              borderRadius="var(--radius-md)"
              border="1px solid var(--border)"
              mb="12px"
            >
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap="10px"
              >
                {/* Ball selector */}
                <Flex align="center" gap="6px">
                  <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                    Ball:
                  </Text>
                  <button
                    type="button"
                    className={`hud-calc-preset-btn ${goldenBallName === "Golden" ? "is-active" : ""}`}
                    onClick={() => setGoldenBallName("Golden")}
                    style={{ padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    🏆 Golden Ball (P1)
                  </button>
                  <button
                    type="button"
                    className={`hud-calc-preset-btn ${goldenBallName === "Basic" ? "is-active" : ""}`}
                    onClick={() => setGoldenBallName("Basic")}
                    style={{ padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    ⚪ Basic Ball (P0)
                  </button>
                </Flex>

                {/* Golden Elevation Presets (Standard Golden Shot Guide Elevations) */}
                <Flex align="center" gap="6px">
                  <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                    Elev:
                  </Text>
                  <Flex gap="3px" flexWrap="wrap">
                    {[0, 5, 10, 15, 20, 25, 30].map((elevVal) => (
                      <button
                        key={elevVal}
                        type="button"
                        className={`hud-calc-preset-btn ${goldenElevation === elevVal ? "is-active" : ""}`}
                        onClick={() => setGoldenElevation(elevVal)}
                        style={{ padding: "2px 7px", fontSize: "0.72rem", fontWeight: 700 }}
                      >
                        +{elevVal}%
                      </button>
                    ))}
                  </Flex>
                </Flex>
              </Flex>

              {/* Golden Shot Wind & Result Display */}
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap="10px"
                bg="var(--surface-1)"
                p="10px"
                borderRadius="var(--radius-sm)"
                border="1px solid var(--border)"
              >
                <Flex align="center" gap="8px">
                  <Text fontSize="0.8rem" fontWeight="bold" color="var(--text-primary)">
                    Wind:
                  </Text>
                  <Flex align="center" gap="4px">
                    <button
                      type="button"
                      className="hud-calc-stepper-btn"
                      onClick={() => setGoldenWind((prev) => Math.max(0.1, Number((prev - 0.5).toFixed(1))))}
                      style={{ height: "26px", width: "26px", padding: 0 }}
                    >
                      <Minus size={12} />
                    </button>
                    <Input
                      size="sm"
                      width="60px"
                      textAlign="center"
                      fontWeight="800"
                      value={goldenWind}
                      type="number"
                      step="0.1"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setGoldenWind(Math.max(0.1, val));
                      }}
                    />
                    <button
                      type="button"
                      className="hud-calc-stepper-btn"
                      onClick={() => setGoldenWind((prev) => Number((prev + 0.5).toFixed(1)))}
                      style={{ height: "26px", width: "26px", padding: 0 }}
                    >
                      <Plus size={12} />
                    </button>
                    <Text fontSize="0.75rem" color="var(--text-muted)">mph</Text>
                  </Flex>
                </Flex>

                {/* Big Result Box */}
                <Flex
                  align="center"
                  gap="12px"
                  bg="linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.05))"
                  px="16px"
                  py="6px"
                  borderRadius="20px"
                  border="1px solid rgba(234, 179, 8, 0.4)"
                >
                  <Box>
                    <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                      Rings Pull
                    </Text>
                    <Text fontSize="1.3rem" fontWeight="900" color="#eab308" m="0" lineHeight="1">
                      {goldenResult.rings.toFixed(1)}
                    </Text>
                  </Box>
                  <Box textAlign="right" fontSize="0.72rem" color="var(--text-secondary)">
                    <Text m="0">WPR: <strong>{goldenResult.effectiveWpr.toFixed(2)}</strong></Text>
                    <Text m="0" color="var(--text-muted)">
                      Max {goldenResult.max.toFixed(2)} · Mid {goldenResult.mid.toFixed(2)} · Min {goldenResult.min.toFixed(2)}
                    </Text>
                  </Box>
                </Flex>

                {/* Load to Simulator Button */}
                <Button
                  size="sm"
                  colorScheme="yellow"
                  bg="#eab308"
                  color="#000"
                  fontWeight="bold"
                  fontSize="0.78rem"
                  leftIcon={<Play size={14} />}
                  onClick={handleLoadGoldenToSimulator}
                  title="Load this Golden Club and settings into the main Simulator"
                >
                  Load in Simulator
                </Button>
              </Flex>

              {/* Golden Shot Distance Slider */}
              <DistanceSlider
                value={goldenDistance}
                onChange={setGoldenDistance}
                club={selectedGoldenClub}
                wpr={goldenResult.effectiveWpr}
                accentColor="#eab308"
                isCompact={true}
              />
            </Flex>
          )}

          {/* Golden Club Chart Card */}
          {selectedGoldenClub && (
            <ClubChartCard
              club={selectedGoldenClub}
              level={1}
              mode={goldenPowerMode}
              settings={{
                ...settings,
                ballName: selectedGoldenBall.name,
                elevation: goldenElevation,
                variant: settings?.variant || "ring",
              }}
              isFullscreen={false}
            />
          )}
        </Box>
      )}

      {/* ==================================================== */}
      {/* 3. CHECKPOINT CHALLENGE (CPC) TAB                    */}
      {/* ==================================================== */}
      {activeTab === "cpc" && (
        <Box className="universal-cpc-view">
          {/* Explanation Header */}
          <Flex
            justify="space-between"
            align="center"
            bg="var(--surface-2)"
            p="8px 12px"
            borderRadius="var(--radius-sm)"
            border="1px solid var(--border)"
            mb="12px"
            flexWrap="wrap"
            gap="8px"
          >
            <Box>
              <Text fontSize="0.82rem" fontWeight="bold" color="var(--text-primary)" m="0">
                Checkpoint Challenge Quick Roster
              </Text>
              <Text fontSize="0.7rem" color="var(--text-muted)" m="0">
                Temporary lineup for CPC runs — never overwrites your saved bags.
              </Text>
            </Box>
            <Flex gap="6px" align="center">
              <Button
                size="xs"
                variant="outline"
                leftIcon={<ArrowUpDown size={11} />}
                onClick={handleSortCpcStandard}
                title="Sort CPC Lineup into canonical in-game order"
              >
                Game Order
              </Button>
              <Button
                size="xs"
                colorScheme="blue"
                leftIcon={<Play size={11} />}
                onClick={() => handleLoadCpcToSimulator(false)}
                title="Load full Checkpoint Challenge roster into Simulator"
              >
                Load CPC in Simulator
              </Button>
            </Flex>
          </Flex>

          {/* Category Switcher Tabs */}
          <Flex
            gap="4px"
            overflowX="auto"
            pb="6px"
            mb="10px"
            className="no-scrollbar"
          >
            {CATEGORY_ORDER.map((catKey) => {
              const isSelected = catKey === cpcActiveCategory;
              const equipped = cpcBag.find((b) => {
                const c = clubs.find((x) => x.id === b.clubId);
                return c?.category === catKey;
              });
              const equippedClub = equipped ? clubs.find((x) => x.id === equipped.clubId) : null;

              return (
                <button
                  key={catKey}
                  type="button"
                  className={`cpc-cat-pill ${isSelected ? "is-active" : ""}`}
                  onClick={() => setCpcActiveCategory(catKey)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: isSelected
                      ? `2px solid ${accentVar(catKey)}`
                      : "1px solid var(--border)",
                    background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                    color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <CategoryIcon category={catKey} size={14} />
                  <span>{catKey.replace("Irons", " Iron").replace("Wedges", " Wedge")}</span>
                  {equippedClub && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        backgroundColor: "var(--surface-1)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {equippedClub.name.replace(/^The\s/i, "")} {equipped.level}
                    </span>
                  )}
                </button>
              );
            })}
          </Flex>

          {/* Quick On-the-Fly Club & Level Selector for Selected Category */}
          <Flex
            direction="column"
            gap="10px"
            bg="var(--surface-2)"
            p="10px"
            borderRadius="var(--radius-md)"
            border="1px solid var(--border)"
            mb="12px"
          >
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap="10px"
            >
              {/* Select Club in this Category */}
              <Flex align="center" gap="8px" flex="1" minW="220px">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Club:
                </Text>
                <select
                  className="hud-club-select"
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    background: "var(--surface-1)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    height: "32px",
                  }}
                  value={cpcSelectedClubId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setCpcSelectedClubId(nextId);
                    const found = clubs.find((c) => c.id === nextId);
                    if (found) {
                      setCpcSelectedLevel(
                        Math.min(cpcSelectedLevel, found.maxLevel || found.power.length),
                      );
                    }
                  }}
                >
                  {clubsInCategory.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name} ({club.type})
                    </option>
                  ))}
                </select>
              </Flex>

              {/* Ball Selector for CPC */}
              <Flex align="center" gap="6px">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Ball:
                </Text>
                <select
                  className="hud-club-select"
                  style={{
                    width: "130px",
                    padding: "4px 8px",
                    fontSize: "0.78rem",
                    background: "var(--surface-1)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    height: "32px",
                  }}
                  value={cpcBallName}
                  onChange={(e) => setCpcBallName(e.target.value)}
                >
                  {balls.slice(0, 15).map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} (P{b.power ?? 0})
                    </option>
                  ))}
                </select>
              </Flex>

              {/* Elevation */}
              <Flex align="center" gap="6px">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Elev:
                </Text>
                <Flex align="center" gap="3px">
                  <button
                    type="button"
                    className="hud-calc-stepper-btn"
                    onClick={() => setCpcElevation((prev) => Math.max(-50, prev - 5))}
                    style={{ padding: "2px 6px", height: "24px", fontSize: "0.72rem" }}
                  >
                    -5%
                  </button>
                  <Box
                    px="6px"
                    py="1px"
                    bg="var(--surface-1)"
                    border="1px solid var(--border)"
                    borderRadius="var(--radius-sm)"
                    fontSize="0.75rem"
                    fontWeight="bold"
                  >
                    {cpcElevation > 0 ? `+${cpcElevation}%` : `${cpcElevation}%`}
                  </Box>
                  <button
                    type="button"
                    className="hud-calc-stepper-btn"
                    onClick={() => setCpcElevation((prev) => Math.min(50, prev + 5))}
                    style={{ padding: "2px 6px", height: "24px", fontSize: "0.72rem" }}
                  >
                    +5%
                  </button>
                </Flex>
              </Flex>

              {/* Equip Action */}
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Check size={14} />}
                onClick={() => handleEquipToCpc(activeCpcClub, cpcSelectedLevel)}
                title="Equip this club and level to your CPC lineup"
              >
                Equip to CPC Lineup
              </Button>
            </Flex>

            {/* Level Picker for active club */}
            {activeCpcClub && (
              <Flex align="center" gap="8px" flexWrap="wrap">
                <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-muted)">
                  Level:
                </Text>
                <LevelPicker
                  club={activeCpcClub}
                  level={cpcSelectedLevel}
                  onChange={setCpcSelectedLevel}
                  isCompact={true}
                />
              </Flex>
            )}
          </Flex>

          {/* Active Club Card Preview */}
          {activeCpcClub && (
            <Box mb="12px">
              <ClubChartCard
                club={activeCpcClub}
                level={cpcSelectedLevel}
                mode={cpcPowerMode}
                settings={{
                  ...settings,
                  ballName: cpcBall.name,
                  elevation: cpcElevation,
                  variant: settings?.variant || "ring",
                }}
                isFullscreen={false}
              />
            </Box>
          )}

          {/* CPC Lineup Cards List */}
          {cpcBag.length > 0 && (
            <Box mt="16px">
              <Flex justify="space-between" align="center" mb="8px">
                <Heading as="h4" fontSize="0.85rem" color="var(--text-primary)" m="0">
                  Full CPC Lineup ({cpcBag.length} clubs)
                </Heading>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setCpcBag([])}
                  color="var(--text-muted)"
                >
                  Clear Lineup
                </Button>
              </Flex>

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: isWidgetMode ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
                }}
                gap="10px"
              >
                {cpcBag.map((item, idx) => {
                  const club = clubs.find((c) => c.id === item.clubId);
                  if (!club) return null;
                  return (
                    <ClubChartCard
                      key={`${club.id}-${idx}`}
                      club={club}
                      level={item.level}
                      mode={cpcPowerMode}
                      settings={{
                        ...settings,
                        ballName: cpcBall.name,
                        elevation: cpcElevation,
                        variant: settings?.variant || "ring",
                      }}
                      isFullscreen={false}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < cpcBag.length - 1}
                      onMoveUp={() => handleCpcReorder(idx, idx - 1)}
                      onMoveDown={() => handleCpcReorder(idx, idx + 1)}
                    />
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Knowledge Links Footer */}
      <Flex
        justify="space-between"
        align="center"
        mt="14px"
        pt="10px"
        borderTop="1px solid var(--border)"
        fontSize="0.72rem"
        color="var(--text-muted)"
        flexWrap="wrap"
        gap="8px"
      >
        <Flex align="center" gap="4px">
          <Info size={12} />
          <span>Need elevation reading rules or pullback tips?</span>
        </Flex>
        <Flex gap="8px">
          {navigate && (
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  onClose?.();
                  navigate("/tips");
                }}
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  color: "var(--brand-primary, #3b82f6)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                💡 Vetted Tips
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  onClose?.();
                  navigate("/resources");
                }}
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  color: "#10b981",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📖 Community Resources
              </button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
