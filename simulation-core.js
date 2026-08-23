/**
 * simulation-core.js — pure deterministic rules and scale constants for atmosfera.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */

export const PLANET_RADIUS = 13200;
export const TIDE_SPEED = 0.0032;
export const LAVA_COUNT = 45;
export const BUILD_LABEL = 'v3h-true-gravity-ocean-buoyancy-motility';

export const VOLCANIC_COMPOUNDS = [
  { key: 'Fe-S', name: 'Iron-Sulfur catalyst cluster', color: '#ff9a4d', organic: 3, energy: 0.85 },
  { key: 'H2S', name: 'Hydrogen sulfide gas', color: '#ffe066', organic: 2, energy: 0.72 },
  { key: 'SO2', name: 'Sulfur dioxide vapor', color: '#ffbe55', organic: 1, energy: 0.68 },
  { key: 'HCN', name: 'Hydrogen cyanide precursor', color: '#ea80fc', organic: 4, energy: 0.88 },
  { key: 'CO2', name: 'Volcanic carbon dioxide', color: '#80cbc4', organic: 2, energy: 0.65 },
  { key: 'NH3', name: 'Primordial ammonia vapor', color: '#b39ddb', organic: 3, energy: 0.76 },
  { key: 'PolyP', name: 'Polyphosphate mineral chain', color: '#ff80ab', organic: 4, energy: 0.92 },
];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function terrainHeight(direction, planetRadius = PLANET_RADIUS) {
  const wave1 = Math.sin(direction.x * 5.8) + Math.sin(direction.y * 7.9) + Math.sin(direction.z * 4.9);
  const wave2 = Math.sin(direction.x * 14.2 + direction.z * 11.5) * 0.25;
  const ridges = Math.abs(Math.sin((direction.x + direction.z) * 6.8));
  const mountainLimit = planetRadius * 0.05;
  const rawHeight = (ridges * 0.72 + wave1 * 0.14 + wave2 * 0.08 - 0.16) * mountainLimit;
  return clamp(rawHeight, -mountainLimit * 0.22, mountainLimit);
}

export function tideScale(tick, tideSpeed = TIDE_SPEED) {
  return 1 + Math.sin(tick * tideSpeed) * 0.0052;
}

export function lavaPulse(tick, phase = 0, tideSpeed = TIDE_SPEED) {
  return (Math.sin(tick * tideSpeed + phase) + 1) * 0.5;
}

export function reactionProbability({ distance = 20, maxDistance = 26, energy = 0.5, hasCatalyst = false, isTidalPool = false }) {
  if (distance > maxDistance) return 0;
  const proximityFactor = Math.max(0, 1 - distance / maxDistance);
  let baseProb = 0.28 * proximityFactor + energy * 0.18;
  if (hasCatalyst) baseProb += 0.28;
  if (isTidalPool) baseProb += 0.22;
  return Math.min(0.96, baseProb);
}

export function calculateAbiogenesisOdds() {
  return {
    prebioticAtomAbundance: 0.74, // C + H + O + N + P + S total weight
    molecularBondingPerCollision: { standard: 0.38, catalyzed: 0.66, tidalPool: 0.84 },
    polymerFormationChance: { standard: 0.12, hydrothermalVent: 0.42 },
    protocellEnclosureChance: { standard: 0.06, withPhosphorusSulfur: 0.38 },
    primitiveLifeEmergence: { openOcean: 0.08, warmTidalFlats: 0.48 },
    mitosisDivisionRate: 0.22,
  };
}

export function classifyReaction({
  previousStage = 'atom',
  atomKeys = [],
  organicScore = 0,
  energy = 0,
  isTidalPool = false,
}) {
  const atomSet = new Set(atomKeys);
  let stage = previousStage === 'atom' ? 'molecule' : previousStage;
  let color = '#8fe1ff';
  let scale = 1.1;
  const messages = [];

  // Catalyst boosts: Iron-Sulfur (Fe-S) and Polyphosphate accelerate organic condensation
  const hasIronSulfur = atomSet.has('Fe') && atomSet.has('S');
  const hasPhosphate = atomSet.has('P') && (atomSet.has('O') || atomSet.has('H'));
  let effectiveScore = organicScore;
  if (hasIronSulfur) effectiveScore += 4;
  if (hasPhosphate) effectiveScore += 3;
  if (isTidalPool) effectiveScore += 3;

  // 1. Polymer formation (from atom/molecule)
  if (['atom', 'molecule'].includes(previousStage) && effectiveScore >= 10 && atomKeys.length >= 3) {
    stage = 'polymer';
    color = '#7ef0c1';
    scale = 1.9;
    messages.push(hasIronSulfur
      ? 'Fe-S minerals catalyzed organic units into a stable polymer chain.'
      : 'Organic molecules condensed into an informational polymer chain.'
    );
  }

  // 2. Protocell formation (from polymer when P/S and energy are present)
  if (previousStage === 'polymer' && (atomSet.has('P') || atomSet.has('S') || hasPhosphate) && energy > 0.48) {
    stage = 'protocell';
    color = '#ff7bd3';
    scale = 2.85;
    messages.push('A membrane-bound protocell formed near a hydrothermal mineral boundary.');
  }

  // 3. Primitive Organism emergence (from protocell)
  if (previousStage === 'protocell' && effectiveScore >= 15 && energy > 0.45) {
    stage = 'organism';
    color = '#ffe26e';
    scale = 3.6;
    messages.push('Primitive metabolic life emerged! Autonomous swimming organism active.');
  }

  // 4. Complex Multicellular Organism / Colonial Motility (from organism)
  if (previousStage === 'organism' && effectiveScore >= 22 && energy > 0.52) {
    stage = 'complex';
    color = '#00ffd5';
    scale = 4.4;
    messages.push('Complex motile colonial organism evolved! Active feeding and dividing.');
  }

  // Colors & scales for existing stages
  if (stage === 'polymer' && color === '#8fe1ff') {
    color = '#7ef0c1';
    scale = 1.9;
  } else if (stage === 'protocell' && color === '#8fe1ff') {
    color = '#ff7bd3';
    scale = 2.85;
  } else if (stage === 'organism' && color === '#8fe1ff') {
    color = '#ffe26e';
    scale = 3.6;
  } else if (stage === 'complex' && color === '#8fe1ff') {
    color = '#00ffd5';
    scale = 4.4;
  }

  return { stage, color, scale, messages, effectiveScore };
}
