/**
 * Wind chart math, ported from golf-clash-notebook's wind.scala
 * (https://github.com/golf-clash-notebook/golf-clash-notebook.github.io).
 *
 * A club's "power" and "accuracy" stats at a given level determine how many
 * power-meter rings you need to add or subtract to cancel out a given wind
 * speed. See windPerRing() below for the core formula.
 */

// Category max carry distance in yards -- used to normalize a club's raw
// power stat into a 0..~1 power fraction.
const CATEGORY_MAX_DISTANCE = {
  Drivers: 240,
  Woods: 180,
  LongIrons: 135,
  ShortIrons: 90,
  Wedges: 45,
  RoughIrons: 135,
  SandWedges: 120,
};

// Categories whose shots curl/balloon more, needing a bigger wind correction.
const WIND_CATEGORY_MULTIPLIER = {
  RoughIrons: 1.45,
  SandWedges: 1.15,
};

// Categories where players typically swing well under full power (chip/pitch
// clubs), so "mid" and "min" power are fractions of max rather than a swing
// between two independent min/max power floors.
const HALF_SWING_CATEGORIES = new Set(['Wedges', 'RoughIrons', 'SandWedges']);

const WIND_MODES = [
  { name: 'Power 0', powerCoefficient: 1.0 },
  { name: 'Power 1', powerCoefficient: 1.03 },
  { name: 'Power 2', powerCoefficient: 1.05 },
  { name: 'Power 3', powerCoefficient: 1.07 },
  { name: 'Power 4', powerCoefficient: 1.1 },
  { name: 'Power 5', powerCoefficient: 1.13 },
];

function windCategoryMultiplier(category) {
  return WIND_CATEGORY_MULTIPLIER[category] || 1.0;
}

// A couple of named clubs get a small correction in the source data (their
// max-power ball flight is a hair more wind-resistant past a certain level).
function ruleBasedCorrection(club, level) {
  const name = club.name.toLowerCase();
  if ((name.includes('b52') || name.includes('grizzly')) && level >= 5) {
    return 0.9;
  }
  return 1.0;
}

function maxPower(club, level, mode) {
  const maxDistance = CATEGORY_MAX_DISTANCE[club.category] || 1;
  const power = club.power[level - 1];
  return (power / maxDistance) * mode.powerCoefficient;
}

function minPower(club, level, mode) {
  if (HALF_SWING_CATEGORIES.has(club.category)) {
    return maxPower(club, level, mode) / 4;
  }
  const floor =
    {
      Drivers: 0.75,
      Woods: 0.75,
      LongIrons: 0.66,
      ShortIrons: 0.5,
    }[club.category] ?? 0.75;
  return floor * mode.powerCoefficient;
}

function midPower(club, level, mode) {
  if (HALF_SWING_CATEGORIES.has(club.category)) {
    return maxPower(club, level, mode) / 2;
  }
  return (minPower(club, level, mode) + maxPower(club, level, mode)) / 2;
}

/**
 * Wind-speed units of correction needed per power-meter ring, for a club at
 * a given level swung at a given power fraction (typically the output of
 * minPower/midPower/maxPower).
 */
function windPerRing(club, level, power) {
  const accuracy = club.accuracy[level - 1];
  return (
    ((1 + (100 - accuracy) * 0.02) * windCategoryMultiplier(club.category)) /
    power *
    ruleBasedCorrection(club, level)
  );
}

/** { max, mid, min } windPerRing values for a club/level/mode combo. */
function windPerRingByPower(club, level, mode) {
  return {
    max: windPerRing(club, level, maxPower(club, level, mode)),
    mid: windPerRing(club, level, midPower(club, level, mode)),
    min: windPerRing(club, level, minPower(club, level, mode)),
  };
}

/** Rows of { ring, max, mid, min } wind-adjustment values, ring = 1..10. */
function buildWindPerRingTable(club, level, mode, elevation = 0, ringCount = 10) {
  const perRing = windPerRingByPower(club, level, mode);
  const elevMult = 1 + (elevation / 100);
  const rows = [];
  for (let ring = 1; ring <= ringCount; ring++) {
    rows.push({
      ring,
      max: (perRing.max * ring) / elevMult,
      mid: (perRing.mid * ring) / elevMult,
      min: (perRing.min * ring) / elevMult,
    });
  }
  return rows;
}

/** Rows of { wind, max, mid, min } ring counts for wind speeds minWind..maxWind. */
function buildRingsPerWindTable(club, level, mode, elevation = 0, { minWind = 1, maxWind = 16, step = 0.5 } = {}) {
  const perRing = windPerRingByPower(club, level, mode);
  const elevMult = 1 + (elevation / 100);
  const rows = [];
  // Guard against float accumulation drift over many steps.
  const steps = Math.round((maxWind - minWind) / step);
  for (let i = 0; i <= steps; i++) {
    const wind = Math.round((minWind + i * step) * 100) / 100;
    const effectiveWind = wind * elevMult;
    rows.push({
      wind,
      max: Math.floor((effectiveWind / perRing.max) * 10) / 10,
      mid: Math.floor((effectiveWind / perRing.mid) * 10) / 10,
      min: Math.floor((effectiveWind / perRing.min) * 10) / 10,
    });
  }
  return rows;
}

export {
  CATEGORY_MAX_DISTANCE,
  WIND_MODES,
  maxPower,
  midPower,
  minPower,
  windPerRing,
  windPerRingByPower,
  buildWindPerRingTable,
  buildRingsPerWindTable,
};
