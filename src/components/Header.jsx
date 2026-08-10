import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { Maximize, X } from "lucide-react";

export default function Header({ isWidgetMode, setIsWidgetMode, theme, setTheme }) {
  return (
    <Box as="header" mb={isWidgetMode ? "8px" : "20px"}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="10px">
          <img src="/pwa-192x192.png" alt="Logo" style={{ width: isWidgetMode ? "20px" : "32px", height: isWidgetMode ? "20px" : "32px", borderRadius: "50%" }} />
          <Heading as="h1" fontSize={isWidgetMode ? "1.1rem" : "1.8rem"} fontFamily="'Playfair Display', serif" fontWeight="700" letterSpacing="-0.01em">
            The Caddie's Compass
          </Heading>
        </Flex>
        <Flex gap={isWidgetMode ? "4px" : "8px"} align="center">
          <button
            type="button"
            className={`btn-ghost header-btn ${isWidgetMode ? "is-active" : ""}`}
            onClick={() => setIsWidgetMode(!isWidgetMode)}
            title="Toggle Widget Mode (compact view for split-screen)"
          >
            {isWidgetMode ? (
              <X size={10} style={{ marginRight: "2px" }} />
            ) : (
              <Maximize size={14} style={{ marginRight: "4px" }} />
            )}
            {isWidgetMode ? "Exit Widget" : "Widget"}
          </button>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="header-select"
          >
            <option value="system">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Flex>
      </Flex>
      
      {!isWidgetMode && (
        <Box mt="12px" p="14px" bg="var(--surface-2)" borderRadius="8px" fontSize="0.9rem" color="var(--text-secondary)">
          <Text mb="10px" fontWeight="bold" color="var(--text-primary)">
            How to use:
          </Text>
          <VStack as="ul" align="start" gap="6px" pl="24px" m="0">
            <li>
              <strong>Pick your clubs:</strong> Tap on the clubs to add them to your bag.
            </li>
            <li>
              <strong>Set the levels:</strong> Adjust the level sliders to match your clubs in-game.
            </li>
            <li>
              <strong>Read the chart:</strong> View the calculated wind adjustments below instantly!
            </li>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
