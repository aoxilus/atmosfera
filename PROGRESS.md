# atmosfera Progress

## Current Visible Build

`v3d-nonblocking-volcanic-emissions`

This label is shown in the HUD under `Build`. If the browser does not show this exact label, it is displaying an old cached/server version.

## Current State

- Three.js low-poly planet is active.
- Planet radius is `13200`.
- Terrain is smoother than earlier passes.
- Terrain/mountain displacement is capped at about `5%` of planet radius.
- Ocean tide animation speed is `1/8` of the earlier speed.
- Lava uses the same slow tide timing as the ocean.
- Lava color pulses from red to orange.
- Lava/volcano count is `45`.
- Chemistry particles are small relative to the planet.
- Interaction Log panel is restored and explicitly named in the HUD.
- Interaction Log now sits below the planet viewer, not inside the side HUD.
- Atom Distribution now sits below the planet viewer so it is easier to see.
- Volcanoes are now surface crater lava pools, not raised cone/spaceship shapes.
- Volcano craters are now varied low-poly polygons with multiple sizes.
- Volcanoes now have mountain/cone bases that extend into the terrain, with polygon lava on the top crater.
- Volcanoes emit metallic elements and reactive minerals into nearby surface chemistry.
- Volcanoes now emit visible bursts of metallic particles plus occasional Fe-S molecules.
- Simulation work is split into small per-frame budgets: particle updates, reaction checks, meteor updates, volcanic emission intervals, HUD updates, and render stay separate.
- Reaction checks are capped per frame so chemistry can coexist with navigation and rendering without blocking.
- Particle updates are processed through a rolling cursor so not every particle has to update every frame.
- Chemistry distribution is intentionally non-uniform through surface hotspots.
- Chemistry particles are pulled toward the surface/low atmosphere instead of floating high above the planet.
- Camera/focus are clamped above terrain so navigation should not go under the surface.
- Ocean/lava tide timing is slower to avoid visible vibration.
- Local atoms spawn more often near the camera focus so interactions are easier to see at planet scale.
- Mouse drag controls camera look/orbit.
- Mouse wheel controls zoom.
- `WASD` and arrow keys move the focus point.
- `R/F` zoom in/out.
- Sun and moon are visible light sources.
- Pale blue atmosphere shell is active.

## Why The Last Changes May Not Have Looked Obvious

- The planet was scaled up while object sizes were intentionally preserved, so from the default camera distance the scene can look similar unless zooming in.
- Lava craters are now correctly small compared to the larger planet, so they require zooming closer or flying over the surface.
- Vite can hot-reload, but browser cache or an older dev-server process can make it look like nothing changed.

## How To Verify

- Open `http://127.0.0.1:5173`.
- Hard refresh with `Ctrl+F5`.
- Confirm the HUD shows `Build: v3d-nonblocking-volcanic-emissions`.
- Use mouse wheel or `R` to zoom closer to the surface.
- Use `WASD` to travel around the globe and find red/orange crater pools.

## Completed This Session

- [x] Reviewed active source values in `main.js`.
- [x] Confirmed current source contains planet radius `13200`.
- [x] Confirmed current source contains tide speed `0.00375`.
- [x] Confirmed current source contains `45` volcano/lava craters.
- [x] Added visible HUD build label.
- [x] Added this progress document.

## Next Debug Steps If Still Not Visible

- [ ] Restart dev server.
- [ ] Hard refresh browser with `Ctrl+F5`.
- [ ] Open with cache-busting URL: `http://127.0.0.1:5173/?v=v3d-nonblocking-volcanic-emissions`.
- [ ] Temporarily add bright lava locator beacons if lava is too hard to find at planetary scale.

## Handoff For Tomorrow

- Current app is a Three.js low-poly primordial globe.
- Main scene file: `main.js`.
- Testable logic/constants: `simulation-core.js`.
- Tests: `simulation-core.test.js`.
- Run locally with `npm run dev`.
- Verify with `npm test` and `npm run build`.
- If changes do not appear in browser, hard refresh with `Ctrl+F5` and check the HUD build label.
