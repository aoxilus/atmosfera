# atmosfera Progress 🥑

## Current Visible Build

`v3g-motile-organisms-mitosis-abiogenesis-odds`

This label is shown in the HUD under `Build`. If the browser does not show this exact label, it is displaying an old cached/server version.

## Current State & Architecture

- **Planetary Body**: Low-poly Three.js globe with radius `13200`. Multi-octave relief (abyssal basins, coastal shelves, fertile lowlands, highland steppes, rocky mountain peaks).
- **Volcanic Bedrock Anchors**: 45 volcanic craters deeply anchored with cylindrical bases extending $3.2\times$ their height ($>250-650$ units) into the planet mantle, completely eliminating floating edges on any slope.
- **Ocean Tides & Anti-Vibration**: Ocean mesh configured with `polygonOffset: true` (factor `-2.0`, units `-4.0`) and staggered tessellation (detail 6 vs terrain detail 7), completely eliminating coastline Z-fighting. Sea level oscillates smoothly by $\pm 68$ units in a 32-second breathing cycle.
- **Translucent Clustered Clouds & Atmospheric Winds**:
  - Clouds feature soft depth-independent transparency (`opacity: 0.32`, `depthWrite: false`) arranged in multi-part polyhedral clusters.
  - 260 flowing wind particles stream across equatorial trade winds (westward) and mid-latitude westerlies (eastward).
  - Floating atmospheric atoms experience tangential wind drift vectors.
- **Diverse Volcanic Geochemistry**:
  - Eruptions emit mineral dust (`Fe`, `Si`, `S`, `P`, `Ca`, `Na`, `C`, `M`) and complex prebiotic molecules: `Fe-S` (iron-sulfur catalyst), `H2S`, `SO2`, `HCN`, `CO2`, `NH3`, and `PolyP` (polyphosphate energy chains).
- **Abiogenesis Mathematical Engine**:
  - Deterministic probability calculations via `reactionProbability()` and `calculateAbiogenesisOdds()`.
  - Catalytic acceleration: `Fe-S` clusters and polyphosphates boost molecular bonding and lower polymer energy barriers.
  - Tidal concentration bonus in coastal shallows ($0 < \text{altitude} < 90$).
- **Autonomous Motile Life & Mitosis**:
  - **Protocells (`#ff7bd3`)**: Membrane pulsation respiration (`sin(tick * 0.08)`).
  - **Primitive Organisms (`#ffe26e`)**: Autonomous sinusoidal swimming locomotion ($95 \text{ units/s}$), cilia rotation, and active nutrient feeding.
  - **Complex Colonial Life (`#00ffd5`)**: High-speed swimming ($140 \text{ units/s}$) with **Cellular Mitosis** (replicates and spawns daughter organisms when energy $> 0.88$).
- **Interactive Controls & HUD**:
  - `Pause / Resume`, `Seed organics`, `Catalyze life`, `Meteor storm`.
  - Telemetry counters for Atoms, Molecules, Polymers, Protocells, Organisms, Complex Life, and World Era.
  - Real-time Abiogenesis Probability Calculator display card.
- **Automation & Git**:
  - Automation scripts `push-github.ps1` and `push-github.bat` for one-click commit, backup, and push to GitHub.

## Completed Passes

- [x] Full bilingual GitHub documentation (`README.md` and `README.es.md`).
- [x] Automation scripts for rapid sync and backup (`push-github.ps1`, `push-github.bat`).
- [x] Fixed volcano anchoring (deep roots into bedrock).
- [x] Added visible atmospheric wind streams and latitudinal cloud drift.
- [x] Eliminated ocean Z-fighting vibration via polygonOffset and smoothed tidal breathing.
- [x] Enriched volcanic emissions with 7 prebiotic molecular compounds.
- [x] Added mathematical abiogenesis odds calculator.
- [x] Implemented motile swimming and crawling locomotion for organisms.
- [x] Added active nutrient feeding and cellular mitosis (replication).
- [x] Added "Catalyze life" control and telemetry display.

## How To Verify

1. Open `http://localhost:5173`.
2. Hard refresh with `Ctrl+F5`.
3. Confirm HUD displays `Build: v3g-motile-organisms-mitosis-abiogenesis-odds`.
4. Observe the flowing cyan wind streams, translucent clouds, and smooth ocean breathing.
5. Click **Catalyze life** and zoom in to watch golden and cyan organisms actively swim across the tidal shallows and reproduce.

---

*Made with 🥑 by [aoxilus](https://github.com/aoxilus)*
