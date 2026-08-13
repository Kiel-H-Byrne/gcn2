import { Box, Text, VStack } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box as="footer" mt="28px" color="var(--text-muted)" fontSize="0.76rem" lineHeight="1.5" textAlign="center">
      <Text>
        Club power/accuracy data from the
        <a
          href="https://github.com/golf-clash-notebook/golf-clash-notebook.github.io"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "underline", color: "inherit", margin: "0 4px" }}
        >
          golf-clash-notebook
        </a>
        community project (MIT licensed). Golf Clash club stats change
        with game updates &mdash; see <code style={{ background: "var(--surface-2)", padding: "1px 5px", borderRadius: "4px" }}>README.md</code> to refresh
        this app's data. Not affiliated with Playdemic.
      </Text>
      
      <VStack as="nav" aria-label="SEO content" gap="4px" mt="16px" fontSize="0.7rem" opacity="0.7">
        <Text>
          The Caddie's Compass is a free Golf Clash ring system calculator and wind chart tool.
          Use the ring method to get precise wind-per-ring and rings-per-wind values for every
          club in your bag at any level.
        </Text>
        <Text>
          The Golf Clash ring system works with all clubs including Apoc, Thor's Hammer, Endbringer,
          Spitfire, Tsunami, B52, Falcon, Hornet, and more. Supports max/mid/min power ring
          adjustments for accurate wind play in Golf Clash tournaments and tour play.
        </Text>
      </VStack>

      <Text mt="12px" fontSize="0.65rem" opacity="0.5">
        &copy; {new Date().getFullYear()} The Caddie's Compass &mdash; Golf Clash Ring System Calculator
      </Text>
    </Box>
  );
}
