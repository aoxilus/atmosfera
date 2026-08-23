/**
 * matrix-stream.js — Terminal Matrix telemetry stream for atmosfera.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 * Run with: node matrix-stream.js
 */

import {
  BUILD_LABEL,
  LAVA_COUNT,
  PLANET_RADIUS,
  calculateAbiogenesisOdds,
  classifyReaction,
  reactionProbability,
} from './simulation-core.js';

const GREEN = '\x1b[32m';
const BRIGHT_GREEN = '\x1b[92m';
const CYAN = '\x1b[96m';
const YELLOW = '\x1b[93m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

console.clear();
console.log(`${BRIGHT_GREEN}================================================================================${RESET}`);
console.log(`${BRIGHT_GREEN}   🥑 ATMOSFERA MATRIX TELEMETRY STREAM — PRIMORDIAL SIMULATION CORE 🥑   ${RESET}`);
console.log(`${BRIGHT_GREEN}================================================================================${RESET}`);
console.log(`${GREEN}[CORE_INIT] Planet Radius  : ${PLANET_RADIUS} units${RESET}`);
console.log(`${GREEN}[CORE_INIT] Active Build   : ${BUILD_LABEL}${RESET}`);
console.log(`${GREEN}[CORE_INIT] Volcano Vents  : ${LAVA_COUNT} active magma craters${RESET}`);
const odds = calculateAbiogenesisOdds();
console.log(`${GREEN}[CORE_INIT] CHONPS Odds    : ${Math.round(odds.prebioticAtomAbundance * 100)}% Prebiotic Weight${RESET}`);
console.log(`${GREEN}[CORE_INIT] Polymer Vent   : ${Math.round(odds.polymerFormationChance.hydrothermalVent * 100)}% Catalyzed Synthesis${RESET}`);
console.log(`${DIM}--------------------------------------------------------------------------------${RESET}`);

const ATOMS = ['C', 'H', 'O', 'N', 'P', 'S', 'Fe', 'Si', 'Ca', 'Na'];
const STAGES = ['ATOM', 'MOLECULE', 'POLYMER', 'PROTOCELL', 'ORGANISM', 'COMPLEX'];

let cycle = 0;

function streamFrame() {
  cycle += 1;
  const id = '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
  const stage = STAGES[Math.floor(Math.random() * STAGES.length)];
  const x = (Math.random() * 26400 - 13200).toFixed(1).padStart(9);
  const y = (Math.random() * 26400 - 13200).toFixed(1).padStart(9);
  const z = (Math.random() * 26400 - 13200).toFixed(1).padStart(9);
  const energy = (0.35 + Math.random() * 0.65).toFixed(2);
  const atomsPresent = [ATOMS[Math.floor(Math.random() * ATOMS.length)], ATOMS[Math.floor(Math.random() * ATOMS.length)]];
  const state = Math.random() > 0.45 ? 'FLOATING_OCEAN' : 'SEABED_MINERAL';

  let color = GREEN;
  if (stage === 'PROTOCELL') color = CYAN;
  if (stage === 'ORGANISM' || stage === 'COMPLEX') color = YELLOW;

  const logLine = `${color}[CYCLE ${String(cycle).padStart(5, '0')}] [${id}] POS:(${x},${y},${z}) | STAGE:${stage.padEnd(9)} | E:${energy} | ${state.padEnd(14)} | ATOMS:[${atomsPresent.join('-')}]${RESET}`;
  console.log(logLine);

  if (cycle % 12 === 0) {
    console.log(`${BRIGHT_GREEN}>>> [EVENT ${id}] Cellular mitosis / Catalytic reaction triggered near hydrothermal boundary!${RESET}`);
  }

  if (cycle < 60) {
    setTimeout(streamFrame, 80);
  } else {
    console.log(`${BRIGHT_GREEN}================================================================================${RESET}`);
    console.log(`${GREEN}Matrix stream paused. Run again anytime with: node matrix-stream.js${RESET}`);
  }
}

streamFrame();
