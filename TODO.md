# atmosfera TODO 🥑

## Current Goal

Interactive, robust, and beautiful low-poly 3D simulation of planetary abiogenesis, prebiotic chemistry, and motile emergent life with automated GitHub synchronization.

---

## Completed Milestones

### 1. 🪐 3D Planet & Rendering Foundation
- [x] Initial Vite project with Three.js engine.
- [x] Procedural low-poly globe with multi-octave relief (abyssal basins, coastal shelves, fertile lowlands, rocky mountain summits).
- [x] Dynamic tidal ocean with smoothed sinusoidal breathing cycle.
- [x] Zero coastline vibration / Z-fighting via `polygonOffset` and staggered tessellation.
- [x] Translucent clustered low-poly clouds with depth-independent soft opacity (`opacity: 0.32`, `depthWrite: false`).
- [x] Flowing atmospheric jet streams and trade wind ribbons (260 flowing wind vectors).
- [x] Orbiting celestial bodies (Sun directional light + Moon point light with shadows).
- [x] Atmospheric scattering glow shell.

### 2. 🌋 Geochemistry & Volcanic Systems
- [x] 45 active volcanic craters deeply anchored $3.2\times$ into planetary bedrock (zero floating edges on slopes).
- [x] Synchronized magma crater pulsing with red/orange thermal emissions.
- [x] Multi-compound volcanic eruptions (`Fe-S`, `H2S`, `SO2`, `HCN`, `CO2`, `NH3`, `PolyP`).
- [x] Mineral ash and reactive metal bursts (`Fe`, `Si`, `S`, `P`, `Ca`, `Na`, `C`, `M`).
- [x] Meteor storm impacts delivering cosmic interstellar atoms.

### 3. 🧪 Abiogenesis Rule Ladder & Mathematical Engine
- [x] 12 Earth-inspired primordial elements with calibrated weights and organic scores.
- [x] Deterministic reaction classification (`classifyReaction()`).
- [x] Mathematical reaction probability engine (`reactionProbability()`).
- [x] Catalytic acceleration from Iron-Sulfur (`Fe-S`) minerals and polyphosphate chains.
- [x] Tidal pool concentration bonuses in coastal shallows.
- [x] Real-time Abiogenesis Probability Calculator matrix.

### 4. 🧬 Motile Life, Locomotion & Mitosis
- [x] **Protocells (`#ff7bd3`)**: Membrane breathing pulsation and littoral creeping.
- [x] **Primitive Organisms (`#ffe26e`)**: Autonomous sinusoidal swimming locomotion ($95 \text{ units/s}$), cilia rotation, and active nutrient feeding.
- [x] **Complex Colonial Life (`#00ffd5`)**: High-speed swimming ($140 \text{ units/s}$) with **Cellular Mitosis** (replication upon energy saturation).
- [x] Frame-budgeted non-blocking simulation loop locked at 60 FPS.

### 5. 🎮 User Interface & Telemetry
- [x] Free hybrid navigation (WASD, Q/E yaw, mouse drag orbit, mouse wheel / R/F altitude zoom, Shift turbo).
- [x] Surface collision clamping preventing camera from going below ground.
- [x] Telemetry HUD: Atoms, Molecules, Polymers, Protocells, Organisms, Complex Life, Era, and Build label.
- [x] Interactive controls: `Pause / Resume`, `Seed organics`, `Catalyze life`, `Meteor storm`.
- [x] Chronological Interaction Log feed.

### 6. 📚 Documentation, Branding & Automation
- [x] Full bilingual GitHub documentation (`README.md` and `README.es.md`).
- [x] Standard AOXILUS public branding (🥑 icon, CC BY-NC-SA 4.0 license, clean headers).
- [x] Automation scripts: `push-github.ps1` and `push-github.bat` for one-click commit, backup, and push to GitHub.
- [x] Vitest test suite (`14/14 tests passing`).
- [x] Synchronized remote repository on GitHub: [https://github.com/aoxilus/atmosfera](https://github.com/aoxilus/atmosfera).

---

## 🔮 Future Roadmap / Next Ideas

- [ ] **Log Export to Disk**: Add button to export simulation interaction logs as a `.txt` or `.json` file.
- [ ] **Genetic Mutation & Trait Evolution**: Introduce simple genetic bitmasks for organisms (speed, light attraction, thermal tolerance).
- [ ] **Biome Differentiation**: Distinct environmental zones (Hydrothermal vents, Glacial polar ice, Shallow coral-like reefs, Volcanic archipelagos).
- [ ] **Surface Walking / Probe Mode**: Ground-level exploration mode with first-person surface rover view.
- [ ] **Sound & Ambient Audio**: Procedural synthesized wind currents, ocean waves, volcanic rumblings, and chiming prebiotic bonding sounds (Web Audio API).
- [ ] **Save & Load World State**: Export and import world seeds and particle snapshots via JSON / LocalStorage.
- [ ] **GitHub Pages Deployment**: Automated GitHub Actions workflow to publish the live 3D simulation to web.

---

*Made with 🥑 by [aoxilus](https://github.com/aoxilus)*
