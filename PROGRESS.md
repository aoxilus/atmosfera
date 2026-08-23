# atmosfera Progress 🥑

## Current Visible Build

`v4-beta-emergence-engine`

This label is shown in the HUD under `Build`. If the browser does not show this exact label, it is displaying an old cached version — hard refresh with `Ctrl+F5`.

> **⚠️ BETA — Not yet functioning as intended.**
> Life emergence is technically implemented but not visually reliable yet.
> The mathematical rules are correct and tested (16/16 unit tests passing),
> but the visual experience does not yet match the vision of spontaneous, visible life arising over time.

---

## ✅ What Currently Works

- **3D Planet**: Low-poly globe (radius `13200`), multi-octave terrain, abyssal basins, mountain peaks.
- **45 Volcanic Craters**: Deeply anchored into bedrock, pulsing magma, emitting 7 prebiotic molecules (`Fe-S`, `H2S`, `SO2`, `HCN`, `CO2`, `NH3`, `PolyP`).
- **Dynamic Ocean**: Smooth tidal breathing cycle (±68 units, zero Z-fighting vibration via `polygonOffset`).
- **Atmospheric Clouds**: Translucent clustered low-poly clouds with soft transparency.
- **Celestial Bodies**: Orbiting Sun (directional light + shadows) and Moon (point light).
- **Gravity & Buoyancy Physics**: Deterministic inward gravity, organic particles float on ocean, minerals sink to seabed.
- **Gravity Preset Button**: `Earth (1.0x)`, `Super-Earth (2.2x)`, `Low-G Moon (0.35x)`.
- **Buoyancy Mode Button**: `Active Bobbing`, `Hyper-Buoyant Surface Film`, `Dense Fluid`.
- **Particle Simulation**: Up to 680 particles, atoms rain from atmosphere, volcanoes and meteors continuously seed the surface.
- **Chemistry Rule Engine**: `classifyReaction()` deterministically promotes atoms → molecule → polymer → protocell → organism → complex.
- **Catalytic Acceleration**: Fe-S clusters and polyphosphates boost molecular bonding (+4, +3 to organic score).
- **6 Tidal Hotspots**: Molecules and polymers in ocean shallows are attracted to 6 fixed coastal basins to simulate concentration.
- **Organism Swimming**: Primitive organisms (`#ffe26e`) and complex life (`#00ffd5`) swim autonomously, feed on nearby atoms.
- **Mitosis**: Organisms replicate when energy > 0.78 and consumed ≥ 1 atom.
- **HUD Telemetry**: Live counts of Atoms, Molecules, Polymers, Protocells, Organisms, Complex Life, Floating vs Seabed particles, World Era.
- **Unit Tests**: 16/16 Vitest tests passing, covering all mathematical rules.
- **GitHub Automation**: `push-github.ps1` / `push-github.bat` one-click commit and backup.

---

## ❌ Known Issues / Not Yet Working as Intended

| Issue | Status | Notes |
| :--- | :---: | :--- |
| Life does not emerge visibly on its own | ⚠️ Active | Chemistry accumulates slowly; user must click "Catalyze life" to see organisms |
| Organism population does not sustain itself | ⚠️ Active | Organisms are created but do not persist long enough to form visible colonies |
| Tidal hotspot concentration is subtle | ⚠️ Active | Drift force is gentle; molecules do not visibly cluster yet |
| No clear transition "event" visible to user | ⚠️ Active | When a protocell or organism forms, there is no visible flash/explosion cue |
| Organisms disappear after a short time | ⚠️ Active | Energy drains before enough food can be consumed |
| No biome differentiation | 📋 Roadmap | All ocean zones behave identically; no warm/cold distinctions |

---

## Architecture

```
abiogenesis-sandbox/
├── index.html               # HTML5 structure, HUD, controls
├── style.css                # Dark glassmorphism UI
├── main.js                  # Three.js scene, physics loops, particle system
├── simulation-core.js       # Pure deterministic math rules (testable)
├── simulation-core.test.js  # 16/16 Vitest unit tests
├── matrix-stream.js         # CLI telemetry stream (npm run matrix)
├── push-github.ps1          # One-click GitHub commit & push
├── push-github.bat          # Windows double-click launcher
└── package.json             # Vite + Vitest scripts
```

---

## Completed Build Passes

- [x] `v1` — Initial Vite + Three.js planet, terrain, ocean.
- [x] `v2` — Volcanoes, meteors, particle system, abiogenesis rule ladder.
- [x] `v3` — Motile organisms, mitosis, interactive gravity/buoyancy controls, HUD telemetry.
- [x] `v3i` — Gravity presets, buoyancy modes, removed floating wind box lines.
- [x] `v4-beta` — Emergence fixes: particles no longer consumed on combine, tidal hotspots, protected particle slots, lowered thresholds, easier mitosis.

---

## Next Steps to Make Life Emerge Reliably

- [ ] Add energy regeneration from sunlight/heat for organisms so they don't die fast.
- [ ] Make protocell → organism transition fire a visible particle burst event (flash ring).
- [ ] Add a "concentration event" log in HUD when tidal hotspot hits density threshold.
- [ ] Increase food density near hotspots so organisms can feed and sustain.
- [ ] Introduce organism persistence: when an organism dies, it leaves nutrient atoms behind.

---

*Made with 🥑 by [aoxilus](https://github.com/aoxilus)*
