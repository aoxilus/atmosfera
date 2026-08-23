/**
 * simulation-core.test.js — unit test suite for atmosfera core logic.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */

import { describe, expect, it } from 'vitest';
import {
  BUILD_LABEL,
  BUOYANCY_MODES,
  GRAVITY_PRESETS,
  LAVA_COUNT,
  PLANET_RADIUS,
  TIDE_SPEED,
  VOLCANIC_COMPOUNDS,
  calculateAbiogenesisOdds,
  calculateParticleBuoyancy,
  classifyReaction,
  lavaPulse,
  reactionProbability,
  terrainHeight,
  tideScale,
} from './simulation-core.js';

describe('simulation constants and geochemistry', () => {
  it('documents the current visible build label', () => {
    expect(BUILD_LABEL).toBe('v4-beta-emergence-engine');
  });

  it('keeps the large planet and 5x lava count', () => {
    expect(PLANET_RADIUS).toBe(13200);
    expect(LAVA_COUNT).toBe(45);
  });

  it('exports gravity presets and buoyancy modes', () => {
    expect(GRAVITY_PRESETS.length).toBeGreaterThanOrEqual(3);
    expect(BUOYANCY_MODES.length).toBeGreaterThanOrEqual(3);
  });
});

describe('calculateParticleBuoyancy', () => {
  it('floats organic molecules on ocean surface with positive buoyancy', () => {
    const buoyancy = calculateParticleBuoyancy({
      isMineral: false,
      currentRadius: PLANET_RADIUS + 120,
      oceanRadius: PLANET_RADIUS + 140,
      groundRadius: PLANET_RADIUS - 50,
    });
    expect(buoyancy.floating).toBe(true);
    expect(buoyancy.state).toBe('floating');
    expect(buoyancy.targetRadius).toBeGreaterThan(PLANET_RADIUS + 140);
  });

  it('sinks inorganic heavy minerals to seabed with negative buoyancy', () => {
    const seabed = PLANET_RADIUS - 40;
    const buoyancy = calculateParticleBuoyancy({
      isMineral: true,
      currentRadius: PLANET_RADIUS + 120,
      oceanRadius: PLANET_RADIUS + 140,
      groundRadius: seabed,
    });
    expect(buoyancy.floating).toBe(false);
    expect(buoyancy.state).toBe('sinking');
    expect(buoyancy.targetRadius).toBeCloseTo(seabed + 2.2);
  });

  it('rests particles on solid dry land', () => {
    const mountainTop = PLANET_RADIUS + 320;
    const buoyancy = calculateParticleBuoyancy({
      isMineral: false,
      currentRadius: mountainTop,
      oceanRadius: PLANET_RADIUS + 140,
      groundRadius: mountainTop,
    });
    expect(buoyancy.floating).toBe(false);
    expect(buoyancy.state).toBe('ground');
    expect(buoyancy.targetRadius).toBeCloseTo(mountainTop + 2.5);
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
    // Without Fe-S, score=3 stays as molecule (< threshold of 6)
    const withoutFeS = classifyReaction({ atomKeys: ['C', 'H', 'O'], organicScore: 3 });
    // With Fe-S, score=3+4=7 >= threshold of 6, becomes polymer
    const withFeS = classifyReaction({ atomKeys: ['C', 'H', 'O', 'Fe', 'S'], organicScore: 3 });
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
    // score 11 >= threshold of 10, energy 0.50 > 0.35
    const result = classifyReaction({ previousStage: 'protocell', atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 11, energy: 0.50 });
    expect(result.stage).toBe('organism');
    expect(result.messages[0]).toContain('Primitive metabolic life emerged');
  });

  it('evolves complex multicellular life from high-energy organisms', () => {
    // score 17 >= threshold of 16, energy 0.55 > 0.40
    const result = classifyReaction({ previousStage: 'organism', atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 17, energy: 0.55 });
    expect(result.stage).toBe('complex');
    expect(result.messages[0]).toContain('Complex motile colonial organism evolved');
  });
});
