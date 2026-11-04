import { sortBagClubs, CATEGORY_ORDER } from './src/utils.js';
import clubsData from './src/data/clubs.json' with { type: "json" };

const allClubs = clubsData.clubs;

// Mock clubs in arbitrary order
const sampleBag = [
  { clubId: 'dart', level: 9 },         // Wedges
  { clubId: 'extra-mile', level: 8 },   // Drivers
  { clubId: 'malibu', level: 7 },       // SandWedges
  { clubId: 'sniper', level: 10 },      // Woods
  { clubId: 'thorn', level: 8 },        // ShortIrons
  { clubId: 'backbone', level: 10 },    // LongIrons
  { clubId: 'razor', level: 7 },        // RoughIrons
];

const sortedBag = sortBagClubs(sampleBag, allClubs);

console.log('Original bag:');
sampleBag.forEach(b => {
  const c = allClubs.find(x => x.id === b.clubId);
  console.log(` - ${c.name} (${c.category})`);
});

console.log('\nSorted bag (in-game standard order):');
sortedBag.forEach((b, i) => {
  const c = allClubs.find(x => x.id === b.clubId);
  console.log(` ${i + 1}. ${c.name} (${c.category})`);
});

// Verify category sequence matches CATEGORY_ORDER
let prevIndex = -1;
let ok = true;
for (const b of sortedBag) {
  const c = allClubs.find(x => x.id === b.clubId);
  const catIdx = CATEGORY_ORDER.indexOf(c.category);
  if (catIdx < prevIndex) {
    console.error(`ERROR: ${c.name} category ${c.category} (index ${catIdx}) is out of order!`);
    ok = false;
  }
  prevIndex = catIdx;
}

if (ok) {
  console.log('\nSUCCESS: All clubs are sorted according to official Golf Clash category order!');
} else {
  process.exit(1);
}
