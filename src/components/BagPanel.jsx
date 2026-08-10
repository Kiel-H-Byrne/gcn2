import React, { useState } from 'react';
import { Box, Flex, Heading, Text, Button, Input, NativeSelect } from '@chakra-ui/react';
import { X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { accentVar, slugifyClubName } from '../utils';
import LevelPicker from './LevelPicker';

export default function BagPanel({ bag, setBag, clubs, setLastLevel, settings, setSettings, savedProfiles, setSavedProfiles }) {
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

  const [profileName, setProfileName] = useState('');
  const handleSaveProfile = () => {
    const name = profileName.trim();
    if (!name || bag.length === 0) return;
    setSavedProfiles({ ...savedProfiles, [name]: { bag, settings: { ...settings, title: name } } });
    setProfileName('');
  };

  const handleSetLevel = (clubId, level) => {
    setBag(bag.map(b => b.clubId === clubId ? { ...b, level } : b));
    setLastLevel(level);
  };

  return (
    <Box as="aside" className="bag-panel" aria-label="Your bag">
      <Box 
        mb="16px" 
        bg="var(--surface-1)" 
        p="12px" 
        borderRadius="var(--radius-lg)" 
        border="1px solid var(--border)" 
        boxShadow="var(--shadow-sm)"
      >
        <Heading as="h3" fontSize="0.8rem" textTransform="uppercase" letterSpacing="0.05em" color="var(--text-muted)" mb="12px" mt="0">
          Saved Profiles
        </Heading>
        
        {Object.keys(savedProfiles).length > 0 && (
          <Box mb="12px">
            <NativeSelect.Root>
              <NativeSelect.Field 
                value=""
                onChange={(e) => {
                  const name = e.target.value;
                  if (name && savedProfiles[name]) {
                    setBag(savedProfiles[name].bag);
                    setSettings(savedProfiles[name].settings);
                  }
                }}
              >
                <option value="" disabled>Load profile...</option>
                {Object.keys(savedProfiles).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        )}

        <Flex gap="8px">
          <Input 
            placeholder="New profile name..." 
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            bg="var(--surface-2)"
            flex="1"
            maxLength={30}
          />
          <Button 
            colorScheme="blue"
            variant="solid"
            bg="var(--brand-primary)"
            color="white"
            onClick={handleSaveProfile}
            disabled={!profileName.trim() || bag.length === 0}
            size="sm"
          >
            Save
          </Button>
        </Flex>
      </Box>

      <Flex justify="space-between" align="center" mb="16px" pl="4px">
        <Heading as="h2" fontSize="1.1rem" m="0" display="flex" alignItems="center" gap="8px">
          Your Bag 
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
