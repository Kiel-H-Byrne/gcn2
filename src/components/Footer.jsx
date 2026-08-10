import { Box, Text } from "@chakra-ui/react";

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
    </Box>
  );
}
