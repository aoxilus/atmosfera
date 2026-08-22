# atmosfera TODO

## Current Goal

Improve the low-poly 3D planet scale so navigation, terrain, clouds, lava, meteors, and chemistry particles are easier to read.

## Session Checklist

- [x] Create a structured TODO file before changing scale values.
- [x] Tune planet/camera scale for better first view.
- [x] Tune terrain, ocean, clouds, volcanoes, meteors, and particle sizes.
- [x] Verify the app builds successfully.
- [x] Confirm localhost still responds.

## Current Scale Pass

- [x] Scale the globe about 10x larger.
- [x] Make chemistry particles about half as large.
- [x] Keep clouds visually similar unless they create render problems.
- [x] Make lava/volcano vents clearly visible.
- [x] Verify build and localhost again.

## Current Navigation And Space Pass

- [x] Add mouse camera control in addition to WASD.
- [x] Keep the planet slowly rotating.
- [x] Add a pale blue atmospheric shell/glow.
- [x] Add a visible sun-like light source.
- [x] Add a low-poly moon with its own pale light.
- [x] Verify build and localhost again.

## Current Planet-Only Scale Pass

- [x] Scale the planet radius and world distances 10x larger again.
- [x] Keep visible object sizes unchanged: particles, clouds, lava cones, meteors, sun mesh, and moon mesh.
- [x] Adapt camera clipping, fog, movement, focus height, atmosphere radius, and spawn distances.
- [x] Verify build and localhost again.

## Current Readability Pass

- [x] Make the planet rounder with more polygons.
- [x] Replace cone/tree-looking volcanoes with crater-style volcanoes.
- [x] Restore event logs for molecule, polymer, protocell, and life transitions.
- [x] Verify build and localhost again.

## Current Tide Lava Terrain Pass

- [x] Reduce ocean tide movement to 1/8 of the current motion.
- [x] Make the planet more spherical and less jagged.
- [x] Keep mountain/terrain height near 5% of the planet radius.
- [x] Change lava into a crater pool that pulses orange/red like a small tide.
- [x] Verify build and localhost again.

## Current Tide Timing Lava Pass

- [x] Reduce tide animation time/fps speed to 1/8.
- [x] Make lava use the same tide-like pulse timing as ocean, with red/orange color.
- [x] Increase lava/volcano count 5x.
- [x] Verify build and localhost again.

## Current Visibility Debug Pass

- [x] Review source values for planet radius, tide speed, and lava count.
- [x] Add HUD build label to prove the browser is loading the current code.
- [x] Add `PROGRESS.md` with current state and verification steps.
- [x] Restart Vite dev server.
- [x] Verify localhost serves the current build label.

## Current Interaction Log Pass

- [x] Restore a clearly named Interaction Log panel.
- [x] Make local chemistry interactions happen often enough at the new planet scale.
- [x] Add visible log entries for atoms drifting, bonding, polymers, protocells, life, meteors, and lava pulses.
- [x] Update progress documentation.
- [x] Verify build and localhost again.

## Current Test Pass

- [x] Add `simulation-core.js` for testable constants and pure logic.
- [x] Add Vitest unit tests for scale, tide, lava pulse, terrain cap, and reaction classification.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Push to GitHub if authentication allows.

## Current UX Volcano Chemistry Pass

- [x] Move Interaction Log below the planet viewer.
- [x] Show Atom Distribution below the viewer so it is not hidden in the side HUD.
- [x] Replace spaceship-looking volcanoes with surface crater lava pools.
- [x] Keep chemistry particles on or close to the planet surface instead of floating far away.
- [x] Restore detailed chemistry narration: atom, molecule, polymer, protocell, primitive life.
- [x] Run tests and build.
- [x] Update `PROGRESS.md`.

## Completed

- [x] Initial Vite project runs locally.
- [x] 2D canvas prototype created.
- [x] WASD navigation added to prototype.
- [x] Project migrated to Three.js.
- [x] Low-poly globe created.
- [x] Ocean, terrain, clouds, volcano lava, meteors, and chemistry particles added.
- [x] Nearby/visible particle chemistry checks added.
- [x] HUD and controls remain active.

## Next Ideas

- [ ] Add mouse drag orbit/look controls.
- [ ] Add surface walking mode attached to the globe.
- [ ] Add visible wind streams and storm bands.
- [ ] Add named molecules such as H2O, CO2, NH3, amino acids, lipids, and RNA-like chains.
- [ ] Add biome zones: hot vents, tidal pools, open ocean, ice, desert, volcanic islands.
- [ ] Add true chunk/region simulation per planet zone.
- [ ] Add save/load simulation seed.
- [ ] Add GitHub Pages deployment.
