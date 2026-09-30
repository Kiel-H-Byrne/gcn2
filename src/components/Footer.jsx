import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { LANDING_PAGES, ALL_LANDING_PATHS } from "../data/landingPages";

export default function Footer({ onNavigate }) {
  const handleLinkClick = (e, path) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <Box
      as="footer"
      className="app-footer"
      mt="36px"
      pt="20px"
      borderTop="1px solid var(--border)"
      color="var(--text-muted)"
      fontSize="0.76rem"
      lineHeight="1.5"
    >
      {/* Search Engine Crawlable Guide & Calculator Links */}
      <Box mb="20px">
        <Text
          fontSize="0.75rem"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.05em"
          color="var(--text-secondary)"
          mb="10px"
          textAlign="center"
        >
          Golf Clash Wind Calculators &amp; Club Guides
        </Text>
        <Flex justify="center" wrap="wrap" gap="8px 16px" maxW="900px" mx="auto">
          {ALL_LANDING_PATHS.map((path) => {
            const page = LANDING_PAGES[path];
            return (
              <a
                key={path}
                href={path}
                onClick={(e) => handleLinkClick(e, path)}
                style={{
                  color: "var(--brand-primary, #3b82f6)",
                  textDecoration: "none",
                  fontSize: "0.76rem",
                  fontWeight: "500",
                }}
                className="footer-nav-link"
              >
                {page.heading.replace("Golf Clash ", "")}
              </a>
            );
          })}
        </Flex>
      </Box>

      <Text textAlign="center" maxW="700px" mx="auto">
        Club power/accuracy data from the{" "}
        <a
          href="https://github.com/golf-clash-notebook/golf-clash-notebook.github.io"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "underline",
            color: "inherit",
            margin: "0 4px",
          }}
        >
          golf-clash-notebook
        </a>{" "}
        community project (MIT licensed). Golf Clash club stats change with game
        updates &mdash; see{" "}
        <code
          style={{
            background: "var(--surface-2)",
            padding: "1px 5px",
            borderRadius: "4px",
          }}
        >
          README.md
        </code>{" "}
        to refresh this app&apos;s data. Not affiliated with Playdemic.
      </Text>

      <VStack
        as="nav"
        aria-label="SEO content"
        gap="4px"
        mt="14px"
        fontSize="0.7rem"
        opacity="0.7"
        textAlign="center"
        maxW="800px"
        mx="auto"
      >
        <Text>
          The Caddie&apos;s Compass is a free Golf Clash ring system calculator and wind chart tool.
          Use the ring method to get precise wind-per-ring and rings-per-wind values for every
          club in your bag at any level.
        </Text>
        <Text>
          The Golf Clash ring system works with all clubs including Apoc, Thor&apos;s Hammer, Endbringer,
          Spitfire, Tsunami, B52, Falcon, Hornet, and more. Supports max/mid/min power ring
          adjustments for accurate wind play in Golf Clash tournaments and tour play.
        </Text>
      </VStack>

      <Text mt="14px" fontSize="0.65rem" opacity="0.5" textAlign="center">
        &copy; {new Date().getFullYear()} The Caddie&apos;s Compass &mdash; Golf Clash Ring System Calculator
      </Text>
    </Box>
  );
}
