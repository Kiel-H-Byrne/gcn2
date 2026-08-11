import {
  Button,
  Flex,
  Grid,
  GridItem,
  Input,
  NativeSelect,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Maximize, Wind } from "lucide-react";

export default function ChartControls({
  settings,
  setSettings,
  openFullscreen,
}) {
  return (
    <Grid
      as="section"
      className="chart-controls"
      templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
      gap="16px"
      alignItems="end"
      bg="var(--surface-1)"
      p="16px"
      borderRadius="var(--radius-lg)"
      border="1px solid var(--border)"
      boxShadow="var(--shadow-sm)"
    >
      <Flex direction="column" gap="6px">
        <Text
          as="label"
          htmlFor="chart-title"
          fontSize="0.85rem"
          fontWeight="600"
          color="var(--text-secondary)"
        >
          Title
        </Text>
        <Input
          id="chart-title"
          type="text"
          placeholder="e.g. My Tour Bag"
          maxLength={60}
          value={settings.title}
          onChange={(e) => setSettings({ ...settings, title: e.target.value })}
          bg="var(--surface-2)"
        />
      </Flex>

      <Flex direction="column" gap="6px">
        <Text fontSize="0.85rem" fontWeight="600" color="var(--text-secondary)">
          Chart Type
        </Text>
        <Flex
          role="tablist"
          bg="var(--border)"
          p="2px"
          borderRadius="var(--radius-sm)"
        >
          <Button
            flex="1"
            size="sm"
            variant="ghost"
            role="tab"
            aria-selected={settings.variant === "ring"}
            onClick={() => setSettings({ ...settings, variant: "ring" })}
            bg={
              settings.variant === "ring" ? "var(--surface-1)" : "transparent"
            }
            color={
              settings.variant === "ring"
                ? "var(--text-primary)"
                : "var(--text-muted)"
            }
            boxShadow={
              settings.variant === "ring" ? "var(--shadow-sm)" : "none"
            }
            _hover={{
              bg:
                settings.variant === "ring"
                  ? "var(--surface-1)"
                  : "var(--border-strong)",
            }}
          >
            Wind per Ring
          </Button>
          <Button
            flex="1"
            size="sm"
            variant="ghost"
            role="tab"
            aria-selected={settings.variant === "wind"}
            onClick={() => setSettings({ ...settings, variant: "wind" })}
            bg={
              settings.variant === "wind" ? "var(--surface-1)" : "transparent"
            }
            color={
              settings.variant === "wind"
                ? "var(--text-primary)"
                : "var(--text-muted)"
            }
            boxShadow={
              settings.variant === "wind" ? "var(--shadow-sm)" : "none"
            }
            _hover={{
              bg:
                settings.variant === "wind"
                  ? "var(--surface-1)"
                  : "var(--border-strong)",
            }}
          >
            Rings per Wind
          </Button>
        </Flex>
      </Flex>

      {settings.variant === "wind" && (
        <Flex direction="column" gap="6px">
          <Text
            as="label"
            htmlFor="wind-step-select"
            fontSize="0.85rem"
            fontWeight="600"
            color="var(--text-secondary)"
          >
            Wind step
          </Text>
          <NativeSelect.Root>
            <NativeSelect.Field
              id="wind-step-select"
              value={settings.windStep}
              onChange={(e) =>
                setSettings({ ...settings, windStep: Number(e.target.value) })
              }
              bg="var(--surface-2)"
            >
              <option value={0.2}>0.2</option>
              <option value={0.5}>0.5</option>
              <option value={1}>1.0</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>
      )}

      <GridItem colSpan={{ base: 1, md: -1 }}>
        <Flex direction="column" gap="6px">
          <Text
            as="label"
            htmlFor="chart-notes"
            fontSize="0.85rem"
            fontWeight="600"
            color="var(--text-secondary)"
          >
            Hole Notes
          </Text>
          <Textarea
            id="chart-notes"
            placeholder="e.g. Drive: +10% Max, Approach: +5% Mid"
            value={settings.notes || ""}
            onChange={(e) =>
              setSettings({ ...settings, notes: e.target.value })
            }
            rows={2}
            resize="vertical"
            bg="var(--surface-2)"
          />
        </Flex>
      </GridItem>

      <Flex
        direction={{ base: "column", sm: "row" }}
        gap="12px"
        gridColumn={{ base: "1", md: "1 / -1" }}
      >
        <Button
          variant="outline"
          flex="1"
          onClick={openFullscreen}
          display="flex"
          gap="8px"
          size={"lg"}
        >
          <Maximize size={15} flexShrink={0} />
          <Text whiteSpace="nowrap">Full-Screen View</Text>
        </Button>

        <Button
          colorScheme="blue"
          bg="var(--brand-primary)"
          color="white"
          flex="1"
          onClick={() => window.print()}
          display="flex"
          gap="8px"
        >
          <Wind size={16} flexShrink={0} />
          <Text whiteSpace="nowrap">Print / Save PDF</Text>
        </Button>
      </Flex>
    </Grid>
  );
}
