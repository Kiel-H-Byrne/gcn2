import React from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { Sliders, Minus, Plus } from "lucide-react";

export default function DistanceSlider({
  value = 50,
  onChange,
  club,
  currentPower,
  wpr,
  accentColor = "var(--calc-accent, var(--brand-primary, #3b82f6))",
  isCompact = false,
}) {
  const distance = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  const handleSliderChange = (e) => {
    onChange(Number(e.target.value));
  };

  const handleNudge = (delta) => {
    const next = Math.max(0, Math.min(100, distance + delta));
    onChange(next);
  };

  const handleDirectInput = (e) => {
    const raw = e.target.value;
    if (raw === "") return;
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      onChange(Math.max(0, Math.min(100, num)));
    }
  };

  const getPositionDescription = (val) => {
    if (val === 0) return "Min (0%)";
    if (val === 50) return "Mid (50%)";
    if (val === 100) return "Max (100%)";
    if (val < 50) return `${val}% · Min to Mid`;
    return `${val}% · Mid to Max`;
  };

  const PRESETS = [
    { label: "Min (0%)", shortLabel: "Min", val: 0 },
    { label: "25%", shortLabel: "25%", val: 25 },
    { label: "Mid (50%)", shortLabel: "Mid", val: 50 },
    { label: "75%", shortLabel: "75%", val: 75 },
    { label: "Max (100%)", shortLabel: "Max", val: 100 },
  ];

  return (
    <Box
      className="shot-slider-container"
      bg="var(--surface-2)"
      border="1px solid var(--border-strong)"
      borderRadius="var(--radius-md)"
      p={isCompact ? "8px 10px" : "12px 14px"}
      width="100%"
    >
      {/* Header row */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="6px"
        mb={isCompact ? "6px" : "8px"}
      >
        <Flex align="center" gap="6px">
          <Sliders size={isCompact ? 14 : 16} color={accentColor} />
          <Text
            fontSize={isCompact ? "0.74rem" : "0.82rem"}
            fontWeight="700"
            color="var(--text-primary)"
            m="0"
          >
            {isCompact ? "Slider" : "Club Slider (Distance)"}
          </Text>
          <Box
            bg="var(--surface-1)"
            border="1px solid var(--border)"
            px="6px"
            py="1px"
            borderRadius="6px"
            fontSize={isCompact ? "0.68rem" : "0.72rem"}
            fontWeight="bold"
            color={accentColor}
          >
            {getPositionDescription(distance)}
          </Box>
        </Flex>

        {currentPower !== undefined && wpr !== undefined && !isCompact && (
          <Flex align="center" gap="10px" fontSize="0.72rem" color="var(--text-secondary)">
            <span>
              Power: <strong>{currentPower.toFixed(1)} yds</strong>
            </span>
            <span>
              WPR: <strong style={{ color: "var(--brand-primary, #2563eb)" }}>{wpr.toFixed(2)} mph</strong>
            </span>
          </Flex>
        )}
      </Flex>

      {/* Slider Track with fill */}
      <Box position="relative" mb="6px">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={distance}
          onChange={handleSliderChange}
          className="shot-slider-range"
          style={{
            width: "100%",
            accentColor: accentColor,
            cursor: "pointer",
            height: isCompact ? "18px" : "22px",
            margin: "0",
          }}
          aria-label="Club distance slider percentage (0 to 100 in 1% increments)"
        />
        {/* Track Markings */}
        <Flex justify="space-between" px="2px" mt="-2px">
          <Text fontSize="0.65rem" fontWeight="600" color={distance === 0 ? accentColor : "var(--text-muted)"}>
            0% (Min)
          </Text>
          {!isCompact && (
            <Text fontSize="0.65rem" color={distance === 25 ? accentColor : "var(--text-muted)"}>
              25%
            </Text>
          )}
          <Text fontSize="0.65rem" fontWeight="600" color={distance === 50 ? accentColor : "var(--text-muted)"}>
            50% (Mid)
          </Text>
          {!isCompact && (
            <Text fontSize="0.65rem" color={distance === 75 ? accentColor : "var(--text-muted)"}>
              75%
            </Text>
          )}
          <Text fontSize="0.65rem" fontWeight="600" color={distance === 100 ? accentColor : "var(--text-muted)"}>
            100% (Max)
          </Text>
        </Flex>
      </Box>

      {/* Preset buttons & 1% Nudge steppers */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="6px" mt={isCompact ? "4px" : "8px"}>
        <Flex gap="4px" wrap="wrap">
          {PRESETS.map((p) => {
            const isActive = distance === p.val;
            return (
              <Button
                key={p.val}
                size="xs"
                variant={isActive ? "solid" : "outline"}
                onClick={() => onChange(p.val)}
                h={isCompact ? "22px" : "26px"}
                px={isCompact ? "6px" : "8px"}
                fontSize={isCompact ? "0.68rem" : "0.72rem"}
                fontWeight={isActive ? "700" : "500"}
                bg={isActive ? accentColor : "var(--surface-1)"}
                color={isActive ? "#fff" : "var(--text-primary)"}
                borderColor={isActive ? "transparent" : "var(--border-strong)"}
                _hover={{
                  bg: isActive ? accentColor : "var(--surface-3)",
                }}
              >
                {isCompact ? p.shortLabel : p.label}
              </Button>
            );
          })}
        </Flex>

        {/* 1% Fine tune steppers & direct numeric input */}
        <Flex align="center" gap="4px">
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleNudge(-1)}
            disabled={distance <= 0}
            title="Step down 1%"
            h={isCompact ? "22px" : "26px"}
            w={isCompact ? "22px" : "26px"}
            p="0"
            bg="var(--surface-1)"
          >
            <Minus size={12} />
          </Button>
          <Flex
            align="center"
            bg="var(--surface-1)"
            border="1px solid var(--border-strong)"
            borderRadius="4px"
            px="4px"
            h={isCompact ? "22px" : "26px"}
          >
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={distance}
              onChange={handleDirectInput}
              style={{
                width: isCompact ? "28px" : "34px",
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                fontWeight: "bold",
                fontSize: isCompact ? "0.75rem" : "0.8rem",
                textAlign: "right",
                padding: "0",
                outline: "none",
              }}
              aria-label="Exact slider percentage"
            />
            <Text fontSize="0.7rem" color="var(--text-muted)" ml="1px" fontWeight="600">
              %
            </Text>
          </Flex>
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleNudge(1)}
            disabled={distance >= 100}
            title="Step up 1%"
            h={isCompact ? "22px" : "26px"}
            w={isCompact ? "22px" : "26px"}
            p="0"
            bg="var(--surface-1)"
          >
            <Plus size={12} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
