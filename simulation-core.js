/**
 * simulation-core.js — pure deterministic rules and scale constants for atmosfera.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */

export const PLANET_RADIUS = 13200;
export const TIDE_SPEED = 0.0032;
export const LAVA_COUNT = 45;
export const BUILD_LABEL = 'v3f-rich-geochemistry-translucent-clouds-smooth-tides';

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
  // Smooth sine breathing wave for ocean tidal displacement
  return 1 + Math.sin(tick * tideSpeed) * 0.0052;
}

export function lavaPulse(tick, phase = 0, tideSpeed = TIDE_SPEED) {
  return (Math.sin(tick * tideSpeed + phase) + 1) * 0.5;
}

export function reactionProbability({ distance = 20, maxDistance = 24, energy = 0.5, hasCatalyst = false, isTidalPool = false }) {
  if (distance > maxDistance) return 0;
  const proximityFactor = Math.max(0, 1 - distance / maxDistance);
  let baseProb = 0.22 * proximityFactor + energy * 0.14;
  if (hasCatalyst) baseProb += 0.25;
  if (isTidalPool) baseProb += 0.18;
  return Math.min(0.92, baseProb);
}

export function classifyReaction({
  previousStage = 'atom',
  atomKeys = [],
  organicScore = 0,
  energy = 0,
  isTidalPool = false,
}) {
  const atomSet = new Set(atomKeys);
  let stage = 'molecule';
  let color = '#8fe1ff';
  let scale = 1.1;
  const messages = [];

  // Catalyst boosts: Iron-Sulfur (Fe-S) and Polyphosphate accelerate organic condensation
  const hasIronSulfur = atomSet.has('Fe') && atomSet.has('S');
  const hasPhosphate = atomSet.has('P') && (atomSet.has('O') || atomSet.has('H'));
  let effectiveScore = organicScore;
  if (hasIronSulfur) effectiveScore += 3;
  if (hasPhosphate) effectiveScore += 2;
  if (isTidalPool) effectiveScore += 2;

  // Polymer formation
  if (effectiveScore >= 12 && atomKeys.length >= 4) {
    stage = 'polymer';
    color = '#7ef0c1';
    scale = 1.85;
  }

  // Protocell formation (requires Phosphorus for lipid membranes, Sulfur for catalytic bridges, and adequate thermal energy)
  if (stage === 'polymer' && atomSet.has('P') && atomSet.has('S') && energy > 0.55) {
    stage = 'protocell';
    color = '#ff7bd3';
    scale = 2.75;
    messages.push('A membrane-bound protocell formed near a hydrothermal mineral boundary.');
  }

  // Primitive Organism emergence
  if (previousStage === 'protocell' && effectiveScore >= 17 && energy > 0.50) {
    stage = 'organism';
    color = '#ffe26e';
    scale = 3.5;
    messages.push('Primitive metabolic life emerged in a warm tidal zone.');
  }

  if (previousStage !== 'polymer' && stage === 'polymer') {
    messages.push(hasIronSulfur
      ? 'Fe-S minerals catalyzed organic units into a stable polymer chain.'
      : 'Organic molecules condensed into an informational polymer chain.'
    );
  }

  return { stage, color, scale, messages, effectiveScore };
}
