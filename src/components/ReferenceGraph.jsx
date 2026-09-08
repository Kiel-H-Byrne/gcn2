import { Box, Flex, Text } from "@chakra-ui/react";
import { useState, useRef, useMemo } from "react";
import { Calculator } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { accentVar } from "../utils";

function getClubAbbr(name) {
  const words = name.replace(/^The\s/i, "").split(" ");
  if (words.length > 1) {
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 3);
  }
  return words[0].substring(0, 4);
}

export default function ReferenceGraph({
  bag = [],
  clubs = [],
  settings = {},
  savedProfiles = {},
  isWidgetMode = false,
}) {
  const [selectedProfileKey, setSelectedProfileKey] = useState("__active__");
  const [distanceMode, setDistanceMode] = useState("max"); // "max" (1.0), "mid" (0.75), "min" (0.50)
  const [selectedWind, setSelectedWind] = useState(8.0);
  const [hoveredClubId, setHoveredClubId] = useState(null);

  const distanceRatio =
    distanceMode === "max" ? 1.0 : distanceMode === "mid" ? 0.75 : 0.5;

  // Resolve current active bag clubs data based on selected profile dropdown
  const currentBag = useMemo(() => {
    if (selectedProfileKey === "__active__") {
      return bag;
    }
    return savedProfiles[selectedProfileKey]?.bag || bag;
  }, [selectedProfileKey, bag, savedProfiles]);

  // Extract club items with levels and accuracy from the selected bag
  const bagClubs = useMemo(() => {
    if (!currentBag || currentBag.length === 0) return [];
    return currentBag
      .map((entry) => {
        const club = clubs.find((c) => c.id === entry.clubId);
        if (!club) return null;
        const level = Math.min(
          Math.max(entry.level || 1, 1),
          club.maxLevel || club.accuracy.length
        );
        const accuracy = club.accuracy[level - 1] ?? 0;
        const ringValue = Number((2 - accuracy * 0.01).toFixed(2));
        return {
          ...entry,
          club,
          level,
          accuracy,
          ringValue,
          abbr: getClubAbbr(club.name),
        };
      })
      .filter(Boolean);
  }, [currentBag, clubs]);

  const hoveredClub = useMemo(() => {
    if (!hoveredClubId) return null;
    return bagClubs.find((c) => c.club.id === hoveredClubId) || null;
  }, [hoveredClubId, bagClubs]);

  // Graph Coordinate Geometry
  // ViewBox: 0 0 520 250
  // Plot Area: left=40, right=435, top=22, bottom=205
  const plotLeft = 40;
  const plotRight = 435;
  const plotTop = 22;
  const plotBottom = 205;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const maxWindAxis = 25;
  const maxRingsAxis = 25;

  const getX = (wind) => plotLeft + (wind / maxWindAxis) * plotWidth;
  const getY = (rings) => plotBottom - (rings / maxRingsAxis) * plotHeight;

  // Calculate lines for each club in the bag
  const clubLines = useMemo(() => {
    const lines = bagClubs.map((item, idx) => {
      const ringVal = item.ringValue;
      const effectiveWpr = ringVal / distanceRatio;
      const maxRingsAtMaxWind = (maxWindAxis / ringVal) * distanceRatio;
      let endWind = maxWindAxis;
      let endRings = maxRingsAtMaxWind;

      if (maxRingsAtMaxWind > maxRingsAxis) {
        endRings = maxRingsAxis;
        endWind = (maxRingsAxis * ringVal) / distanceRatio;
      }

      const x1 = getX(0);
      const y1 = getY(0);
      const x2 = getX(endWind);
      const y2 = getY(endRings);

      const curRings = (selectedWind / ringVal) * distanceRatio;
      const curX = getX(selectedWind);
      const curY = getY(Math.min(maxRingsAxis, curRings));

      return {
        ...item,
        idx,
        effectiveWpr,
        x1,
        y1,
        x2,
        y2,
        curX,
        curY,
        curRings,
        endWind,
        endRings,
        badgeY: y2,
      };
    });

    // Anti-collision sorting for right-side badge pills
    lines.sort((a, b) => a.y2 - b.y2);
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].badgeY - lines[i - 1].badgeY < 14) {
        lines[i].badgeY = lines[i - 1].badgeY + 14;
      }
    }

    // Keep all badges strictly inside visible vertical boundaries
    if (lines.length > 0) {
      const lastBadge = lines[lines.length - 1];
      const maxAllowedY = plotBottom + 4;
      if (lastBadge.badgeY > maxAllowedY) {
        const overflow = lastBadge.badgeY - maxAllowedY;
        for (let i = 0; i < lines.length; i++) {
          lines[i].badgeY = Math.max(plotTop + 6, lines[i].badgeY - overflow);
        }
      }
    }

    return lines;
  }, [bagClubs, distanceRatio, selectedWind]);

  // Graph touch/mouse interaction handler
  const svgRef = useRef(null);
  const handleGraphPointer = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const svgX = ((clientX - rect.left) / rect.width) * 520;
    const wind = Math.max(
      0,
      Math.min(16, ((svgX - plotLeft) / plotWidth) * maxWindAxis)
    );
    setSelectedWind(Number(wind.toFixed(1)));
  };

  return (
    <Box
      className="formula-reference-container"
      style={{
        width: "100%",
        maxWidth: isWidgetMode ? "100%" : "640px",
        margin: "0 auto",
      }}
    >
      {/* Top Bar: Bag Selector Dropdown & Distance Mode Toggles */}
      <Flex
        justify="space-between"
        align="center"
        gap="6px"
        flexWrap="wrap"
        bg="var(--surface-2)"
        p="4px 8px"
        borderRadius="var(--radius-sm)"
        border="1px solid var(--border)"
        mb="4px"
      >
        {/* Bag Selector Dropdown */}
        <Flex align="center" gap="6px" flex="1" minW="140px">
          <Text
            fontSize="0.7rem"
            fontWeight="bold"
            color="var(--text-muted)"
            whiteSpace="nowrap"
          >
            Bag:
          </Text>
          <select
            value={selectedProfileKey}
            onChange={(e) => setSelectedProfileKey(e.target.value)}
            className="hud-club-select"
            style={{
              padding: "2px 6px",
              fontSize: "0.72rem",
              height: "26px",
              flex: "1",
              minWidth: "115px",
              background: "var(--surface-1)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
            aria-label="Select Golf Bag to Reference"
          >
            <option value="__active__">
              {settings.title?.trim() || "Active Bag"} ({bag.length} clubs)
            </option>
            {Object.entries(savedProfiles).map(([name, prof]) => {
              if (name === settings.title && selectedProfileKey === "__active__")
                return null;
              return (
                <option key={name} value={name}>
                  {name} ({prof.bag?.length || 0} clubs)
                </option>
              );
            })}
          </select>
        </Flex>

        {/* Distance Toggles */}
        <Flex
          bg="var(--surface-1)"
          p="2px"
          borderRadius="var(--radius-sm)"
          border="1px solid var(--border)"
          gap="2px"
          role="group"
          aria-label="Distance Extension Selection"
        >
          {[
            { id: "max", label: "Max" },
            { id: "mid", label: "Mid" },
            { id: "min", label: "Min" },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              className={`widget-tab ${distanceMode === d.id ? "is-active" : ""}`}
              style={{
                padding: "2px 8px",
                fontSize: "0.68rem",
                height: "auto",
              }}
              onClick={() => setDistanceMode(d.id)}
              aria-pressed={distanceMode === d.id}
            >
              {d.label}
            </button>
          ))}
        </Flex>
      </Flex>

      {/* Dynamic Compact Formula Bar */}
      <Box
        bg="var(--surface-1)"
        p="4px 8px"
        borderRadius="var(--radius-sm)"
        border="1px solid var(--border-strong)"
        mb="6px"
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4px">
          <Flex
            align="center"
            gap="4px"
            fontSize="0.74rem"
            fontWeight="600"
            color="var(--text-primary)"
            flexWrap="wrap"
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.66rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginRight: "2px",
              }}
            >
              Formula:
            </span>
            <span>Rings =</span>
            <span
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                lineHeight: "1",
                padding: "0 2px",
              }}
            >
              <span
                style={{
                  borderBottom: "1.5px solid var(--text-primary)",
                  padding: "0 4px",
                  fontSize: "0.72rem",
                }}
              >
                Wind Speed
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--accent, #3b82f6)",
                }}
              >
                2 − (Acc × 0.01)
              </span>
            </span>
            <span>×</span>
            <span
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--brand-primary)",
                color: "var(--brand-primary)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontWeight: "800",
                fontSize: "0.7rem",
              }}
              title={`Distance Factor: Max=1.00x, Mid=0.75x, Min=0.50x. Currently ${distanceRatio}x`}
            >
              {distanceRatio.toFixed(2)}× ({distanceMode.toUpperCase()})
            </span>
          </Flex>

          {hoveredClub ? (
            <Flex
              align="center"
              gap="4px"
              fontSize="0.7rem"
              color="var(--text-secondary)"
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: accentVar(hoveredClub.club.category),
                }}
              >
                {hoveredClub.abbr} {hoveredClub.level}:
              </span>
              <span>
                {selectedWind} ÷ {hoveredClub.ringValue.toFixed(2)} ×{" "}
                {distanceRatio} ={" "}
                <strong style={{ color: "var(--brand-primary)" }}>
                  {(
                    (selectedWind / hoveredClub.ringValue) *
                    distanceRatio
                  ).toFixed(2)}
                  r
                </strong>
              </span>
            </Flex>
          ) : (
            <Text fontSize="0.66rem" color="var(--text-muted)">
              WPR @ Dist = Base WPR ÷ {distanceRatio.toFixed(2)}
            </Text>
          )}
        </Flex>
      </Box>

      {/* SVG Multi-Club Graph */}
      {bagClubs.length === 0 ? (
        <Box
          p="20px 14px"
          textAlign="center"
          bg="var(--surface-1)"
          border="1px dashed var(--border)"
          borderRadius="var(--radius-md)"
          color="var(--text-muted)"
          fontSize="0.8rem"
          mb="6px"
        >
          No clubs in this bag. Please select another bag or add clubs in the
          Bag Editor.
        </Box>
      ) : (
        <Box
          bg="var(--surface-1)"
          p="4px 6px 2px"
          borderRadius="var(--radius-md)"
          border="1px solid var(--border)"
          mb="6px"
          boxShadow="var(--shadow-sm)"
        >
          <Flex justify="space-between" align="center" px="2px" mb="1px">
            <Text
              fontSize="0.66rem"
              fontWeight="bold"
              color="var(--text-muted)"
              textTransform="uppercase"
              letterSpacing="0.04em"
            >
              Wind vs. Rings ({distanceMode.toUpperCase()} Distance)
            </Text>
            <Text fontSize="0.68rem" color="var(--text-secondary)">
              Wind:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {selectedWind} mph
              </strong>
            </Text>
          </Flex>

          <Box position="relative" width="100%">
            <svg
              viewBox="0 0 520 250"
              ref={svgRef}
              style={{
                width: "100%",
                height: "auto",
                cursor: "crosshair",
                touchAction: "none",
                display: "block",
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                handleGraphPointer(e);
              }}
              onPointerMove={(e) => {
                if (e.buttons > 0 || (e.touches && e.touches.length > 0)) {
                  handleGraphPointer(e);
                }
              }}
              role="img"
              aria-label={`Graph plotting wind speed against ring adjustments for clubs in ${selectedProfileKey === "__active__" ? "active bag" : selectedProfileKey}`}
            >
              {/* Horizontal Gridlines (Rings 0, 5, 10, 15, 20, 25) */}
              {[0, 5, 10, 15, 20, 25].map((rings) => {
                const y = getY(rings);
                return (
                  <g key={`y-${rings}`}>
                    <line
                      x1={plotLeft}
                      y1={y}
                      x2={plotRight}
                      y2={y}
                      stroke="var(--border)"
                      strokeWidth={rings === 0 ? "1" : "0.5"}
                      strokeDasharray={rings === 0 ? "none" : "2,2"}
                      opacity={rings === 0 ? "0.9" : "0.6"}
                    />
                    <text
                      x={plotLeft - 5}
                      y={y + 2.5}
                      textAnchor="end"
                      fontSize="7"
                      fill="var(--text-muted)"
                      fontFamily="monospace"
                    >
                      {rings}r
                    </text>
                  </g>
                );
              })}

              {/* Vertical Gridlines (Wind 0, 5, 10, 15, 20, 25 mph) */}
              {[0, 5, 10, 15, 20, 25].map((wind) => {
                const x = getX(wind);
                return (
                  <g key={`x-${wind}`}>
                    <line
                      x1={x}
                      y1={plotTop}
                      x2={x}
                      y2={plotBottom}
                      stroke="var(--border)"
                      strokeWidth={wind === 0 ? "1" : "0.5"}
                      strokeDasharray={wind === 0 ? "none" : "2,2"}
                      opacity={wind === 0 ? "0.9" : "0.6"}
                    />
                    <text
                      x={x}
                      y={plotBottom + 11}
                      textAnchor="middle"
                      fontSize="7"
                      fill="var(--text-muted)"
                      fontFamily="monospace"
                    >
                      {wind}m
                    </text>
                  </g>
                );
              })}

              {/* Axis Titles with safe margins */}
              <text
                x={plotLeft + plotWidth / 2}
                y={236}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="600"
                fill="var(--text-secondary)"
                letterSpacing="0.04em"
              >
                WIND SPEED (MPH)
              </text>
              <text
                x={12}
                y={plotTop + plotHeight / 2}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="600"
                fill="var(--text-secondary)"
                letterSpacing="0.04em"
                transform={`rotate(-90, 12, ${plotTop + plotHeight / 2})`}
              >
                RINGS
              </text>

              {/* Lines for Each Club in the Selected Bag */}
              {clubLines.map((item) => {
                const color = accentVar(item.club.category);
                const isHovered = hoveredClubId === item.club.id;

                return (
                  <g
                    key={item.club.id}
                    onMouseEnter={() => setHoveredClubId(item.club.id)}
                    onMouseLeave={() => setHoveredClubId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Slope Line */}
                    <line
                      x1={item.x1}
                      y1={item.y1}
                      x2={item.x2}
                      y2={item.y2}
                      stroke={color}
                      strokeWidth={isHovered ? "2.6" : "1.5"}
                      strokeLinecap="round"
                      opacity={hoveredClubId && !isHovered ? 0.3 : 1}
                    />

                    {/* Connecting guide to badge if offset */}
                    {Math.abs(item.badgeY - item.y2) > 1.5 && (
                      <line
                        x1={item.x2}
                        y1={item.y2}
                        x2={item.x2 + 4}
                        y2={item.badgeY}
                        stroke={color}
                        strokeWidth="0.75"
                        strokeDasharray="1.5,1.5"
                        opacity="0.5"
                      />
                    )}

                    {/* End Label Pill with generous width so text never overflows */}
                    <g transform={`translate(${item.x2 + 4}, ${item.badgeY})`}>
                      <rect
                        x="0"
                        y="-6"
                        width="72"
                        height="13"
                        rx="3"
                        fill="var(--surface-2)"
                        stroke={color}
                        strokeWidth={isHovered ? "1.4" : "0.75"}
                      />
                      <text
                        x="36"
                        y="3.2"
                        textAnchor="middle"
                        fontSize="6.8"
                        fontWeight="bold"
                        fill="var(--text-primary)"
                        fontFamily="monospace"
                      >
                        {item.abbr} {item.level} ({item.effectiveWpr.toFixed(1)})
                      </text>
                    </g>

                    {/* Point Marker at selected wind */}
                    {item.curRings <= maxRingsAxis && selectedWind > 0 && (
                      <circle
                        cx={item.curX}
                        cy={item.curY}
                        r={isHovered ? "3.5" : "2.2"}
                        fill={color}
                        stroke="var(--surface-1)"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}

              {/* Selected Wind Vertical Cursor Line */}
              {selectedWind > 0 && (
                <g>
                  <line
                    x1={getX(selectedWind)}
                    y1={plotTop}
                    x2={getX(selectedWind)}
                    y2={plotBottom}
                    stroke="var(--text-primary)"
                    strokeWidth="1"
                    strokeDasharray="2.5,2.5"
                    opacity="0.7"
                  />
                  {/* Clamped wind mileage badge so it never clips at 0 or 16 */}
                  <g
                    transform={`translate(${Math.max(
                      plotLeft + 16,
                      Math.min(plotRight - 16, getX(selectedWind))
                    )}, ${plotTop - 4})`}
                  >
                    <rect
                      x="-16"
                      y="-13"
                      width="32"
                      height="13"
                      rx="2.5"
                      fill="var(--text-primary)"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="bold"
                      fill="var(--surface-1)"
                      fontFamily="monospace"
                    >
                      {selectedWind}m
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </Box>
        </Box>
      )}

      {/* Wind Slider Scrub Control */}
      <Box
        bg="var(--surface-2)"
        p="4px 8px"
        borderRadius="var(--radius-sm)"
        border="1px solid var(--border)"
        mb="6px"
      >
        <Flex justify="space-between" align="center" mb="1px">
          <Flex align="center" gap="4px">
            <Calculator size={12} color="var(--brand-primary)" />
            <Text fontSize="0.68rem" color="var(--text-muted)" fontWeight="bold">
              Scrub Wind Speed
            </Text>
          </Flex>
          <Text fontSize="0.75rem" fontWeight="bold" color="var(--text-primary)">
            {selectedWind} mph
          </Text>
        </Flex>
        <input
          type="range"
          min="1"
          max="25"
          step="0.5"
          value={selectedWind}
          onChange={(e) => setSelectedWind(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: "var(--brand-primary)",
            cursor: "pointer",
            height: "14px",
          }}
          aria-label="Wind speed in mph"
        />
      </Box>

      {/* Bag Clubs Calculation Table */}
      {bagClubs.length > 0 && (
        <Box
          bg="var(--surface-1)"
          p="4px 6px"
          borderRadius="var(--radius-sm)"
          border="1px solid var(--border)"
        >
          <Box overflowX="auto">
            <table
              className="wind-table"
              style={{ width: "100%", fontSize: "0.7rem", lineHeight: "1.2" }}
              aria-label="Clubs in selected bag calculation table"
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "3px 4px" }} scope="col">
                    Club
                  </th>
                  <th
                    style={{ padding: "3px 4px" }}
                    scope="col"
                    title="Club Accuracy Stat (0–100)"
                  >
                    Acc
                  </th>
                  <th
                    style={{ padding: "3px 4px" }}
                    scope="col"
                    title="Base Wind Per Ring at Max extension = 2 − (Acc × 0.01)"
                  >
                    Base WPR
                  </th>
                  <th
                    style={{
                      padding: "3px 4px",
                      color:
                        distanceRatio !== 1.0
                          ? "var(--brand-primary)"
                          : "inherit",
                      fontWeight: distanceRatio !== 1.0 ? "bold" : "normal",
                    }}
                    scope="col"
                    title="Effective Wind Per Ring at current distance = Base WPR ÷ Distance Ratio"
                  >
                    WPR ({distanceMode})
                  </th>
                  <th
                    style={{ padding: "3px 4px" }}
                    scope="col"
                    title="Rings to adjust for selected wind speed"
                  >
                    Rings ({selectedWind}m)
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubLines.map((item) => {
                  const color = accentVar(item.club.category);
                  const isHovered = hoveredClubId === item.club.id;
                  const finalRings = (
                    (selectedWind / item.ringValue) *
                    distanceRatio
                  ).toFixed(2);

                  return (
                    <tr
                      key={item.club.id}
                      style={{
                        background: isHovered
                          ? "var(--surface-2)"
                          : "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredClubId(item.club.id)}
                      onMouseLeave={() => setHoveredClubId(null)}
                      tabIndex={0}
                      onFocus={() => setHoveredClubId(item.club.id)}
                      onBlur={() => setHoveredClubId(null)}
                      aria-label={`${item.club.name} level ${item.level}, accuracy ${item.accuracy}, base WPR ${item.ringValue.toFixed(2)}, effective WPR ${item.effectiveWpr.toFixed(2)}, rings adjustment ${finalRings}`}
                    >
                      <td
                        style={{
                          textAlign: "left",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 4px",
                        }}
                      >
                        <CategoryIcon
                          category={item.club.category}
                          size={12}
                          style={{ color }}
                        />
                        <span>{item.club.name}</span>
                        <span
                          style={{
                            fontSize: "0.58rem",
                            padding: "0 3px",
                            borderRadius: "5px",
                            background: color,
                            color: "#fff",
                          }}
                        >
                          Lv {item.level}
                        </span>
                      </td>
                      <td style={{ fontWeight: "bold", padding: "3px 4px" }}>
                        {item.accuracy}
                      </td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          padding: "3px 4px",
                        }}
                      >
                        {item.ringValue.toFixed(2)}
                      </td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "600",
                          padding: "3px 4px",
                          color:
                            distanceRatio !== 1.0
                              ? "var(--brand-primary)"
                              : "inherit",
                        }}
                      >
                        {item.effectiveWpr.toFixed(2)}
                      </td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "800",
                          fontSize: "0.78rem",
                          color: "var(--brand-primary)",
                          padding: "3px 4px",
                        }}
                      >
                        {finalRings}r
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>
      )}
    </Box>
  );
}
