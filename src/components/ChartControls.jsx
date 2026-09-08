import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  NativeSelect,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Briefcase, Check, Edit2, Maximize, Wind } from "lucide-react";
import { useState } from "react";
import balls from "../data/balls";

export default function ChartControls({
  bag = [],
  setBag,
  settings,
  setSettings,
  savedProfiles = {},
  setSavedProfiles,
  openFullscreen,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const activeBagName = settings?.title?.trim() || "";
  const hasSavedProfiles =
    savedProfiles && Object.keys(savedProfiles).length > 0;
  const isProfileSaved = Boolean(
    activeBagName && savedProfiles?.[activeBagName],
  );

  const handleSelectBag = (name) => {
    if (name === "__new__") {
      setNewProfileName("");
      setIsCreatingNew(true);
      return;
    }
    if (!savedProfiles || !savedProfiles[name]) return;
    if (setBag) setBag(savedProfiles[name].bag || []);
    if (setSettings) {
      setSettings(savedProfiles[name].settings || { ...settings, title: name });
    }
    setIsRenaming(false);
    setIsCreatingNew(false);
  };

  const handleCreateProfile = (name) => {
    const trimmed = name.trim();
    if (!trimmed || bag.length === 0) return;
    const newSettings = { ...settings, title: trimmed };
    if (setSavedProfiles) {
      setSavedProfiles((prev) => ({
        ...prev,
        [trimmed]: { bag, settings: newSettings },
      }));
    }
    if (setSettings) setSettings(newSettings);
    setNewProfileName("");
    setIsCreatingNew(false);
  };

  const handleRenameActiveProfile = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === activeBagName) {
      setIsRenaming(false);
      return;
    }
    if (setSavedProfiles) {
      setSavedProfiles((prev) => {
        const next = { ...prev };
        if (activeBagName && next[activeBagName]) {
          delete next[activeBagName];
        }
        next[trimmed] = { bag, settings: { ...settings, title: trimmed } };
        return next;
      });
    }
    if (setSettings) setSettings((prev) => ({ ...prev, title: trimmed }));
    setIsRenaming(false);
  };

  return (
    <Box
      as="section"
      className="chart-controls"
      bg="var(--surface-1)"
      p="16px 20px"
      borderRadius="var(--radius-lg)"
      border="1px solid var(--border)"
      boxShadow="var(--shadow-sm)"
    >
      {/* Top Toolbar: Bag Title/Status & Primary Action Buttons */}
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap="12px"
        mb="14px"
      >
        <Flex align="center" gap="8px">
          <Briefcase size={18} color="var(--series-1, #3b82f6)" />
          <Heading
            as="h2"
            fontSize="1rem"
            fontWeight="700"
            m="0"
            color="var(--text-primary)"
          >
            Golf Bag &amp; Chart Setup
          </Heading>
          {isProfileSaved && (
            <Flex
              align="center"
              gap="4px"
              color="var(--brand-primary, #10b981)"
              fontSize="0.72rem"
              fontWeight="600"
              bg="var(--surface-2)"
              px="8px"
              py="2px"
              borderRadius="10px"
            >
              <Check size={12} /> Auto-saves
            </Flex>
          )}
        </Flex>

        <Flex gap="8px" align="center" className="no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={openFullscreen}
            display="flex"
            alignItems="center"
            gap="6px"
            h="34px"
            px="12px"
            fontSize="0.82rem"
            fontWeight="600"
            borderRadius="var(--radius-sm)"
            border="1px solid var(--border-strong)"
            bg="var(--surface-1)"
            color="var(--text-primary)"
            boxShadow="var(--shadow-1, 0 1px 2px rgba(0,0,0,0.06))"
            _hover={{
              bg: "var(--surface-2)",
              borderColor: "var(--text-secondary)",
              transform: "translateY(-1px)",
            }}
            transition="all 0.15s ease"
          >
            <Maximize size={14} />
            <span>Fullscreen</span>
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            display="flex"
            alignItems="center"
            gap="6px"
            h="34px"
            px="14px"
            fontSize="0.82rem"
            fontWeight="700"
            borderRadius="var(--radius-sm)"
            bg="var(--brand-primary, #2563eb)"
            color="#ffffff"
            border="1px solid var(--brand-primary-hover, #1d4ed8)"
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(37, 99, 235, 0.3)"
            cursor="pointer"
            _hover={{
              bg: "var(--brand-primary-hover, #1d4ed8)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(37, 99, 235, 0.4)",
              transform: "translateY(-1px)",
            }}
            _active={{
              bg: "var(--brand-primary-active, #1e40af)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
              transform: "translateY(0)",
            }}
            transition="all 0.15s ease"
          >
            <Wind size={15} />
            <span>Print / Save PDF</span>
          </Button>
        </Flex>
      </Flex>

      {/* Grid of Core Controls */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: settings.variant === "wind" ? "repeat(4, 1fr)" : "repeat(3, 1fr)",
        }}
        gap="14px"
        alignItems="end"
      >
        {/* 1. Golf Bag Selector / New / Rename */}
        <Box>
          <Flex justify="space-between" align="center" mb="6px">
            <Text
              as="label"
              htmlFor={hasSavedProfiles ? "chart-bag-select" : "chart-title"}
              fontSize="0.8rem"
              fontWeight="600"
              color="var(--text-secondary)"
            >
              Active Golf Bag
            </Text>
            {!isProfileSaved && !isCreatingNew && (
              <Button
                size="xs"
                variant="ghost"
                color="var(--brand-primary)"
                fontSize="0.72rem"
                p="0"
                h="auto"
                onClick={() => {
                  setNewProfileName(activeBagName || "My Bag");
                  setIsCreatingNew(true);
                }}
              >
                + Save Profile
              </Button>
            )}
          </Flex>

          {isCreatingNew ? (
            <Flex gap="4px">
              <Input
                size="sm"
                placeholder="Bag name..."
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                bg="var(--surface-2)"
                maxLength={30}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProfile(newProfileName);
                  if (e.key === "Escape") setIsCreatingNew(false);
                }}
              />
              <Button
                size="sm"
                colorScheme="blue"
                bg="var(--brand-primary)"
                color="white"
                onClick={() => handleCreateProfile(newProfileName)}
                disabled={!newProfileName.trim()}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreatingNew(false)}
              >
                ✕
              </Button>
            </Flex>
          ) : isRenaming ? (
            <Flex gap="4px">
              <Input
                size="sm"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                bg="var(--surface-2)"
                maxLength={30}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameActiveProfile(renameValue);
                  if (e.key === "Escape") setIsRenaming(false);
                }}
              />
              <Button
                size="sm"
                colorScheme="blue"
                bg="var(--brand-primary)"
                color="white"
                onClick={() => handleRenameActiveProfile(renameValue)}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsRenaming(false)}
              >
                ✕
              </Button>
            </Flex>
          ) : hasSavedProfiles ? (
            <Flex gap="4px" align="center">
              <NativeSelect.Root flex="1">
                <NativeSelect.Field
                  id="chart-bag-select"
                  value={isProfileSaved ? activeBagName : "__custom__"}
                  onChange={(e) => handleSelectBag(e.target.value)}
                  bg="var(--surface-2)"
                  fontWeight="600"
                  fontSize="0.84rem"
                  h="36px"
                >
                  {!isProfileSaved && (
                    <option value="__custom__" disabled>
                      {activeBagName || "Active Bag"} (Unsaved Draft)
                    </option>
                  )}
                  {Object.entries(savedProfiles).map(([name, prof]) => (
                    <option key={name} value={name}>
                      {name} ({prof.bag?.length || 0} clubs)
                    </option>
                  ))}
                  <option value="__new__">+ Save as New Bag Profile...</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {isProfileSaved && (
                <Button
                  size="sm"
                  variant="outline"
                  h="36px"
                  px="8px"
                  title="Rename this bag"
                  onClick={() => {
                    setRenameValue(activeBagName);
                    setIsRenaming(true);
                  }}
                >
                  <Edit2 size={13} />
                </Button>
              )}
            </Flex>
          ) : (
            <Input
              id="chart-title"
              type="text"
              placeholder="e.g. My Tour Bag"
              maxLength={60}
              value={settings.title}
              onChange={(e) =>
                setSettings({ ...settings, title: e.target.value })
              }
              bg="var(--surface-2)"
              h="36px"
            />
          )}
        </Box>

        {/* 2. Golf Ball Selection */}
        <Box>
          <Text
            as="label"
            htmlFor="chart-ball-select"
            fontSize="0.8rem"
            fontWeight="600"
            color="var(--text-secondary)"
            display="block"
            mb="6px"
          >
            Ball Power
          </Text>
          <NativeSelect.Root>
            <NativeSelect.Field
              id="chart-ball-select"
              value={settings.ballName}
              onChange={(e) =>
                setSettings({ ...settings, ballName: e.target.value })
              }
              bg="var(--surface-2)"
              fontSize="0.84rem"
              h="36px"
            >
              {balls.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} (Power {b.power})
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        {/* 3. Chart Type Selection */}
        <Box>
          <Text
            fontSize="0.8rem"
            fontWeight="600"
            color="var(--text-secondary)"
            display="block"
            mb="6px"
          >
            Chart Mode
          </Text>
          <Flex
            role="tablist"
            bg="var(--border)"
            p="2px"
            borderRadius="var(--radius-sm)"
            h="36px"
            align="center"
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
              h="30px"
              fontSize="0.78rem"
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
              h="30px"
              fontSize="0.78rem"
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
        </Box>

        {/* 4. Wind Step (Only for Rings per Wind) */}
        {settings.variant === "wind" && (
          <Box>
            <Text
              as="label"
              htmlFor="wind-step-select"
              fontSize="0.8rem"
              fontWeight="600"
              color="var(--text-secondary)"
              display="block"
              mb="6px"
            >
              Wind Step
            </Text>
            <NativeSelect.Root>
              <NativeSelect.Field
                id="wind-step-select"
                value={settings.windStep}
                onChange={(e) =>
                  setSettings({ ...settings, windStep: Number(e.target.value) })
                }
                bg="var(--surface-2)"
                fontSize="0.84rem"
                h="36px"
              >
                <option value={0.2}>0.2 mph</option>
                <option value={0.5}>0.5 mph</option>
                <option value={1}>1.0 mph</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        )}
      </Grid>

      {/* Hole Notes Section (Multi-line textarea, cleanly integrated) */}
      <Box borderTop="1px solid var(--border)" w="1/4">
        <Flex justify="space-between" align="center" mb="6px">
          <Text
            as="label"
            htmlFor="chart-notes"
            fontSize="0.8rem"
            fontWeight="600"
            color="var(--text-secondary)"
          >
            Hole Notes
          </Text>
          <Text fontSize="0.72rem" color="var(--text-muted)">
            Notes display in print &amp; full-screen.
          </Text>
        </Flex>
        <Textarea
          id="chart-notes"
          placeholder={
            "e.g. Drive: +10% Max, P3 ball\nApproach: Sniper +5% Mid, 2 BS"
          }
          value={settings.notes || ""}
          onChange={(e) => setSettings({ ...settings, notes: e.target.value })}
          bg="var(--surface-2)"
          fontSize="0.84rem"
          rows={2}
          resize="vertical"
          borderRadius="var(--radius-sm)"
        />
      </Box>
    </Box>
  );
}
