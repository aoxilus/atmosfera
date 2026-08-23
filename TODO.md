# atmosfera TODO 🥑

## Current Build

`v4-beta-emergence-engine` — **⚠️ BETA — Life does not yet emerge reliably on its own.**

The simulation runs, the physics are real, the math is tested — but the visual payoff (watching life spontaneously appear and colonize the oceans) is not yet reliably achievable without clicking buttons.

---

## ✅ Completed Milestones

### 1. 🪐 3D Planet & Rendering Foundation
- [x] Vite + Three.js planet globe, multi-octave procedural terrain.
- [x] Dynamic tidal ocean, zero Z-fighting via `polygonOffset` and staggered tessellation.
- [x] Translucent clustered low-poly clouds with atmospheric drift.
- [x] Orbiting Sun (directional light) and Moon (point light + shadows).
- [x] Atmospheric scattering glow shell and star field.

### 2. 🌋 Geochemistry & Volcanic Systems
- [x] 45 active volcanic craters deeply anchored into planetary bedrock.
- [x] Synchronized lava pulsing with thermal emissions.
- [x] 7 prebiotic volcanic compound types (`Fe-S`, `H2S`, `SO2`, `HCN`, `CO2`, `NH3`, `PolyP`).
- [x] Meteor storm impacts delivering cosmic interstellar atoms.

### 3. 🧪 Abiogenesis Rule Engine
- [x] 12 primordial elements with calibrated organic scores.
- [x] Deterministic `classifyReaction()` — atoms → molecule → polymer → protocell → organism → complex.
- [x] `reactionProbability()` with proximity, catalyst, and tidal-pool bonuses.
- [x] Real-time Abiogenesis Probability Calculator matrix in HUD.

### 4. ⚡ Gravity & Buoyancy Physics
- [x] Deterministic inward planetary gravity.
- [x] Organic particle ocean buoyancy with harmonic wave bobbing.
- [x] Mineral sinking to seabed (negative buoyancy).
- [x] Interactive gravity preset buttons (`Earth`, `Super-Earth`, `Low-G Moon`).
- [x] Interactive buoyancy mode buttons (`Active`, `Hyper-Buoyant`, `Dense Fluid`).
- [x] Floating vs Seabed telemetry counters in HUD.

### 5. 🧬 Motile Life & Mitosis
- [x] Protocell membrane pulsation.
- [x] Organism autonomous sinusoidal swimming and cilia rotation.
- [x] Active nutrient feeding (organisms absorb nearby atoms).
- [x] Cellular mitosis (division when energy > 0.78 and consumed ≥ 1).

### 6. 🔧 Emergence Engine Fixes (v4-beta)
- [x] Particles no longer destroyed on combine — B atom survives as free atom.
- [x] 6 tidal hotspot concentrators draw molecules toward coastal basins.
- [x] Advanced-stage particles protected from pool eviction (only atoms evicted).
- [x] Lowered emergence thresholds: polymer ≥6, protocell >0.38, organism ≥10, complex ≥16.
- [x] Mitosis thresholds relaxed: energy >0.78, consumed ≥1, probability 12%.

### 7. 📚 Documentation & Automation
- [x] Bilingual GitHub docs (`README.md`, `README.es.md`).
- [x] `PROGRESS.md` with beta status and known issues table.
- [x] `push-github.ps1` + `push-github.bat` one-click backup automation.
- [x] `matrix-stream.js` — CLI matrix telemetry feed (`npm run matrix`).
- [x] 16/16 Vitest unit tests passing.

---

## 🔴 Open Issues (Must Fix for Life to Emerge)

- [ ] **Organism energy drain too fast**: Organisms lose energy and die before finding food. Need passive energy regeneration from ambient heat/sunlight.
- [ ] **No visible emergence event**: When a protocell or organism forms, there is no flash, ring, or visual cue. Add a visible burst/glow effect.
- [ ] **Food desert problem**: Atoms spread across the whole planet; organisms swim in food-sparse zones. Hotspot food density must be higher.
- [ ] **Organisms don't leave nutrients on death**: When an organism dies, it vanishes. It should release 2-3 atom particles as food for neighbors.
- [ ] **Tidal concentration not strong enough**: Molecules are gently attracted but don't visibly cluster. Increase attractor force inside < 800 units of hotspot center.

---

## 🔮 Future Roadmap

- [ ] **Genetic Mutation & Traits**: Speed, light attraction, thermal tolerance bitmask per organism.
- [ ] **Biome Zones**: Distinct hydrothermal vents, glacial poles, shallow reef zones.
- [ ] **Sound & Ambient Audio**: Procedural wind, ocean, volcanic, and bonding chime sounds (Web Audio API).
- [ ] **Surface / Probe Mode**: First-person ground-level exploration rover camera.
- [ ] **Save & Load World**: Export/import world seeds and particle snapshots as JSON.
- [ ] **Log Export**: Button to save interaction log as `.txt` or `.json`.
- [ ] **GitHub Pages Deployment**: Automated GitHub Actions for live public URL.

---

*Made with 🥑 by [aoxilus](https://github.com/aoxilus)*
