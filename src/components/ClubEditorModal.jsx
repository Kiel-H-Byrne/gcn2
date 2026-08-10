import React, { useState, useRef } from 'react';
import { Box, Flex, Text, Heading, Button, Input, NativeSelect, IconButton } from '@chakra-ui/react';
import { X, Plus, Upload, Download, Trash2 } from 'lucide-react';
import { CATEGORY_ORDER, CATEGORY_LABELS, TYPE_SUGGESTIONS, generateId, accentVar } from '../utils';

function blankClub(activeCategory) {
  return {
    id: '',
    name: '',
    category: activeCategory || 'Drivers',
    tour: 1,
    type: 'Common',
    power: [200],
    accuracy: [50],
  };
}

export default function ClubEditorModal({ 
  onClose, customClubs, setCustomClubs, deletedSeedIds, setDeletedSeedIds, 
  bag, setBag, clubs, isSeedClub, activeCategory, setActiveCategory 
}) {
  const [editingClubId, setEditingClubId] = useState(null);
  const fileInputRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose();
  };

  const isNew = editingClubId === 'new';
  const club = isNew ? blankClub(activeCategory) : clubs.find(c => c.id === editingClubId);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(clubs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'golf-clash-clubs.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) {
          alert('Expected a JSON array of clubs.');
          return;
        }
        let valid = 0;
        let skipped = 0;
        const newCustoms = { ...customClubs };
        imported.forEach(c => {
          if (!c || !c.name || !c.category || !Array.isArray(c.power) || !c.power.length) {
            skipped++;
            return;
          }
          const id = c.id || generateId();
          newCustoms[id] = {
            id,
            name: c.name,
            category: c.category,
            tour: Number(c.tour) || 0,
            type: c.type || 'Common',
            power: c.power,
            accuracy: c.accuracy && c.accuracy.length === c.power.length ? c.accuracy : c.power.map(() => 50),
            maxLevel: c.power.length,
          };
          valid++;
        });
        setCustomClubs(newCustoms);
        alert(`Imported ${valid} club(s).${skipped ? ` Skipped ${skipped} invalid entries.` : ''}`);
      } catch (err) {
        alert('That file is not valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = () => {
    if (!club || isNew) return;
    if (!window.confirm(`Delete "${club.name}"? This also removes it from your bag if present.`)) return;
    
    const newCustoms = { ...customClubs };
    delete newCustoms[club.id];
    setCustomClubs(newCustoms);

    if (isSeedClub(club.id) && !deletedSeedIds.includes(club.id)) {
      setDeletedSeedIds([...deletedSeedIds, club.id]);
    }
    
    setBag(bag.filter(b => b.clubId !== club.id));
    setEditingClubId(null);
  };

  return (
    <Box 
      position="fixed" inset="0" zIndex="1000" bg="rgba(0,0,0,0.6)" backdropFilter="blur(4px)" 
      display="flex" alignItems="center" justify="center" p={{ base: '0', md: '20px' }}
      onClick={handleOverlayClick}
      className="modal-overlay"
    >
      <Flex 
        direction="column"
        bg="var(--page)"
        w="100%" maxW="850px"
        h={{ base: '100%', md: '80vh' }}
        maxH={{ base: 'none', md: '800px' }}
        borderRadius={{ base: '0', md: 'var(--radius-lg)' }}
        boxShadow="var(--shadow-2)"
        overflow="hidden"
        role="dialog" 
        aria-modal="true"
      >
        <Flex align="center" justify="space-between" p="16px 20px" bg="var(--surface-1)" borderBottom="1px solid var(--border)">
          <Heading as="h2" m="0" fontSize="1.2rem" color="var(--text-primary)">Manage Clubs</Heading>
          <IconButton variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Flex>
        
        <Box p="12px 20px" bg="var(--surface-2)" borderBottom="1px solid var(--border)">
          <Text fontSize="0.85rem" color="var(--text-secondary)">
            Add clubs the game has added, fix stats that changed, or remove clubs that got reworked.
            Everything here is saved in this browser and layered on top of the built-in starter data.
          </Text>
        </Box>
        
        <Flex flex="1" overflow="hidden" direction={{ base: 'column', md: 'row' }}>
          {/* Left Pane: Club List */}
          <Flex direction="column" w={{ base: '100%', md: '300px' }} borderRight={{ md: '1px solid var(--border)' }} bg="var(--surface-1)">
            <Flex p="12px" gap="8px" borderBottom="1px solid var(--border)" align="center" justify="space-between" wrap="wrap">
              <Button size="sm" colorScheme="blue" bg="var(--brand-primary)" color="white" onClick={() => setEditingClubId('new')}>
                <Plus size={14} style={{ marginRight: '6px' }} />
                Add Club
              </Button>
              <Flex gap="4px">
                <Button size="xs" variant="outline" onClick={handleExport}><Download size={14} style={{ marginRight: '4px' }} /> Export</Button>
                <Button size="xs" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload size={14} style={{ marginRight: '4px' }} /> Import</Button>
                <input type="file" accept="application/json" hidden ref={fileInputRef} onChange={handleImport} />
              </Flex>
            </Flex>
            
            <Box flex="1" overflowY="auto" p="12px">
              {CATEGORY_ORDER.map(cat => {
                const inCat = clubs.filter(c => c.category === cat);
                if (!inCat.length) return null;
                return (
                  <React.Fragment key={cat}>
                    <Text fontSize="0.75rem" fontWeight="bold" textTransform="uppercase" color="var(--text-muted)" mt="12px" mb="4px" px="8px">
                      {CATEGORY_LABELS[cat]}
                    </Text>
                    {inCat.map(c => {
                      const isActive = editingClubId === c.id;
                      return (
                        <Flex 
                          as="button"
                          key={c.id} 
                          w="100%"
                          align="center"
                          p="8px"
                          mb="2px"
                          borderRadius="var(--radius-sm)"
                          bg={isActive ? 'var(--surface-2)' : 'transparent'}
                          _hover={{ bg: 'var(--surface-2)' }}
                          onClick={() => setEditingClubId(c.id)}
                        >
                          <Box w="4px" h="16px" borderRadius="2px" bg={accentVar(c.category)} mr="8px" />
                          <Text flex="1" textAlign="left" fontSize="0.9rem" fontWeight={isActive ? '600' : '500'} color={isActive ? 'var(--text-primary)' : 'var(--text-secondary)'}>
                            {c.name}
                          </Text>
                          {customClubs[c.id] && (
                            <Box fontSize="0.65rem" bg="var(--border)" color="var(--text-muted)" px="6px" py="2px" borderRadius="12px">
                              edited
                            </Box>
                          )}
                        </Flex>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </Box>
          </Flex>

          {/* Right Pane: Form */}
          <Box flex="1" overflowY="auto" p="20px" bg="var(--page)">
            {!club ? (
              <Flex h="100%" align="center" justify="center" color="var(--text-muted)" fontStyle="italic">
                Select a club on the left to edit it, or add a new one.
              </Flex>
            ) : (
              <ClubForm 
                key={club.id || 'new'} 
                initialClub={club} 
                isNew={isNew} 
                onSave={(saved) => {
                  setCustomClubs({ ...customClubs, [saved.id]: saved });
                  setEditingClubId(saved.id);
                }}
                onCancel={() => setEditingClubId(null)}
                onDelete={handleDelete}
              />
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

function ClubForm({ initialClub, isNew, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(initialClub.name);
  const [category, setCategory] = useState(initialClub.category);
  const [tour, setTour] = useState(initialClub.tour || 0);
  const [type, setType] = useState(initialClub.type || '');
  const [levels, setLevels] = useState(() => {
    const p = initialClub.power || [200];
    const a = initialClub.accuracy || [];
    return p.map((pow, i) => ({ power: pow, accuracy: a[i] ?? 50 }));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const powerVals = levels.map(l => parseFloat(l.power));
    const accVals = levels.map(l => parseFloat(l.accuracy));
    if (powerVals.some(isNaN) || accVals.some(isNaN)) {
      alert('Every level needs a numeric power and accuracy value.');
      return;
    }
    if (!name.trim()) {
      alert('Name is required.');
      return;
    }
    onSave({
      id: isNew ? generateId() : initialClub.id,
      name: name.trim(),
      category,
      tour: parseInt(tour, 10) || 0,
      type: type.trim() || 'Common',
      power: powerVals,
      accuracy: accVals,
      maxLevel: powerVals.length,
    });
  };

  const addLevel = () => {
    if (levels.length >= 12) return;
    const last = levels[levels.length - 1];
    setLevels([...levels, { power: last?.power ?? '', accuracy: last?.accuracy ?? '' }]);
  };

  const removeLevel = (index) => {
    if (levels.length <= 1) return;
    const next = [...levels];
    next.splice(index, 1);
    setLevels(next);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="16px">
        <Flex gap="16px" direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">
            <Text as="label" fontSize="0.85rem" fontWeight="600" mb="4px" display="block">Name</Text>
            <Input required type="text" value={name} onChange={e => setName(e.target.value)} bg="var(--surface-1)" />
          </Box>
          <Box flex="1">
            <Text as="label" fontSize="0.85rem" fontWeight="600" mb="4px" display="block">Category</Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={category} onChange={e => setCategory(e.target.value)} bg="var(--surface-1)">
                {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        </Flex>
        
        <Flex gap="16px" direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">
            <Text as="label" fontSize="0.85rem" fontWeight="600" mb="4px" display="block">Tour (unlock order)</Text>
            <Input type="number" min="0" step="1" value={tour} onChange={e => setTour(e.target.value)} bg="var(--surface-1)" />
          </Box>
          <Box flex="1">
            <Text as="label" fontSize="0.85rem" fontWeight="600" mb="4px" display="block">Rarity / type</Text>
            <Input type="text" list="type-suggestions" value={type} onChange={e => setType(e.target.value)} bg="var(--surface-1)" />
            <datalist id="type-suggestions">
              {TYPE_SUGGESTIONS.map(t => <option key={t} value={t} />)}
            </datalist>
          </Box>
        </Flex>

        <Box mt="16px">
          <Flex justify="space-between" align="center" mb="8px">
            <Text fontWeight="600">Per-level stats</Text>
            <Button size="sm" variant="ghost" onClick={addLevel}><Plus size={14} style={{ marginRight: '4px' }} /> Add level</Button>
          </Flex>
          
          <Box border="1px solid var(--border)" borderRadius="var(--radius-md)" overflow="hidden">
            <table className="levels-editor" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--surface-1)' }}>
              <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '8px' }}>Lv</th>
                  <th style={{ padding: '8px' }}>Power</th>
                  <th style={{ padding: '8px' }}>Accuracy</th>
                  <th style={{ padding: '8px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {levels.map((lvl, i) => (
                  <tr key={i} style={{ borderBottom: i < levels.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{i + 1}</td>
                    <td style={{ padding: '8px' }}>
                      <Input 
                        size="sm"
                        type="number" 
                        step="1" 
                        value={lvl.power} 
                        onChange={e => {
                          const next = [...levels];
                          next[i].power = e.target.value;
                          setLevels(next);
                        }} 
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Input 
                        size="sm"
                        type="number" 
                        step="1" 
                        value={lvl.accuracy} 
                        onChange={e => {
                          const next = [...levels];
                          next[i].accuracy = e.target.value;
                          setLevels(next);
                        }} 
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <IconButton size="xs" variant="ghost" colorScheme="red" onClick={() => removeLevel(i)}>
                        <X size={14} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        <Flex justify="space-between" mt="16px" pt="16px" borderTop="1px solid var(--border)">
          {!isNew ? (
            <Button colorScheme="red" variant="outline" onClick={onDelete}><Trash2 size={14} style={{ marginRight: '6px' }} /> Delete club</Button>
          ) : <Box />}
          <Flex gap="8px">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button colorScheme="blue" bg="var(--brand-primary)" color="white" type="submit">{isNew ? 'Add club' : 'Save changes'}</Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
