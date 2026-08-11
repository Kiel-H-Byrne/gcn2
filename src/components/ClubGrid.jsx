import React, { useState } from 'react';
import { Box, Flex, Grid, GridItem, Text, Button, Image, Badge } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { CATEGORY_ORDER, CATEGORY_LABELS, accentVar, getClubImageUrl } from '../utils';
import LevelPicker from './LevelPicker';

export default function ClubGrid({ clubs, activeCategory, setActiveCategory, bag, setBag, lastLevel, setLastLevel, openEditorModal }) {
  const [imageError, setImageError] = useState({});

  const handleAddToBag = (club) => {
    if (bag.some(b => b.clubId === club.id)) return;
    const suggested = lastLevel ? Math.min(Math.max(lastLevel, 1), club.maxLevel) : club.maxLevel;
    setBag([...bag, { clubId: club.id, level: suggested }]);
    setLastLevel(suggested);
  };

  const handleSetLevel = (club, level) => {
    setBag(bag.map(b => b.clubId === club.id ? { ...b, level } : b));
    setLastLevel(level);
  };

  const categoryClubs = clubs.filter(c => c.category === activeCategory);

  const hasAdminEdit = new URLSearchParams(window.location.search).get('adminEdit') === 'gcnAdmin123';

  return (
    <Box as="section" className="picker-panel" aria-label="Club picker">
      <Flex direction="column" mb="16px">
        <Flex gap="8px" wrap="wrap" pb="8px" role="tablist" aria-label="Club categories">
          {CATEGORY_ORDER.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <Button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                bg={isActive ? accentVar(cat) : "var(--surface-2)"}
                color={isActive ? "white" : "var(--text-secondary)"}
                border="1px solid"
                borderColor={isActive ? accentVar(cat) : "var(--border)"}
                _hover={{ bg: isActive ? accentVar(cat) : "var(--surface-3)" }}
                borderRadius="full"
                px="16px"
                size="sm"
                display="flex"
                alignItems="center"
                gap="6px"
              >
                <CategoryIcon category={cat} size={15} />
                <Text>{CATEGORY_LABELS[cat]}</Text>
              </Button>
            );
          })}
          {hasAdminEdit && (
            <Button
              size="sm"
              borderRadius="full"
              px="16px"
              bg="var(--surface-2)"
              border="1px solid var(--border)"
              color="var(--text-secondary)"
              onClick={openEditorModal}
              display="flex"
              alignItems="center"
              gap="6px"
              flexShrink={0}
            >
              <Plus size={15} />
              <Text>Manage Clubs</Text>
            </Button>
          )}
        </Flex>
      </Flex>
      
      <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="10px" role="list">
        {!categoryClubs.length && (
          <Text color="var(--text-muted)" fontStyle="italic" textAlign="center" mt="32px">
            No clubs in this category yet -- use "Manage Clubs" to add one.
          </Text>
        )}
        {categoryClubs.map(club => {
          const bagEntry = bag.find(b => b.clubId === club.id);
          const isSelected = !!bagEntry;
          const accentColor = accentVar(club.category);

          return (
            <Flex
              key={club.id}
              role="listitem"
              direction="column"
              gap="6px"
              position="relative"
              bg={isSelected ? "var(--surface-3)" : "var(--surface-2)"}
              border="1px solid"
              borderColor={isSelected ? accentColor : "var(--border)"}
              borderLeft={`3px solid ${accentColor}`}
              borderRadius="var(--radius-md)"
              p="10px 10px 12px"
              cursor="pointer"
              transition="border-color 0.15s, transform 0.1s"
              _hover={{ borderColor: "var(--border-strong)" }}
              _active={{ transform: "scale(0.98)" }}
              onClick={(e) => {
                if (e.target.closest('.level-picker')) return;
                if (!bagEntry) handleAddToBag(club);
              }}
            >
              <Flex justify="space-between" align="flex-start" mb="4px">
                {!imageError[club.id] ? (
                  <Image 
                    src={getClubImageUrl(club.name, '64x64')} 
                    alt="" 
                    w="42px" 
                    h="42px"
                    objectFit="contain"
                    onError={() => setImageError(prev => ({ ...prev, [club.id]: true }))}
                  />
                ) : (
                  <CategoryIcon category={club.category} size={22} className="club-card-icon" />
                )}
                {isSelected && (
                  <Badge bg={accentColor} color="white" borderRadius="full" px="6px" py="2px" fontSize="0.75rem" fontWeight="bold">
                    Lv {bagEntry.level}
                  </Badge>
                )}
              </Flex>
              <Text fontWeight="600" fontSize="0.95rem" color="var(--text-primary)" lineHeight="1.2">
                {club.name}
              </Text>
              <Flex gap="6px" fontSize="0.75rem" color="var(--text-muted)" textTransform="uppercase" letterSpacing="0.05em">
                <Text>{club.type || ''}</Text>
                <Text>Tour {club.tour}</Text>
              </Flex>
              {isSelected && (
                <Box mt="8px">
                  <LevelPicker club={club} level={bagEntry.level} onChange={(lvl) => handleSetLevel(club, lvl)} source="grid" />
                </Box>
              )}
            </Flex>
          );
        })}
      </Grid>
    </Box>
  );
}
