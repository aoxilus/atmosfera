/**
 * simulation-core.test.js — unit test suite for atmosfera core logic.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */

import { describe, expect, it } from 'vitest';
import {
  BUILD_LABEL,
  LAVA_COUNT,
  PLANET_RADIUS,
  TIDE_SPEED,
  VOLCANIC_COMPOUNDS,
  calculateAbiogenesisOdds,
  classifyReaction,
  lavaPulse,
  reactionProbability,
  terrainHeight,
  tideScale,
} from './simulation-core.js';

describe('simulation constants and geochemistry', () => {
  it('documents the current visible build label', () => {
    expect(BUILD_LABEL).toBe('v3h-true-gravity-ocean-buoyancy-motility');
  });

  it('keeps the large planet and 5x lava count', () => {
    expect(PLANET_RADIUS).toBe(13200);
    expect(LAVA_COUNT).toBe(45);
  });

  it('exports diverse prebiotic volcanic compounds beyond just Fe', () => {
    expect(VOLCANIC_COMPOUNDS.length).toBeGreaterThanOrEqual(6);
    const keys = VOLCANIC_COMPOUNDS.map((c) => c.key);
    expect(keys).toContain('Fe-S');
    expect(keys).toContain('H2S');
    expect(keys).toContain('HCN');
    expect(keys).toContain('PolyP');
    expect(keys).toContain('NH3');
  });

  it('uses calibrated visible tide timing', () => {
    expect(TIDE_SPEED).toBe(0.0032);
  });
});

describe('calculateAbiogenesisOdds', () => {
  it('calculates deterministic mathematical odds across all evolutionary tiers', () => {
    const odds = calculateAbiogenesisOdds();
    expect(odds.prebioticAtomAbundance).toBeGreaterThan(0.70);
    expect(odds.molecularBondingPerCollision.catalyzed).toBeGreaterThan(odds.molecularBondingPerCollision.standard);
    expect(odds.polymerFormationChance.hydrothermalVent).toBeGreaterThan(odds.polymerFormationChance.standard);
    expect(odds.primitiveLifeEmergence.warmTidalFlats).toBeGreaterThan(odds.primitiveLifeEmergence.openOcean);
  });
});

describe('terrainHeight', () => {
  it('keeps terrain within the intended 5 percent mountain cap', () => {
    const samples = [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0.577, y: 0.577, z: 0.577 },
    ];

    for (const direction of samples) {
      expect(terrainHeight(direction)).toBeLessThanOrEqual(PLANET_RADIUS * 0.05);
      expect(terrainHeight(direction)).toBeGreaterThanOrEqual(-PLANET_RADIUS * 0.05 * 0.22);
    }
  });
});

describe('tide and lava motion', () => {
  it('keeps ocean tide smooth, visible, and bounded without vibration', () => {
    expect(tideScale(0)).toBeCloseTo(1);
    expect(Math.abs(tideScale(1000) - 1)).toBeLessThanOrEqual(0.0053);
  });

  it('keeps lava pulse normalized', () => {
    expect(lavaPulse(0)).toBeGreaterThanOrEqual(0);
    expect(lavaPulse(0)).toBeLessThanOrEqual(1);
    expect(lavaPulse(1000, 1.2)).toBeGreaterThanOrEqual(0);
    expect(lavaPulse(1000, 1.2)).toBeLessThanOrEqual(1);
  });
});

describe('reactionProbability', () => {
  it('calculates higher probability for close proximity, catalysts, and tidal pools', () => {
    const farProb = reactionProbability({ distance: 35, maxDistance: 26 });
    expect(farProb).toBe(0);

    const closeProb = reactionProbability({ distance: 5, maxDistance: 26, energy: 0.5 });
    const catalyzedProb = reactionProbability({ distance: 5, maxDistance: 26, energy: 0.5, hasCatalyst: true });
    const tidalProb = reactionProbability({ distance: 5, maxDistance: 26, energy: 0.5, hasCatalyst: true, isTidalPool: true });

    expect(closeProb).toBeGreaterThan(0);
    expect(catalyzedProb).toBeGreaterThan(closeProb);
    expect(tidalProb).toBeGreaterThan(catalyzedProb);
  });
});

describe('classifyReaction', () => {
  it('forms molecule by default', () => {
    expect(classifyReaction({ atomKeys: ['H', 'O'], organicScore: 2 }).stage).toBe('molecule');
  });

  it('catalyzes polymer formation when Fe-S minerals are present', () => {
    const withoutFeS = classifyReaction({ atomKeys: ['C', 'H', 'O'], organicScore: 7 });
    const withFeS = classifyReaction({ atomKeys: ['C', 'H', 'O', 'Fe', 'S'], organicScore: 7 });
    expect(withoutFeS.stage).toBe('molecule');
    expect(withFeS.stage).toBe('polymer');
    expect(withFeS.messages).toContain('Fe-S minerals catalyzed organic units into a stable polymer chain.');
  });

  it('forms protocell when phosphorus/sulfur and energy are present', () => {
    const result = classifyReaction({ previousStage: 'polymer', atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 14, energy: 0.75 });
    expect(result.stage).toBe('protocell');
    expect(result.messages).toContain('A membrane-bound protocell formed near a hydrothermal mineral boundary.');
  });

  it('forms organism from protocell with enough score and energy', () => {
    const result = classifyReaction({ previousStage: 'protocell', atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 16, energy: 0.60 });
    expect(result.stage).toBe('organism');
    expect(result.messages[0]).toContain('Primitive metabolic life emerged');
  });

  it('evolves complex multicellular life from high-energy organisms', () => {
    const result = classifyReaction({ previousStage: 'organism', atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 24, energy: 0.65 });
    expect(result.stage).toBe('complex');
    expect(result.messages[0]).toContain('Complex motile colonial organism evolved');
  });
});
