import React, { useState } from 'react';
import { Box, Flex, Heading, Text, Button, Input } from '@chakra-ui/react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { accentVar, slugifyClubName } from '../utils';
import LevelPicker from './LevelPicker';

export default function BagPanel({
  bag,
  setBag,
  clubs,
  setLastLevel,
  settings,
  setSettings,
  savedProfiles,
  setSavedProfiles
}) {
  const activeProfileName = settings.title?.trim() || '';
  const isProfileSaved = Boolean(activeProfileName && savedProfiles[activeProfileName]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleRemove = (clubId) => {
    setBag(bag.filter(b => b.clubId !== clubId));
  };

  const handleClear = () => {
    if (bag.length && window.confirm('Clear all clubs from your bag?')) {
      setBag([]);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    if (!bag.length) return;
    const readable = bag.map(b => {
      const c = clubs.find(cl => cl.id === b.clubId);
      return c ? `${slugifyClubName(c.name)}${b.level}` : '';
    }).filter(Boolean).join('-');
    const url = new URL(window.location.href);
    url.searchParams.set('bag', readable);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSetLevel = (clubId, level) => {
    setBag(bag.map(b => b.clubId === clubId ? { ...b, level } : b));
    setLastLevel(level);
  };

  const handleSelectProfile = (name) => {
    if (name && savedProfiles[name]) {
      setBag(savedProfiles[name].bag || []);
      setSettings(savedProfiles[name].settings || { ...settings, title: name });
      setIsRenaming(false);
      setIsCreatingNew(false);
    }
  };

  const handleCreateProfile = (name) => {
    const trimmed = name.trim();
    if (!trimmed || bag.length === 0) return;
    const newSettings = { ...settings, title: trimmed };
    setSavedProfiles(prev => ({
      ...prev,
      [trimmed]: { bag, settings: newSettings }
    }));
    setSettings(newSettings);
    setNewProfileName('');
    setIsCreatingNew(false);
  };

  const handleRenameActiveProfile = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === activeProfileName) {
      setIsRenaming(false);
      return;
    }
    setSavedProfiles(prev => {
      const next = { ...prev };
      if (activeProfileName && next[activeProfileName]) {
        delete next[activeProfileName];
      }
      next[trimmed] = { bag, settings: { ...settings, title: trimmed } };
      return next;
    });
    setSettings(prev => ({ ...prev, title: trimmed }));
    setIsRenaming(false);
  };

  const handleDeleteProfile = (name) => {
    if (!window.confirm(`Delete profile "${name}"?`)) return;
    setSavedProfiles(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (activeProfileName === name) {
      const remaining = Object.keys(savedProfiles).filter(k => k !== name);
      if (remaining.length > 0) {
        setBag(savedProfiles[remaining[0]].bag || []);
        setSettings(savedProfiles[remaining[0]].settings || { ...settings, title: remaining[0] });
      } else {
        setSettings(prev => ({ ...prev, title: '' }));
      }
    }
  };

  return (
    <Box as="aside" className="bag-panel" aria-label="Your bag">
      {/* Active Bag Profile Card with Auto-save */}
      <Box 
        mb="16px" 
        bg="var(--surface-1)" 
        p="12px" 
        borderRadius="var(--radius-lg)" 
        border="1px solid var(--border)" 
        boxShadow="var(--shadow-sm)"
      >
        <Flex justify="space-between" align="center" mb="8px">
          <Heading as="h3" fontSize="0.75rem" textTransform="uppercase" letterSpacing="0.05em" color="var(--text-muted)" m="0">
            Active Golf Bag
          </Heading>
          {isProfileSaved && (
            <Flex align="center" gap="4px" color="var(--brand-primary, #10b981)" fontSize="0.7rem" fontWeight="600">
              <Check size={12} /> Auto-saves on edit
            </Flex>
          )}
        </Flex>

        {/* Saved Profiles Switcher Dropdown */}
        {Object.keys(savedProfiles).length > 0 && (
          <Box mb="8px">
            <select 
              value={isProfileSaved ? activeProfileName : "__unsaved__"}
              onChange={(e) => {
                const name = e.target.value;
                if (name !== "__unsaved__") {
                  handleSelectProfile(name);
                }
              }}
              className="hud-club-select"
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: "0.82rem",
                fontWeight: "600",
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
              aria-label="Select active bag profile"
            >
              {!isProfileSaved && (
                <option value="__unsaved__" disabled>
                  {activeProfileName || "Untitled Bag"} (Unsaved Draft)
                </option>
              )}
              {Object.keys(savedProfiles).map(name => (
                <option key={name} value={name}>
                  {name} ({savedProfiles[name]?.bag?.length || 0} clubs)
                </option>
              ))}
            </select>
          </Box>
        )}

        {/* Current Active Bag Bar with Rename & Delete */}
        <Flex 
          align="center" 
          justify="space-between" 
          gap="6px" 
          bg="var(--surface-2)" 
          p="6px 8px" 
          borderRadius="var(--radius-sm)" 
          border="1px solid var(--border)"
        >
          {isRenaming ? (
            <Flex align="center" gap="4px" flex="1">
              <Input 
                size="xs"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={30}
                autoFocus
                bg="var(--surface-1)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameActiveProfile(renameValue);
                  if (e.key === "Escape") setIsRenaming(false);
                }}
              />
              <Button size="xs" colorScheme="blue" onClick={() => handleRenameActiveProfile(renameValue)}>
                Save
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setIsRenaming(false)}>
                Cancel
              </Button>
            </Flex>
          ) : (
            <>
              <Box flex="1" minW="0">
                <Text fontSize="0.82rem" fontWeight="bold" color="var(--text-primary)" isTruncated m="0">
                  {activeProfileName || "Untitled Bag"}
                </Text>
                <Text fontSize="0.65rem" color="var(--text-muted)" m="0">
                  {isProfileSaved ? "Saved Profile (Auto-syncs changes)" : "Unsaved — save as profile to enable multi-bag swiping"}
                </Text>
              </Box>
              <Flex align="center" gap="4px">
                {isProfileSaved ? (
                  <>
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      onClick={() => {
                        setRenameValue(activeProfileName);
                        setIsRenaming(true);
                      }}
                      title="Rename this bag profile"
                      h="24px"
                      px="6px"
                      fontSize="0.7rem"
                    >
                      <Edit2 size={12} style={{ marginRight: "3px" }} />
                      Rename
                    </Button>
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      color="red.500" 
                      onClick={() => handleDeleteProfile(activeProfileName)}
                      title="Delete this bag profile"
                      h="24px"
                      px="6px"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="xs" 
                    colorScheme="blue"
                    bg="var(--brand-primary)"
                    color="white"
                    onClick={() => {
                      setNewProfileName(activeProfileName || "My Bag");
                      setIsCreatingNew(true);
                    }}
                    h="24px"
                    px="8px"
                    fontSize="0.7rem"
                  >
                    Save Bag
                  </Button>
                )}
              </Flex>
            </>
          )}
        </Flex>

        {/* Create New Bag or Save As New Profile Form */}
        {isCreatingNew ? (
          <Flex gap="6px" mt="8px">
            <Input 
              placeholder="New bag profile name..." 
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              bg="var(--surface-2)"
              flex="1"
              size="sm"
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
              variant="solid"
              bg="var(--brand-primary)"
              color="white"
              onClick={() => handleCreateProfile(newProfileName)}
              disabled={!newProfileName.trim() || bag.length === 0}
            >
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsCreatingNew(false)}>
              Cancel
            </Button>
          </Flex>
        ) : (
          <Flex justify="flex-end" mt="8px">
            <Button 
              size="xs" 
              variant="outline" 
              onClick={() => {
                setNewProfileName('');
                setIsCreatingNew(true);
              }}
              fontSize="0.72rem"
              h="26px"
            >
              <Plus size={13} style={{ marginRight: "4px" }} />
              Save as New Bag Profile
            </Button>
          </Flex>
        )}
      </Box>

      {/* Bag Clubs List Header */}
      <Flex justify="space-between" align="center" mb="16px" pl="4px">
        <Heading as="h2" fontSize="1.1rem" m="0" display="flex" alignItems="center" gap="8px">
          Clubs in Bag 
          <Box as="span" bg="var(--surface-2)" border="1px solid var(--border-strong)" px="6px" py="2px" borderRadius="12px" fontSize="0.85rem">
            {bag.length}
          </Box>
        </Heading>
        <Flex gap="8px">
          <Button variant="ghost" size="sm" onClick={handleShare} disabled={bag.length === 0} px="8px" h="28px">
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} px="8px" h="28px">
            Clear
          </Button>
        </Flex>
      </Flex>
      
      <Box className="bag-list">
        {bag.map(entry => {
          const club = clubs.find(c => c.id === entry.clubId);
          if (!club) return null;
          return (
            <Box key={club.id} className="bag-chip" style={{ '--card-accent': accentVar(club.category) }}>
              <div className="bag-chip-top">
                <CategoryIcon category={club.category} size={18} className="bag-chip-icon" />
                <span className="bag-chip-name">{club.name}</span>
                <span className="club-card-level-badge" style={{ background: accentVar(club.category) }}>Lv {entry.level}</span>
                <button 
                  className="bag-chip-remove" 
                  type="button" 
                  aria-label={`Remove ${club.name}`}
                  onClick={() => handleRemove(club.id)}
                >
                  <X size={14} />
                </button>
              </div>
              <LevelPicker club={club} level={entry.level} onChange={(lvl) => handleSetLevel(club.id, lvl)} source="bag" />
            </Box>
          );
        })}
      </Box>
      {bag.length === 0 && (
        <Text fontSize="0.85rem" color="var(--text-muted)" textAlign="center" mt="32px" fontStyle="italic">
          Tap a club on the left to add it here, then set its level.
        </Text>
      )}
    </Box>
  );
}
