import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import balls from "../data/balls";
import {
  WIND_MODES,
  buildRingsPerWindTable,
  buildWindPerRingTable,
} from "../lib/wind";
import { accentVar, getClubImageUrl, sortBagClubs } from "../utils";
import CategoryIcon from "./CategoryIcon";

function getAccuracyColor(acc) {
  if (acc < 20) return "#dc2626"; // Dark Red
  if (acc < 40) return "#ea580c"; // Orange
  if (acc < 60) return "#eab308"; // Yellow
  if (acc < 85) return "#3b82f6"; // Blue
  return "#22c55e"; // Bright Green
}

function ringShadeStyle(ringValue) {
  const ringIdx = (Math.max(0, Math.ceil(ringValue) - 1) % 5) + 1;
  return { backgroundColor: `var(--ring-${ringIdx})` };
}

function WindTableRing({ club, level, mode, elevation }) {
  const rows = buildWindPerRingTable(club, level, mode, elevation, 10);
  return (
    <table className="wind-table">
      <thead>
        <tr>
          <th>Ring</th>
          <th>Max</th>
          <th>Mid</th>
          <th>Min</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.ring}>
            <td>{row.ring}</td>
            <td style={ringShadeStyle(row.ring)}>{row.max.toFixed(1)}</td>
            <td style={ringShadeStyle(row.ring)}>{row.mid.toFixed(1)}</td>
            <td style={ringShadeStyle(row.ring)}>{row.min.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WindTableWind({ club, level, mode, elevation, windStep }) {
  const rows = buildRingsPerWindTable(club, level, mode, elevation, {
    minWind: 1,
    maxWind: 25,
    step: windStep,
  });
  return (
    <table className="wind-table">
      <thead>
        <tr>
          <th>Wind</th>
          <th>Max</th>
          <th>Mid</th>
          <th>Min</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.wind}>
            <td>{row.wind.toFixed(1)}</td>
            <td style={ringShadeStyle(row.max)}>{row.max.toFixed(1)}</td>
            <td style={ringShadeStyle(row.mid)}>{row.mid.toFixed(1)}</td>
            <td style={ringShadeStyle(row.min)}>{row.min.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintTable({ club, level, mode, settings, shorthandHeaders }) {
  const L_WIND = shorthandHeaders ? "W" : "Wind";
  const L_RING = shorthandHeaders ? "R" : "Ring";
  const L_MAX = shorthandHeaders ? "Mx" : "Max";
  const L_MID = shorthandHeaders ? "Md" : "Mid";
  const L_MIN = shorthandHeaders ? "Mn" : "Min";

  if (settings.variant === "ring") {
    const rows = buildWindPerRingTable(
      club,
      level,
      mode,
      settings.elevation,
      10,
    );
    const left = rows.slice(0, 5);
    const right = rows.slice(5, 10);
    return (
      <table className="wind-table wind-table-print">
        <thead>
          <tr>
            <th>{L_RING}</th>
            <th>{L_MAX}</th>
            <th>{L_MID}</th>
            <th>{L_MIN}</th>
            <th className="print-split">{L_RING}</th>
            <th>{L_MAX}</th>
            <th>{L_MID}</th>
            <th>{L_MIN}</th>
          </tr>
        </thead>
        <tbody>
          {left.map((l, i) => {
            const r = right[i];
            return (
              <tr key={l.ring}>
                <td>{l.ring}</td>
                <td style={ringShadeStyle(l.ring)}>{l.max.toFixed(1)}</td>
                <td style={ringShadeStyle(l.ring)}>{l.mid.toFixed(1)}</td>
                <td style={ringShadeStyle(l.ring)}>{l.min.toFixed(1)}</td>
                <td className="print-split">{r.ring}</td>
                <td style={ringShadeStyle(r.ring)}>{r.max.toFixed(1)}</td>
                <td style={ringShadeStyle(r.ring)}>{r.mid.toFixed(1)}</td>
                <td style={ringShadeStyle(r.ring)}>{r.min.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  } else {
    const rows = buildRingsPerWindTable(club, level, mode, settings.elevation, {
      minWind: 1,
      maxWind: 25,
      step: settings.windStep,
    });
    const numCols = 4;
    const rowsPerCol = Math.ceil(rows.length / numCols);
    const cols = [];
    for (let i = 0; i < numCols; i++) {
      cols.push(rows.slice(i * rowsPerCol, (i + 1) * rowsPerCol));
    }
    return (
      <table className="wind-table wind-table-print">
        <thead>
          <tr>
            {cols.map((_, i) => (
              <React.Fragment key={`th-${i}`}>
                {i > 0 ? (
                  <th className="print-split">{L_WIND}</th>
                ) : (
                  <th>{L_WIND}</th>
                )}
                <th>{L_MAX}</th>
                <th>{L_MID}</th>
                <th>{L_MIN}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowsPerCol }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {cols.map((col, colIndex) => {
                const cell = col[rowIndex];
                if (!cell) {
                  return (
                    <React.Fragment key={`empty-${colIndex}`}>
                      <td className={colIndex > 0 ? "print-split" : ""}></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={`cell-${colIndex}`}>
                    <td className={colIndex > 0 ? "print-split" : ""}>
                      {cell.wind.toFixed(1)}
                    </td>
                    <td style={ringShadeStyle(cell.max)}>
                      {cell.max.toFixed(1)}
                    </td>
                    <td style={ringShadeStyle(cell.mid)}>
                      {cell.mid.toFixed(1)}
                    </td>
                    <td style={ringShadeStyle(cell.min)}>
                      {cell.min.toFixed(1)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export function ClubChartCard({
  club,
  level,
  mode,
  settings,
  isFullscreen,
  canMoveUp = false,
  canMoveDown = false,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const accuracy = club.accuracy[level - 1];
  const accColor = getAccuracyColor(accuracy);
  const accentColor = accentVar(club.category);

  return (
    <Box
      className="club-chart-card"
      style={{ "--chart-accent": accentColor }}
      bg="var(--surface-1)"
      border="1px solid var(--border)"
      borderRadius="var(--radius-md)"
      borderTop={`4px solid ${accentColor}`}
      overflow="hidden"
      boxShadow="var(--shadow-sm)"
      pageBreakInside="avoid"
      breakInside="avoid"
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Flex
        className="club-chart-head"
        align="center"
        justify="space-between"
        gap="6px"
        bg="var(--surface-2)"
        borderBottom="1px solid var(--border)"
      >
        <Flex align="center" gap="8px" flex="1" minW="0">
          <Image
            src={getClubImageUrl(club.name, "32x32")}
            alt=""
            className="club-chart-img"
            objectFit="contain"
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.nextElementSibling)
                e.target.nextElementSibling.style.display = "block";
            }}
          />
          <Box display="none">
            <CategoryIcon category={club.category} size={24} />
          </Box>
          <Flex direction="column" minW="0" flex="1">
            <Heading
              as="h4"
              m="0"
              className="club-chart-name"
              color="var(--text-primary)"
              lineHeight="1.2"
              title={`${club.name} (${club.category})`}
            >
              {club.name}
            </Heading>
            {!isFullscreen && (
              <Flex align="center" gap="6px" mt="2px" className="club-chart-sub">
                <Text color="var(--text-secondary)">Lv {level}</Text>
                <span>·</span>
                <Text color="var(--text-muted)">Pwr {club.power[level - 1]}</Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Right side: Acc badge, and move controls on standard desktop view */}
        <Flex align="center" gap="6px" flexShrink={0}>
          {!isFullscreen && (canMoveUp || canMoveDown) && (
            <Flex
              className="club-chart-move-controls no-print"
              align="center"
              gap="2px"
            >
              <button
                type="button"
                className="club-reorder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp?.();
                }}
                disabled={!canMoveUp}
                title={`Move ${club.name} earlier/up in bag`}
                aria-label={`Move ${club.name} earlier`}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="club-reorder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown?.();
                }}
                disabled={!canMoveDown}
                title={`Move ${club.name} later/down in bag`}
                aria-label={`Move ${club.name} later`}
              >
                <ChevronDown size={14} />
              </button>
            </Flex>
          )}

          <Flex
            align="center"
            gap="3px"
            className="acc-badge"
            borderRadius="4px"
            border="1px solid"
            borderColor={accColor}
            bg={`${accColor}18`}
            px="5px"
            py="1px"
            fontSize="0.7rem"
            fontWeight="700"
          >
            {isFullscreen && (
              <Text as="span" color="var(--text-secondary)" fontWeight="600" mr="2px">
                L{level}
              </Text>
            )}
            <Text as="span" color="var(--text-muted)" fontWeight="500">
              Acc
            </Text>
            <Text as="strong" color={accColor}>
              {accuracy}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {!isFullscreen ? (
        <>
          <Box className="club-chart-table-wrap screen-only" overflowX="auto">
            {settings.variant === "ring" ? (
              <WindTableRing
                club={club}
                level={level}
                mode={mode}
                elevation={settings.elevation}
              />
            ) : (
              <WindTableWind
                club={club}
                level={level}
                mode={mode}
                elevation={settings.elevation}
                windStep={settings.windStep}
              />
            )}
          </Box>
          <Box className="club-chart-table-wrap print-only">
            <PrintTable
              club={club}
              level={level}
              mode={mode}
              settings={settings}
              shorthandHeaders={true}
            />
          </Box>
        </>
      ) : (
        <Box className="club-chart-table-wrap">
          <PrintTable
            club={club}
            level={level}
            mode={mode}
            settings={settings}
            shorthandHeaders
          />
        </Box>
      )}
    </Box>
  );
}

export default function ChartOutput({
  bag,
  setBag,
  clubs,
  settings,
  isWidgetMode,
  onReorderClub,
}) {
  if (bag.length === 0) {
    return (
      <Flex
        className="chart-empty"
        justify="center"
        align="center"
        p="32px"
        border="2px dashed var(--border)"
        borderRadius="var(--radius-lg)"
        color="var(--text-muted)"
        fontStyle="italic"
        bg="var(--surface-1)"
      >
        Add clubs to your bag to build a wind chart.
      </Flex>
    );
  }

  const selectedBall =
    balls.find((b) => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];

  const handleMove = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= bag.length) return;
    if (onReorderClub) {
      onReorderClub(index, target);
      return;
    }
    if (setBag) {
      const newBag = [...bag];
      const [item] = newBag.splice(index, 1);
      newBag.splice(target, 0, item);
      setBag(newBag);
    }
  };

  const handleDragDrop = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= bag.length) return;
    if (onReorderClub) {
      onReorderClub(fromIndex, toIndex);
      return;
    }
    if (setBag) {
      const newBag = [...bag];
      const [item] = newBag.splice(fromIndex, 1);
      newBag.splice(toIndex, 0, item);
      setBag(newBag);
    }
  };

  const handleSortStandard = () => {
    const sorted = sortBagClubs(bag, clubs);
    if (setBag) {
      setBag(sorted);
    }
  };

  const canReorder = Boolean(setBag || onReorderClub);

  if (isWidgetMode) {
    return (
      <Box className="fullscreen-body widget-charts-grid" mt="2px">
        {bag.map((entry) => {
          const club = clubs.find((c) => c.id === entry.clubId);
          if (!club) return null;
          const level = Math.min(Math.max(entry.level, 1), club.maxLevel);
          return (
            <ClubChartCard
              key={club.id}
              club={club}
              level={level}
              mode={mode}
              settings={settings}
              isFullscreen
            />
          );
        })}
      </Box>
    );
  }

  return (
    <Box as="section" className="chart-output" mt="24px">
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="8px"
        mb="16px"
        pb="10px"
        borderBottom="1px solid var(--border)"
      >
        <Box>
          <Heading
            as="h2"
            fontSize="1.15rem"
            fontWeight="700"
            m="0"
            color="var(--text-primary)"
            display="flex"
            alignItems="center"
            gap="8px"
            flexWrap="wrap"
          >
            <span>Wind Adjustment Charts</span>
            <Box
              as="span"
              bg="var(--surface-2)"
              border="1px solid var(--border)"
              px="8px"
              py="2px"
              borderRadius="12px"
              fontSize="0.75rem"
              color="var(--text-secondary)"
              fontWeight="600"
            >
              {bag.length} clubs
            </Box>
            {bag.length > 1 && canReorder && (
              <Button
                size="xs"
                variant="outline"
                onClick={handleSortStandard}
                fontSize="0.72rem"
                h="24px"
                px="8px"
                title="Sort clubs in standard in-game order (Drivers -> Sand Wedges)"
              >
                <ArrowUpDown size={12} style={{ marginRight: "4px" }} />
                Game Order
              </Button>
            )}
          </Heading>
          <Text fontSize="0.78rem" color="var(--text-muted)" m="2px 0 0">
            {selectedBall.name} Ball (P{selectedBall.power}) ·{" "}
            {settings.variant === "ring" ? "Wind per Ring" : "Rings per Wind"}
            {Number(settings.elevation) !== 0
              ? ` · ${Number(settings.elevation) > 0 ? "+" : ""}${settings.elevation}% Elev`
              : ""}
            {bag.length > 1 && canReorder && " · Use ▲ / ▼ to reposition ring charts in bag"}
          </Text>
        </Box>

        {settings.notes?.trim() && (
          <Box
            bg="var(--surface-2)"
            px="12px"
            py="6px"
            borderRadius="var(--radius-sm)"
            border="1px solid var(--border)"
            fontSize="0.78rem"
            color="var(--text-secondary)"
            maxW={{ base: "100%", sm: "420px" }}
            whiteSpace="pre-wrap"
            lineHeight="1.3"
          >
            <strong>Notes:</strong> {settings.notes.trim()}
          </Box>
        )}
      </Flex>

      <Box
        className="chart-cards-grid"
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
        gap="16px"
        alignItems="start"
      >
        {bag.map((entry, idx) => {
          const club = clubs.find((c) => c.id === entry.clubId);
          if (!club) return null;
          const level = Math.min(Math.max(entry.level, 1), club.maxLevel);
          return (
            <ClubChartCard
              key={club.id}
              club={club}
              level={level}
              mode={mode}
              settings={settings}
              canMoveUp={canReorder && idx > 0}
              canMoveDown={canReorder && idx < bag.length - 1}
              onMoveUp={() => handleMove(idx, -1)}
              onMoveDown={() => handleMove(idx, 1)}
              onDragStart={(e) => e.dataTransfer?.setData("text/plain", String(idx))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const from = parseInt(e.dataTransfer?.getData("text/plain"), 10);
                if (!isNaN(from)) handleDragDrop(from, idx);
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
