import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { Maximize, X } from "lucide-react";

export default function Header({ isWidgetMode, setIsWidgetMode, theme, setTheme }) {
  return (
    <Box as="header" mb={isWidgetMode ? "4px" : "20px"}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="8px">
          <img src="/pwa-192x192.png" alt="The Caddie's Compass – Golf Clash Wind Chart Calculator" style={{ width: isWidgetMode ? "18px" : "32px", height: isWidgetMode ? "18px" : "32px", borderRadius: "50%" }} />
          <Heading as="h1" fontSize={isWidgetMode ? "0.95rem" : "1.8rem"} fontFamily="'Playfair Display', serif" fontWeight="700" letterSpacing="-0.01em">
            <span aria-hidden="true">The Caddie's Compass</span>
            <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
              Golf Clash Ring System Calculator – Wind Chart &amp; Ring Adjustments
            </span>
          </Heading>
        </Flex>
        <Flex gap="4px" align="center">
          <button
            type="button"
            className={`btn-ghost header-btn ${isWidgetMode ? "is-active" : ""}`}
            onClick={() => setIsWidgetMode(!isWidgetMode)}
            title={isWidgetMode ? "Exit Widget Mode" : "Toggle Widget Mode (compact view for split-screen)"}
            style={isWidgetMode ? { padding: "4px", borderRadius: "50%", minWidth: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" } : undefined}
          >
            {isWidgetMode ? (
              <X size={16} />
            ) : (
              <>
                <Maximize size={14} style={{ marginRight: "4px" }} />
                Widget
              </>
            )}
          </button>
          {!isWidgetMode && (
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="header-select"
            >
              <option value="system">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          )}
        </Flex>
      </Flex>
      
      {!isWidgetMode && (
        <Box mt="12px" p="14px" bg="var(--surface-2)" borderRadius="8px" fontSize="0.9rem" color="var(--text-secondary)">
          <Text mb="10px" fontWeight="bold" color="var(--text-primary)">
            How to use the ring system:
          </Text>
          <VStack as="ul" align="start" gap="6px" pl="24px" m="0">
            <li>
              <strong>Pick your clubs:</strong> Tap on the clubs to add them to your bag.
            </li>
            <li>
              <strong>Set the levels:</strong> Adjust the level sliders to match your clubs in-game.
            </li>
            <li>
              <strong>Read your ring adjustments:</strong> The ring system chart below updates instantly — see how many rings to adjust for any wind speed at max, mid, or min power.
            </li>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
