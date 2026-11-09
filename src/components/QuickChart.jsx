import { Box, Flex, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { buildGenericRingsPerWindTable } from "../lib/wind";

// One-tap accuracy tiers. Default is the middle tier -- a sensible stand-in for
// "any club" when you have no time to look up the real accuracy stat.
const TIERS = [
  { id: "low", label: "Low", accuracy: 40 },
  { id: "avg", label: "Avg", accuracy: 60 },
  { id: "high", label: "High", accuracy: 80 },
];

/**
 * Default view of the Universal Chart: a single, glanceable rings-per-wind
 * table that works for any club. No sliders, no club/level pickers.
 */
export default function QuickChart({ isWidgetMode = false }) {
  const [tierId, setTierId] = useState("avg");
  const tier = TIERS.find((t) => t.id === tierId) || TIERS[1];

  const rows = useMemo(
    () => buildGenericRingsPerWindTable(tier.accuracy, { minWind: 1, maxWind: 16, step: 1 }),
    [tier],
  );

  if (isWidgetMode) {
    const half = Math.ceil(rows.length / 2);
    const leftCol = rows.slice(0, half);
    const rightCol = rows.slice(half);

    return (
      <Box className="universal-quick-view is-widget">
        <Flex justify="space-between" align="center" mb="4px" gap="6px">
          <Text fontSize="0.72rem" color="var(--text-muted)" m="0" fontWeight="600">
            Generic Ring Adjustment
          </Text>
          <Flex
            gap="2px"
            p="2px"
            bg="var(--surface-2)"
            border="1px solid var(--border)"
            borderRadius="var(--radius-sm)"
            role="group"
            aria-label="Club accuracy"
          >
            {TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`universal-subtab-btn ${tierId === t.id ? "is-active" : ""}`}
                onClick={() => setTierId(t.id)}
                aria-pressed={tierId === t.id}
                style={{ minHeight: "26px", minWidth: "42px", padding: "2px 6px", fontSize: "0.72rem" }}
              >
                {t.label}
              </button>
            ))}
          </Flex>
        </Flex>

        <Box className="club-chart-table-wrap quick-chart-widget-wrap">
          <table className="wind-table wind-table-print">
            <thead>
              <tr>
                <th style={{ width: "36px" }}>Wind</th>
                <th style={{ background: "var(--ring-1)" }}>Max</th>
                <th style={{ background: "var(--ring-2)" }}>Mid</th>
                <th style={{ background: "var(--ring-3)" }}>Min</th>
                <th className="print-split" style={{ width: "36px" }}>Wind</th>
                <th style={{ background: "var(--ring-1)" }}>Max</th>
                <th style={{ background: "var(--ring-2)" }}>Mid</th>
                <th style={{ background: "var(--ring-3)" }}>Min</th>
              </tr>
            </thead>
            <tbody>
              {leftCol.map((lRow, idx) => {
                const rRow = rightCol[idx];
                return (
                  <tr key={lRow.wind}>
                    <td style={{ fontWeight: 800 }}>{lRow.wind}</td>
                    <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{lRow.max.toFixed(1)}</td>
                    <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{lRow.mid.toFixed(1)}</td>
                    <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{lRow.min.toFixed(1)}</td>
                    {rRow ? (
                      <>
                        <td className="print-split" style={{ fontWeight: 800 }}>{rRow.wind}</td>
                        <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{rRow.max.toFixed(1)}</td>
                        <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{rRow.mid.toFixed(1)}</td>
                        <td style={{ fontWeight: 700, fontSize: "0.85rem" }}>{rRow.min.toFixed(1)}</td>
                      </>
                    ) : (
                      <>
                        <td className="print-split"></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="universal-quick-view">
      <Flex justify="space-between" align="center" mb="6px" gap="8px">
        <Text fontSize="0.72rem" color="var(--text-muted)" m="0">
          Rings to adjust into the wind
        </Text>
        <Flex
          gap="2px"
          p="3px"
          bg="var(--surface-2)"
          border="1px solid var(--border)"
          borderRadius="var(--radius-sm)"
          role="group"
          aria-label="Club accuracy"
        >
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`universal-subtab-btn ${tierId === t.id ? "is-active" : ""}`}
              onClick={() => setTierId(t.id)}
              aria-pressed={tierId === t.id}
              style={{ minHeight: "34px", minWidth: "48px" }}
            >
              {t.label}
            </button>
          ))}
        </Flex>
      </Flex>

      <Box
        className="club-chart-table-wrap"
        overflowX="auto"
      >
        <table className="wind-table">
          <thead>
            <tr>
              <th style={{ width: "56px" }}>Wind</th>
              <th style={{ background: "var(--ring-1)" }}>Max</th>
              <th style={{ background: "var(--ring-2)" }}>Mid</th>
              <th style={{ background: "var(--ring-3)" }}>Min</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.wind}>
                <td style={{ fontWeight: 800 }}>{row.wind}</td>
                <td style={{ fontWeight: 700, fontSize: "1rem" }}>{row.max.toFixed(1)}</td>
                <td style={{ fontWeight: 700, fontSize: "1rem" }}>{row.mid.toFixed(1)}</td>
                <td style={{ fontWeight: 700, fontSize: "1rem" }}>{row.min.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}
