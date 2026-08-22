import { describe, expect, it } from 'vitest';
import { BUILD_LABEL, LAVA_COUNT, PLANET_RADIUS, TIDE_SPEED, classifyReaction, lavaPulse, terrainHeight, tideScale } from './simulation-core.js';

describe('simulation constants', () => {
  it('documents the current visible build label', () => {
    expect(BUILD_LABEL).toBe('v3d-interaction-log-restored');
  });

  it('keeps the large planet and 5x lava count', () => {
    expect(PLANET_RADIUS).toBe(13200);
    expect(LAVA_COUNT).toBe(45);
  });

  it('uses tide timing at 1/8 of the earlier 0.03 speed', () => {
    expect(TIDE_SPEED).toBeCloseTo(0.03 / 8);
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
  it('keeps ocean tide subtle', () => {
    expect(tideScale(0)).toBeCloseTo(1);
    expect(Math.abs(tideScale(1000) - 1)).toBeLessThanOrEqual(0.00075);
  });

  it('keeps lava pulse normalized', () => {
    expect(lavaPulse(0)).toBeGreaterThanOrEqual(0);
    expect(lavaPulse(0)).toBeLessThanOrEqual(1);
    expect(lavaPulse(1000, 1.2)).toBeGreaterThanOrEqual(0);
    expect(lavaPulse(1000, 1.2)).toBeLessThanOrEqual(1);
  });
});

describe('classifyReaction', () => {
  it('forms molecule by default', () => {
    expect(classifyReaction({ atomKeys: ['H', 'O'], organicScore: 2 }).stage).toBe('molecule');
  });

  it('forms polymer from rich organic chains', () => {
    const result = classifyReaction({ atomKeys: ['C', 'H', 'O', 'N', 'P'], organicScore: 15 });
    expect(result.stage).toBe('polymer');
    expect(result.messages).toContain('Organic molecules linked into a polymer chain.');
  });

  it('forms protocell when phosphorus, sulfur, and energy are present', () => {
    const result = classifyReaction({ atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 18, energy: 0.8 });
    expect(result.stage).toBe('protocell');
    expect(result.messages).toContain('A protocell formed on the visible planet surface.');
  });

  it('forms organism from protocell with enough score and energy', () => {
    const result = classifyReaction({ previousStage: 'protocell', atomKeys: ['C', 'H', 'O', 'N', 'P', 'S'], organicScore: 20, energy: 0.7 });
    expect(result.stage).toBe('organism');
    expect(result.messages).toContain('Primitive life emerged in a warm tidal zone.');
  });
});
