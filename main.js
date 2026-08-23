/**
 * atmosfera — low-poly primordial planet sandbox.
 * 🥑 by aoxilus · CC BY-NC-SA 4.0
 */

import * as THREE from 'three';
import {
  BUILD_LABEL,
  LAVA_COUNT,
  PLANET_RADIUS,
  TIDE_SPEED,
  VOLCANIC_COMPOUNDS,
  calculateAbiogenesisOdds,
  clamp,
  classifyReaction,
  reactionProbability,
  terrainHeight as getTerrainHeight,
} from './simulation-core.js';

const canvas = document.querySelector('#world');

const hud = {
  atoms: document.querySelector('#atoms'),
  molecules: document.querySelector('#molecules'),
  polymers: document.querySelector('#polymers'),
  protocells: document.querySelector('#protocells'),
  organisms: document.querySelector('#organisms'),
  complex: document.querySelector('#complex'),
  era: document.querySelector('#era'),
  build: document.querySelector('#build'),
  events: document.querySelector('#events'),
  legend: document.querySelector('#legend'),
  oddsMatrix: document.querySelector('#odds-matrix'),
};

const buildLabel = BUILD_LABEL;

const atoms = [
  { key: 'O', name: 'Oxygen', color: '#82d6ff', weight: 25, organic: 1 },
  { key: 'H', name: 'Hydrogen', color: '#f5fbff', weight: 20, organic: 1 },
  { key: 'C', name: 'Carbon', color: '#7ef0c1', weight: 12, organic: 3 },
  { key: 'N', name: 'Nitrogen', color: '#b49cff', weight: 10, organic: 2 },
  { key: 'Si', name: 'Silicon', color: '#d7b58c', weight: 8, organic: 0 },
  { key: 'Fe', name: 'Iron', color: '#ff8c66', weight: 6, organic: 0 },
  { key: 'S', name: 'Sulfur', color: '#ffe26e', weight: 4, organic: 1 },
  { key: 'P', name: 'Phosphorus', color: '#ff7bd3', weight: 3, organic: 2 },
  { key: 'Ca', name: 'Calcium', color: '#d8e6c4', weight: 3, organic: 0 },
  { key: 'Na', name: 'Sodium', color: '#ffcc9a', weight: 3, organic: 0 },
  { key: 'Cl', name: 'Chlorine', color: '#9cff9c', weight: 3, organic: 0 },
  { key: 'M', name: 'Trace metals', color: '#b8c2cc', weight: 3, organic: 0 },
];

const totalWeight = atoms.reduce((sum, atom) => sum + atom.weight, 0);
const planetRadius = PLANET_RADIUS;
const visibleRadius = 1600;
const tideSpeed = TIDE_SPEED;
const particleUpdateBudget = 180;
const reactionCheckBudget = 120;
const particles = [];
const events = [];
const lavaPools = [];
const volcanoVents = [];
const chemistryHotspots = [];
const clouds = [];
const windParticles = [];
const keys = new Set();
const pointer = { dragging: false, x: 0, y: 0 };
const clock = new THREE.Clock();
let running = true;
let tick = 0;
let focus = new THREE.Vector3(0, planetRadius + 420, 0);
let yaw = 0;
let pitch = -0.22;
let distance = 9600;
let particleCursor = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#020712');
scene.fog = new THREE.FogExp2('#07111c', 0.000052);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120000);

const ambient = new THREE.HemisphereLight('#9ed7ff', '#29180c', 2.2);
scene.add(ambient);

const sun = new THREE.DirectionalLight('#fff3cf', 4.2);
sun.position.set(-34000, 28000, 19000);
sun.castShadow = true;
scene.add(sun);

const sunMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(210, 2),
  new THREE.MeshBasicMaterial({ color: '#fff0a8' }),
);
sunMesh.position.copy(sun.position).normalize().multiplyScalar(52000);
scene.add(sunMesh);

const moon = new THREE.Mesh(
  new THREE.IcosahedronGeometry(190, 2),
  new THREE.MeshStandardMaterial({ color: '#b8c4cd', roughness: 0.92, flatShading: true }),
);
moon.position.set(26000, 11000, -21000);
moon.castShadow = true;
moon.receiveShadow = true;
scene.add(moon);

const moonLight = new THREE.PointLight('#b8d5ff', 1.9, 42000);
moonLight.position.copy(moon.position);
scene.add(moonLight);

const planet = new THREE.Group();
scene.add(planet);

const particleGroup = new THREE.Group();
scene.add(particleGroup);

const meteorGroup = new THREE.Group();
scene.add(meteorGroup);

const tempVector = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

const materials = {
  land: new THREE.MeshStandardMaterial({ color: '#41533d', roughness: 0.95, flatShading: true }),
  highland: new THREE.MeshStandardMaterial({ color: '#6b7053', roughness: 0.95, flatShading: true }),
  mountain: new THREE.MeshStandardMaterial({ color: '#7d766a', roughness: 0.96, flatShading: true }),
  ocean: new THREE.MeshStandardMaterial({
    color: '#0c6381',
    roughness: 0.68,
    metalness: 0.08,
    transparent: true,
    opacity: 0.78,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: -2.0,
    polygonOffsetUnits: -4.0,
  }),
  cloud: new THREE.MeshStandardMaterial({
    color: '#f0fbff',
    roughness: 0.92,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    flatShading: true,
  }),
  wind: new THREE.MeshBasicMaterial({
    color: '#8fe1ff',
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  }),
  lava: new THREE.MeshStandardMaterial({ color: '#ff5b1a', emissive: '#ff2600', emissiveIntensity: 1.9, roughness: 0.55, flatShading: true }),
  meteor: new THREE.MeshStandardMaterial({ color: '#ffbc6b', emissive: '#ff6a00', emissiveIntensity: 1.3, flatShading: true }),
  atmosphere: new THREE.MeshBasicMaterial({ color: '#8bd7ff', transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false }),
};

function pickAtom() {
  let roll = Math.random() * totalWeight;
  for (const atom of atoms) {
    roll -= atom.weight;
    if (roll <= 0) return atom;
  }
  return atoms[0];
}

function addEvent(text) {
  events.unshift(text);
  events.length = Math.min(events.length, 12);
  hud.events.innerHTML = events.map((event) => `<li>${event}</li>`).join('');
}

function randomSurfacePoint(radius = planetRadius) {
  const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
  return direction.multiplyScalar(radius);
}

for (let i = 0; i < 9; i += 1) chemistryHotspots.push(randomSurfacePoint(1).normalize());

function pickHotspotDirection() {
  if (Math.random() < 0.72) {
    const hotspot = chemistryHotspots[Math.floor(Math.random() * chemistryHotspots.length)];
    return hotspot.clone().add(randomSurfacePoint(0.18 + Math.random() * 0.22)).normalize();
  }
  return randomSurfacePoint(1).normalize();
}

function surfacePointWithAltitude(altitude = 80, direction = pickHotspotDirection()) {
  return direction.multiplyScalar(planetRadius + terrainHeight(direction) + altitude);
}

function terrainHeight(direction) {
  return getTerrainHeight(direction, planetRadius);
}

function makePlanetSurface() {
  const geometry = new THREE.IcosahedronGeometry(planetRadius, 7);
  const position = geometry.attributes.position;
  const color = new THREE.Color();
  const colors = [];

  for (let i = 0; i < position.count; i += 1) {
    tempVector.fromBufferAttribute(position, i).normalize();
    const height = terrainHeight(tempVector);
    const landRadius = planetRadius + height;
    position.setXYZ(i, tempVector.x * landRadius, tempVector.y * landRadius, tempVector.z * landRadius);

    if (height > 6.5) color.set('#8d8272');
    else if (height > 3.0) color.set('#5e6d44');
    else if (height > 0.0) color.set('#344a30');
    else if (height > -5.0) color.set('#283b27');
    else color.set('#18241d');
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  planet.add(mesh);
}

function makeOcean() {
  const ocean = new THREE.Mesh(new THREE.IcosahedronGeometry(planetRadius + 140, 6), materials.ocean);
  ocean.name = 'ocean';
  planet.add(ocean);
}

function makeAtmosphere() {
  const atmosphere = new THREE.Mesh(new THREE.IcosahedronGeometry(planetRadius + 920, 7), materials.atmosphere);
  atmosphere.name = 'atmosphere';
  planet.add(atmosphere);
}

function makeClouds() {
  const upAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 48; i += 1) {
    const direction = randomSurfacePoint(1).normalize();
    const altitude = planetRadius + 360 + Math.random() * 280;
    const cloud = new THREE.Group();

    // Multi-part low-poly cloud cluster
    const mainPuff = new THREE.Mesh(new THREE.DodecahedronGeometry(18 + Math.random() * 22, 0), materials.cloud);
    mainPuff.scale.set(3.2 + Math.random() * 2.5, 0.6 + Math.random() * 0.35, 1.6 + Math.random() * 1.2);
    cloud.add(mainPuff);

    const sidePuff = new THREE.Mesh(new THREE.DodecahedronGeometry(12 + Math.random() * 14, 0), materials.cloud);
    sidePuff.position.set((Math.random() - 0.5) * 45, 0, (Math.random() - 0.5) * 35);
    sidePuff.scale.set(2.2, 0.55, 1.3);
    cloud.add(sidePuff);

    cloud.position.copy(direction.clone().multiplyScalar(altitude));
    cloud.quaternion.setFromUnitVectors(upAxis, direction);

    const latitude = direction.y;
    const windSpeed = (Math.abs(latitude) < 0.45 ? -0.018 : 0.026) * (0.8 + Math.random() * 0.4);
    cloud.userData = { altitude, latitude, windSpeed, spin: (Math.random() - 0.5) * 0.003 };
    planet.add(cloud);
    clouds.push(cloud);
  }
}

function makeWindStreams() {
  const upAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 260; i += 1) {
    const direction = randomSurfacePoint(1).normalize();
    const altitude = planetRadius + 220 + Math.random() * 340;
    const length = 32 + Math.random() * 55;
    const windMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.1, length),
      materials.wind
    );
    windMesh.position.copy(direction.clone().multiplyScalar(altitude));
    const latitude = direction.y;
    const windSpeed = (Math.abs(latitude) < 0.45 ? -0.052 : 0.078) * (0.85 + Math.random() * 0.3);
    windMesh.userData = { altitude, latitude, windSpeed };
    planet.add(windMesh);
    windParticles.push(windMesh);
  }
}

function updateWinds(delta) {
  const upAxis = new THREE.Vector3(0, 1, 0);

  for (const cloud of clouds) {
    cloud.position.applyAxisAngle(upAxis, cloud.userData.windSpeed * delta);
    const dir = cloud.position.clone().normalize();
    cloud.position.copy(dir.multiplyScalar(cloud.userData.altitude));
    cloud.quaternion.setFromUnitVectors(upAxis, dir);
    cloud.rotation.y += cloud.userData.spin;
  }

  for (const wind of windParticles) {
    wind.position.applyAxisAngle(upAxis, wind.userData.windSpeed * delta);
    const dir = wind.position.clone().normalize();
    wind.position.copy(dir.multiplyScalar(wind.userData.altitude));
    const tangent = new THREE.Vector3().crossVectors(upAxis, dir).normalize();
    if (wind.userData.windSpeed < 0) tangent.negate();
    wind.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
  }
}

function makeVolcanoes() {
  for (let i = 0; i < LAVA_COUNT; i += 1) {
    const direction = pickHotspotDirection();
    const radius = 60 + Math.random() * 140;
    const segments = 8 + Math.floor(Math.random() * 4);
    const height = 130 + Math.random() * 210;
    const baseRadius = radius * (1.6 + Math.random() * 0.7);
    const craterRadius = radius * 0.58;
    const volcano = new THREE.Group();
    const surfaceH = terrainHeight(direction);

    // Anchor volcano group firmly at the terrain surface
    volcano.position.copy(direction.clone().multiplyScalar(planetRadius + surfaceH));
    volcano.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    // Deep mountain cone extending down into bedrock (3.2x height) to guarantee zero floating edges on slopes
    const totalLength = height * 3.2;
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(craterRadius, baseRadius * 2.2, totalLength, segments),
      materials.mountain
    );
    cone.position.y = height - totalLength * 0.5;
    cone.castShadow = true;
    cone.receiveShadow = true;
    volcano.add(cone);

    const rim = new THREE.Mesh(new THREE.RingGeometry(craterRadius * 0.7, craterRadius * 1.28, segments), materials.mountain);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = height + 1;
    rim.castShadow = true;
    volcano.add(rim);

    const crater = new THREE.Mesh(new THREE.CircleGeometry(craterRadius * 0.75, segments), materials.lava.clone());
    crater.rotation.x = -Math.PI / 2;
    crater.position.y = height + 3;
    crater.userData.phase = Math.random() * Math.PI * 2;
    lavaPools.push(crater);
    volcano.add(crater);

    const glow = new THREE.PointLight('#ff4a10', 3.5, 620);
    glow.position.y = height + 28;
    volcano.add(glow);

    planet.add(volcano);
    volcanoVents.push({ direction, group: volcano, radius });
  }
}

function updateLavaPools() {
  for (const pool of lavaPools) {
    const pulse = (Math.sin(tick * tideSpeed + pool.userData.phase) + 1) * 0.5;
    pool.scale.set(1 + pulse * 0.035, 1 + pulse * 0.018, 1 + pulse * 0.035);
    pool.material.color.lerpColors(new THREE.Color('#c81e0b'), new THREE.Color('#ff8a18'), pulse);
    pool.material.emissive.lerpColors(new THREE.Color('#7a0d05'), new THREE.Color('#ff3b00'), pulse);
  }
}

function emitVolcanicChemistry() {
  if (tick % 20 !== 0 || volcanoVents.length === 0) return;
  const vent = volcanoVents[Math.floor(Math.random() * volcanoVents.length)];
  const metallic = atoms.filter((atom) => ['Fe', 'Si', 'S', 'P', 'M', 'Ca', 'Na', 'C'].includes(atom.key));
  const burstCount = 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < burstCount; i += 1) {
    const kind = metallic[Math.floor(Math.random() * metallic.length)];
    const originDirection = vent.direction.clone().add(randomSurfacePoint(0.015)).normalize();
    spawnParticle(kind, surfacePointWithAltitude(85 + Math.random() * 170, originDirection), {
      scale: 1.35,
      energy: 0.68 + Math.random() * 0.25,
      velocity: vent.direction.clone().multiplyScalar(0.35 + Math.random() * 0.28).add(randomSurfacePoint(0.06)),
    });
  }

  // Diverse prebiotic volcanic molecules (Fe-S, H2S, SO2, HCN, CO2, NH3, PolyP)
  if (Math.random() < 0.45) {
    const compound = VOLCANIC_COMPOUNDS[Math.floor(Math.random() * VOLCANIC_COMPOUNDS.length)];
    spawnVolcanicMolecule(vent, compound);
  }

  if (tick % 240 === 0) {
    addEvent('Volcanic hydrothermal burst: catalytic minerals and prebiotic molecules entered surface chemistry.');
  }
}

function spawnVolcanicMolecule(vent, compound = VOLCANIC_COMPOUNDS[0]) {
  spawnParticle(compound, surfacePointWithAltitude(110 + Math.random() * 140, vent.direction.clone()), {
    stage: 'molecule',
    label: compound.key,
    scale: 1.85,
    energy: compound.energy,
    velocity: vent.direction.clone().multiplyScalar(0.42 + Math.random() * 0.22).add(randomSurfacePoint(0.07)),
  });
}

function makeStars() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 900; i += 1) {
    const star = randomSurfacePoint(planetRadius + 3600 + Math.random() * 3600);
    positions.push(star.x, star.y, star.z);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#dcefff', size: 1.2, sizeAttenuation: true }));
  scene.add(stars);
}

function makeParticleMesh(kind) {
  const geometry = new THREE.IcosahedronGeometry(1.1 + Math.random() * 1.05, 0);
  const material = new THREE.MeshStandardMaterial({ color: kind.color, emissive: kind.color, emissiveIntensity: 0.22, flatShading: true });
  return new THREE.Mesh(geometry, material);
}

function spawnParticle(kind = pickAtom(), position = surfacePointWithAltitude(45 + Math.random() * 155), options = {}) {
  if (particles.length > 520) return;
  const mesh = makeParticleMesh(kind);
  mesh.position.copy(position);
  const scale = options.scale || 1.0;
  mesh.scale.setScalar(scale);
  mesh.castShadow = true;
  particleGroup.add(mesh);

  particles.push({
    mesh,
    atoms: [kind.key],
    organic: kind.organic || 0,
    energy: options.energy ?? Math.random(),
    stage: options.stage || 'atom',
    label: options.label || kind.key,
    velocity: options.velocity || randomSurfacePoint(1).multiplyScalar(0.08),
    baseScale: scale,
    phase: Math.random() * Math.PI * 2,
    swimSeed: Math.random() * 100,
    consumed: 0,
  });
}

function seedOrganics() {
  const organics = atoms.filter((atom) => ['C', 'H', 'O', 'N', 'P', 'S'].includes(atom.key));
  for (let i = 0; i < 75; i += 1) spawnParticle(organics[Math.floor(Math.random() * organics.length)], surfacePointWithAltitude(25 + Math.random() * 80));
  addEvent('Organic-rich compounds seeded near the ocean skin.');
}

function catalyzeLifeHotspots() {
  for (const vent of volcanoVents.slice(0, 10)) {
    const compound = VOLCANIC_COMPOUNDS[Math.floor(Math.random() * VOLCANIC_COMPOUNDS.length)];
    spawnVolcanicMolecule(vent, compound);
  }
  for (let i = 0; i < 45; i += 1) {
    const pAtom = atoms.find((a) => a.key === 'P') || atoms[0];
    const sAtom = atoms.find((a) => a.key === 'S') || atoms[0];
    const cAtom = atoms.find((a) => a.key === 'C') || atoms[0];
    spawnParticle(pAtom, surfacePointWithAltitude(25 + Math.random() * 50));
    spawnParticle(sAtom, surfacePointWithAltitude(25 + Math.random() * 50));
    spawnParticle(cAtom, surfacePointWithAltitude(25 + Math.random() * 50));
  }
  addEvent('✨ Hydrothermal Life Catalyst triggered: high-energy P-S-C compounds seeded.');
}

function meteorStorm() {
  for (let i = 0; i < 18; i += 1) {
    const target = surfacePointWithAltitude(120);
    const start = target.clone().normalize().multiplyScalar(planetRadius + 18000 + Math.random() * 9000);
    const meteor = new THREE.Mesh(new THREE.IcosahedronGeometry(12 + Math.random() * 10, 0), materials.meteor);
    meteor.position.copy(start);
    meteor.userData.velocity = target.sub(start).normalize().multiplyScalar(140 + Math.random() * 100);
    meteor.userData.life = 260;
    meteorGroup.add(meteor);
  }
  for (let i = 0; i < 80; i += 1) spawnParticle();
  addEvent('Meteor storm added fresh Earth-like atoms.');
}

function combine(a, b) {
  const previousStage = a.stage;
  const atomsJoined = [...a.atoms, ...b.atoms].slice(0, 20);
  const rawOrganicScore = a.organic + b.organic;
  const energy = Math.min(1, (a.energy + b.energy) / 2 + Math.random() * 0.22);
  const altitude = a.mesh.position.length() - planetRadius;
  const isTidalPool = altitude >= 0 && altitude <= 90;

  // Run deterministic reaction classification from simulation-core
  const reaction = classifyReaction({
    previousStage,
    atomKeys: atomsJoined,
    organicScore: rawOrganicScore,
    energy,
    isTidalPool,
  });

  a.mesh.position.lerp(b.mesh.position, 0.5);
  a.mesh.material.color.set(reaction.color);
  a.mesh.material.emissive.set(reaction.color);
  a.mesh.scale.setScalar(reaction.scale);
  a.atoms = atomsJoined;
  a.organic = reaction.effectiveScore;
  a.energy = energy;
  a.stage = reaction.stage;
  a.baseScale = reaction.scale;
  b.dead = true;

  for (const msg of reaction.messages) {
    addEvent(msg);
  }

  if (previousStage === 'atom' && reaction.stage === 'molecule' && Math.random() < 0.34) {
    addEvent(`Prebiotic bonding: ${atomsJoined.slice(0, 4).join('-')} formed an active molecular cluster.`);
  }
}

function reactVisibleParticles() {
  const visible = particles.filter((particle) => particle.mesh.position.distanceTo(focus) < visibleRadius && !particle.dead);
  const maxChecks = Math.min(reactionCheckBudget, visible.length * 2);

  for (let i = 0; i < maxChecks; i += 1) {
    const a = visible[Math.floor(Math.random() * visible.length)];
    const b = visible[Math.floor(Math.random() * visible.length)];
    if (!a || !b || a === b || a.dead || b.dead) continue;

    const dist = a.mesh.position.distanceTo(b.mesh.position);
    const hasCatalyst = a.atoms.includes('Fe') || a.atoms.includes('S') || a.atoms.includes('P') || b.atoms.includes('Fe');
    const altitude = a.mesh.position.length() - planetRadius;
    const isTidalPool = altitude >= 0 && altitude <= 90;

    const prob = reactionProbability({
      distance: dist,
      maxDistance: 26,
      energy: (a.energy + b.energy) * 0.5,
      hasCatalyst,
      isTidalPool,
    });

    if (Math.random() < prob) combine(a, b);
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    if (!particles[i].dead) continue;
    particleGroup.remove(particles[i].mesh);
    particles[i].mesh.geometry.dispose();
    particles[i].mesh.material.dispose();
    particles.splice(i, 1);
  }
}

function updateParticles(delta) {
  if (tick % 4 === 0) spawnParticle(undefined, surfacePointWithAltitude(45 + Math.random() * 155, focus.clone().normalize().add(randomSurfacePoint(0.12)).normalize()));
  if (tick % 420 === 0) addEvent('Local atoms drift through wind, gravity, and tide zones.');
  const updates = Math.min(particleUpdateBudget, particles.length);

  for (let i = 0; i < updates; i += 1) {
    const particle = particles[particleCursor % particles.length];
    particleCursor += 1;
    if (!particle || particle.dead) continue;
    const position = particle.mesh.position;
    const direction = position.clone().normalize();

    // 1. Motility and Autonomous Locomotion for Life Forms
    if (particle.stage === 'protocell') {
      // Membrane breathing respiration pulse
      const pulse = Math.sin(tick * 0.08 + particle.phase) * 0.14;
      particle.mesh.scale.setScalar(particle.baseScale * (1 + pulse));
    } else if (particle.stage === 'organism' || particle.stage === 'complex') {
      // Autonomous Swimming / Crawling across Ocean & Tidal Flats
      if (!particle.heading) {
        particle.heading = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
      }
      particle.heading.applyAxisAngle(direction, Math.sin(tick * 0.06 + particle.swimSeed) * 0.09);
      const swimSpeed = (particle.stage === 'complex' ? 140 : 95) * delta;
      position.addScaledVector(particle.heading, swimSpeed);

      // Undulating cilia / flagella rotation
      particle.mesh.rotation.z = Math.sin(tick * 0.16 + particle.swimSeed) * 0.45;

      // Active Nutrient Feeding: absorb nearby raw atoms within reach
      for (const other of particles) {
        if (other !== particle && !other.dead && other.stage === 'atom' && position.distanceTo(other.mesh.position) < 28) {
          other.dead = true;
          particle.organic += 1;
          particle.consumed += 1;
          particle.energy = Math.min(1, particle.energy + 0.12);
          break;
        }
      }

      // Mitosis (Cell Division): Organisms with excess energy divide and replicate
      if (particle.energy > 0.88 && particle.consumed >= 4 && particles.length < 500 && Math.random() < 0.04) {
        particle.energy *= 0.52;
        particle.consumed = 0;
        const daughterPos = position.clone().add(randomSurfacePoint(25));
        spawnParticle(atoms.find((a) => a.key === 'C') || atoms[0], daughterPos, {
          stage: 'protocell',
          scale: 2.7,
          energy: 0.72,
        });
        addEvent('🌱 Cellular mitosis: an organism divided and reproduced in a nutrient-rich tidal pool!');
      }
    }

    // 2. Physical forces (Gravity, Terrain Clamping, Wind Drift)
    const surface = direction.clone().multiplyScalar(planetRadius + terrainHeight(direction) + 45);
    const gravity = surface.sub(position).multiplyScalar(0.018);
    particle.velocity.add(gravity);
    particle.velocity.multiplyScalar(0.986);
    position.addScaledVector(particle.velocity, delta * 55);

    // Tangential atmospheric wind force
    const upAxis = new THREE.Vector3(0, 1, 0);
    const windTangent = new THREE.Vector3().crossVectors(upAxis, direction).normalize();
    const latitude = direction.y;
    const windStrength = Math.abs(latitude) < 0.45 ? -0.15 : 0.22;
    if (windStrength < 0) windTangent.negate();
    particle.velocity.addScaledVector(windTangent, Math.abs(windStrength) * 0.006);

    const minSurface = position.clone().normalize();
    const minRadius = planetRadius + terrainHeight(minSurface) + 24;
    if (position.length() < minRadius) {
      position.normalize().multiplyScalar(minRadius);
      particle.velocity.multiplyScalar(-0.25);
    }
    particle.mesh.rotation.x += delta * 0.9;
    particle.mesh.rotation.y += delta * 1.2;
    particle.mesh.visible = position.distanceTo(focus) < visibleRadius;
  }
  reactVisibleParticles();
}

function updateMeteors() {
  const meteorUpdates = Math.min(24, meteorGroup.children.length);
  for (let i = meteorUpdates - 1; i >= 0; i -= 1) {
    const meteor = meteorGroup.children[i];
    meteor.position.add(meteor.userData.velocity);
    meteor.rotation.x += 0.12;
    meteor.rotation.y += 0.08;
    meteor.userData.life -= 1;
    if (meteor.position.length() < planetRadius + 6 || meteor.userData.life <= 0) {
      for (let j = 0; j < 8; j += 1) spawnParticle(undefined, surfacePointWithAltitude(30 + Math.random() * 120));
      addEvent('Meteor impact scattered new reactive atoms.');
      meteorGroup.remove(meteor);
      meteor.geometry.dispose();
    }
  }
}

function updateNavigation(delta) {
  const speed = (keys.has('shift') ? 1800 : 920) * delta;
  forward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
  right.set(forward.z, 0, -forward.x).normalize();
  if (keys.has('w') || keys.has('arrowup')) focus.addScaledVector(forward, speed);
  if (keys.has('s') || keys.has('arrowdown')) focus.addScaledVector(forward, -speed);
  if (keys.has('d') || keys.has('arrowright')) focus.addScaledVector(right, speed);
  if (keys.has('a') || keys.has('arrowleft')) focus.addScaledVector(right, -speed);
  if (keys.has('q')) yaw += delta * 1.8;
  if (keys.has('e')) yaw -= delta * 1.8;
  if (keys.has('r')) distance = Math.max(650, distance - 5200 * delta);
  if (keys.has('f')) distance = Math.min(52000, distance + 5200 * delta);

  const focusDirection = focus.clone().normalize();
  const minHeight = planetRadius + terrainHeight(focusDirection) + 320;
  if (focus.length() < minHeight) focus.copy(focusDirection.multiplyScalar(minHeight));

  const cameraOffset = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(-distance);
  camera.position.copy(focus).add(cameraOffset);
  const cameraDirection = camera.position.clone().normalize();
  const minCameraHeight = planetRadius + terrainHeight(cameraDirection) + 180;
  if (camera.position.length() < minCameraHeight) camera.position.copy(cameraDirection.multiplyScalar(minCameraHeight));
  camera.lookAt(focus);
}

function updateHud() {
  const counts = particles.reduce(
    (total, particle) => {
      total[particle.stage] = (total[particle.stage] || 0) + 1;
      return total;
    },
    { atom: 0, molecule: 0, polymer: 0, protocell: 0, organism: 0, complex: 0 },
  );

  hud.atoms.textContent = counts.atom;
  hud.molecules.textContent = counts.molecule;
  hud.polymers.textContent = counts.polymer;
  if (hud.protocells) hud.protocells.textContent = counts.protocell;
  if (hud.organisms) hud.organisms.textContent = counts.organism;
  if (hud.complex) hud.complex.textContent = counts.complex;

  hud.era.textContent = counts.complex
    ? 'Colonial complex life'
    : counts.organism
    ? 'Primitive swimming life'
    : counts.protocell
    ? 'Protocells'
    : counts.polymer
    ? 'Polymers'
    : counts.molecule
    ? 'Chemistry'
    : 'Atom rain';
}

function frame() {
  const delta = Math.min(clock.getDelta(), 0.033);
  tick += 1;
  if (running) {
    updateNavigation(delta);
    planet.rotation.y += delta * 0.015;
    moon.rotation.y += delta * 0.08;
    moon.rotation.x += delta * 0.025;

    // Dynamic smooth ocean tide without Z-fighting or vibration
    const ocean = planet.getObjectByName('ocean');
    if (ocean) {
      const tideFactor = Math.sin(tick * tideSpeed);
      ocean.scale.setScalar(1 + tideFactor * 0.0052);
      if (tick % 540 === 0) {
        if (tideFactor > 0.65) {
          addEvent('🌊 High Tide: rising ocean waters submerge coastal shallows and tidal flats.');
        } else if (tideFactor < -0.65) {
          addEvent('🏖️ Low Tide: ocean recedes, exposing mineral-rich hydrothermal flats.');
        }
      }
    }

    updateWinds(delta);
    updateLavaPools();
    emitVolcanicChemistry();
    updateParticles(delta);
    updateMeteors();
  }
  if (tick % 8 === 0) updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

hud.legend.innerHTML = atoms
  .map((atom) => `<div class="legend-row"><span class="swatch" style="background:${atom.color}"></span><span>${atom.name}</span><strong>${atom.weight}%</strong></div>`)
  .join('');
hud.build.textContent = buildLabel;

// Render calculated abiogenesis probabilities
const odds = calculateAbiogenesisOdds();
if (hud.oddsMatrix) {
  hud.oddsMatrix.innerHTML = `
    <div class="legend-row"><span class="swatch" style="background:#7ef0c1"></span><span>Prebiotic Elements (CHONPS)</span><strong>${Math.round(odds.prebioticAtomAbundance * 100)}%</strong></div>
    <div class="legend-row"><span class="swatch" style="background:#8fe1ff"></span><span>Molecular Bonding / Hit</span><strong>${Math.round(odds.molecularBondingPerCollision.catalyzed * 100)}% (cat)</strong></div>
    <div class="legend-row"><span class="swatch" style="background:#ff7bd3"></span><span>Protocell Vesicle Enclosure</span><strong>${Math.round(odds.protocellEnclosureChance.withPhosphorusSulfur * 100)}%</strong></div>
    <div class="legend-row"><span class="swatch" style="background:#ffe26e"></span><span>Primitive Life in Tidal Flats</span><strong>${Math.round(odds.primitiveLifeEmergence.warmTidalFlats * 100)}%</strong></div>
    <div class="legend-row"><span class="swatch" style="background:#00ffd5"></span><span>Mitosis & Replication Rate</span><strong>${Math.round(odds.mitosisDivisionRate * 100)}%</strong></div>
  `;
}

document.querySelector('#toggle').addEventListener('click', (event) => {
  running = !running;
  event.currentTarget.textContent = running ? 'Pause' : 'Resume';
});
document.querySelector('#seed').addEventListener('click', seedOrganics);
const catalyzeBtn = document.querySelector('#catalyze');
if (catalyzeBtn) catalyzeBtn.addEventListener('click', catalyzeLifeHotspots);
document.querySelector('#storm').addEventListener('click', meteorStorm);
window.addEventListener('resize', resize);
canvas.addEventListener('pointerdown', (event) => {
  pointer.dragging = true;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!pointer.dragging) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  yaw -= dx * 0.004;
  pitch = Math.max(-1.18, Math.min(0.82, pitch + dy * 0.003));
});
canvas.addEventListener('pointerup', (event) => {
  pointer.dragging = false;
  canvas.releasePointerCapture(event.pointerId);
});
canvas.addEventListener('pointercancel', () => {
  pointer.dragging = false;
});
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  distance = Math.max(650, Math.min(52000, distance + event.deltaY * 10));
}, { passive: false });
window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'q', 'e', 'r', 'f', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

makePlanetSurface();
makeOcean();
makeAtmosphere();
makeClouds();
makeWindStreams();
makeVolcanoes();
makeStars();
resize();
meteorStorm();
seedOrganics();
addEvent('Low-poly primordial planet initialized.');
frame();
