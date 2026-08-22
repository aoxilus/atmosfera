export const PLANET_RADIUS = 13200;
export const TIDE_SPEED = 0.00375;
export const LAVA_COUNT = 45;
export const BUILD_LABEL = 'v3d-surface-craters-log-below';

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function terrainHeight(direction, planetRadius = PLANET_RADIUS) {
  const wave = Math.sin(direction.x * 6.2) + Math.sin(direction.y * 8.4) + Math.sin(direction.z * 5.3);
  const ridges = Math.abs(Math.sin((direction.x + direction.z) * 7.1));
  const mountainLimit = planetRadius * 0.05;
  return clamp((ridges * 0.7 + wave * 0.12 - 0.15) * mountainLimit, -mountainLimit * 0.22, mountainLimit);
}

export function tideScale(tick, tideSpeed = TIDE_SPEED) {
  return 1 + Math.sin(tick * tideSpeed) * 0.00075;
}

export function lavaPulse(tick, phase = 0, tideSpeed = TIDE_SPEED) {
  return (Math.sin(tick * tideSpeed + phase) + 1) * 0.5;
}

export function classifyReaction({ previousStage = 'atom', atomKeys = [], organicScore = 0, energy = 0 }) {
  const atomSet = new Set(atomKeys);
  let stage = 'molecule';
  let color = '#8fe1ff';
  let scale = 1.1;
  const messages = [];

  if (organicScore >= 13 && atomKeys.length >= 5) {
    stage = 'polymer';
    color = '#7ef0c1';
    scale = 1.8;
  }

  if (stage === 'polymer' && atomSet.has('P') && atomSet.has('S') && energy > 0.62) {
    stage = 'protocell';
    color = '#ff7bd3';
    scale = 2.7;
    messages.push('A protocell formed on the visible planet surface.');
  }

  if (previousStage === 'protocell' && organicScore >= 18 && energy > 0.54) {
    stage = 'organism';
    color = '#ffe26e';
    scale = 3.4;
    messages.push('Primitive life emerged in a warm tidal zone.');
  }

  if (previousStage !== 'polymer' && stage === 'polymer') {
    messages.push('Organic molecules linked into a polymer chain.');
  }

  return { stage, color, scale, messages };
}
