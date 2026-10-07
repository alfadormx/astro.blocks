import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsIOR } from '@gltf-transform/extensions';

const TAU = Math.PI * 2;

// Base colours are linear, as glTF baseColorFactor requires. Metal hues are far apart for
// screenshot diffs. Stone is an opaque diamond (IOR 2.418) so ModelViewer's stone tuning has a
// real target; its dark body (#606060 in sRGB) lets the facet reflections carry the look.
const MATERIALS = {
  Band: { color: [1.0, 0.55, 0.12], metallic: 1, roughness: 0.3 },
  Stone: { color: [0.117, 0.117, 0.117], metallic: 0, roughness: 0, ior: 2.418 },
  // Unassigned; exists so `use: 'RoseGold'` has a variant to swap in.
  RoseGold: { color: [0.9, 0.3, 0.28], metallic: 1, roughness: 0.35 },
};

const STONES = { Stone_Small: 0.12, Stone_Medium: 0.18, Stone_Large: 0.26 };

const ACCENT_SIZE = 0.06;
// Radians along the band: the first pair clears Stone_Large, later pairs step outward.
const ACCENT_GAP = 0.2;
const ACCENT_STEP = 0.16;

function torus(radius, tube, radial, tubular) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let j = 0; j <= radial; j++) {
    const v = (j / radial) * TAU;
    for (let i = 0; i <= tubular; i++) {
      const u = (i / tubular) * TAU;
      const x = (radius + tube * Math.cos(v)) * Math.cos(u);
      const y = (radius + tube * Math.cos(v)) * Math.sin(u);
      const z = tube * Math.sin(v);
      positions.push(x, y, z);
      const nx = x - Math.cos(u) * radius;
      const ny = y - Math.sin(u) * radius;
      const length = Math.hypot(nx, ny, z);
      normals.push(nx / length, ny / length, z / length);
    }
  }
  for (let j = 1; j <= radial; j++) {
    for (let i = 1; i <= tubular; i++) {
      const a = (tubular + 1) * j + i - 1;
      const b = (tubular + 1) * (j - 1) + i - 1;
      const c = (tubular + 1) * (j - 1) + i;
      const d = (tubular + 1) * j + i;
      indices.push(a, b, d, b, c, d);
    }
  }
  return { positions, normals, indices };
}

// Round brilliant proportions, as fractions of the girdle radius. Angles follow the Tolkowsky cut.
const TABLE = 0.55;
const STAR = 0.775;
const LOWER_HALF = 0.2;
const GIRDLE = 0.02;
const CROWN = (1 - TABLE) * Math.tan((34.5 * Math.PI) / 180);
const PAVILION = Math.tan((40.75 * Math.PI) / 180);

function ring(count, radius, y, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + offset) / count) * TAU;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  });
}

// 57 flat-shaded facets, table up (+Y) and culet at -PAVILION × size: each facet catches a
// different part of the environment, which is what reads as sparkle on an opaque stone.
function brilliant(size) {
  const table = ring(8, TABLE, CROWN);
  const stars = ring(8, STAR, (CROWN * (1 - STAR)) / (1 - TABLE), 0.5);
  const upper = ring(16, 1, GIRDLE);
  const lower = ring(16, 1, -GIRDLE);
  const halves = ring(8, LOWER_HALF, -PAVILION * (1 - LOWER_HALF), 0.5);
  const culet = [0, -PAVILION, 0];
  const top = [0, CROWN, 0];
  const facets = [];
  for (let k = 0; k < 8; k++) {
    const next = (k + 1) % 8;
    const prev = (k + 7) % 8;
    const g = 2 * k;
    const g1 = g + 1;
    const g2 = (g + 2) % 16;
    facets.push([top, table[k], table[next]]);
    facets.push([table[k], table[next], stars[k]]);
    facets.push([table[k], stars[prev], upper[g], stars[k]]);
    facets.push([stars[k], upper[g], upper[g1]], [stars[k], upper[g1], upper[g2]]);
    facets.push(
      [upper[g], upper[g1], lower[g1], lower[g]],
      [upper[g1], upper[g2], lower[g2], lower[g1]]
    );
    facets.push([lower[g], lower[g1], halves[k]], [lower[g1], lower[g2], halves[k]]);
    facets.push([lower[g], halves[prev], culet, halves[k]]);
  }
  const positions = [];
  const normals = [];
  for (const facet of facets) {
    const points = facet.map((p) => p.map((c) => c * size));
    // Newell's method gives one normal per facet, so slightly non-planar kites still shade flat.
    const n = [0, 0, 0];
    points.forEach((p, i) => {
      const q = points[(i + 1) % points.length];
      n[0] += (p[1] - q[1]) * (p[2] + q[2]);
      n[1] += (p[2] - q[2]) * (p[0] + q[0]);
      n[2] += (p[0] - q[0]) * (p[1] + q[1]);
    });
    const centre = [0, 1, 2].map((k) => points.reduce((sum, p) => sum + p[k], 0) / points.length);
    const outward = n[0] * centre[0] + n[1] * centre[1] + n[2] * centre[2] > 0;
    const ordered = outward ? points : [...points].reverse();
    const length = Math.hypot(...n) * (outward ? 1 : -1);
    for (let i = 1; i < ordered.length - 1; i++) {
      positions.push(...ordered[0], ...ordered[i], ...ordered[i + 1]);
      for (let k = 0; k < 3; k++) normals.push(...n.map((x) => x / length));
    }
  }
  return { positions, normals };
}

function mesh(doc, buffer, name, geometry, material) {
  const accessor = (type, array) =>
    doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
  const primitive = doc
    .createPrimitive()
    .setAttribute('POSITION', accessor('VEC3', new Float32Array(geometry.positions)))
    .setAttribute('NORMAL', accessor('VEC3', new Float32Array(geometry.normals)))
    .setMaterial(material);
  if (geometry.indices) primitive.setIndices(accessor('SCALAR', new Uint16Array(geometry.indices)));
  return doc.createMesh(name).addPrimitive(primitive);
}

function createMaterial(doc, name, { color, metallic, roughness, ior }) {
  const material = doc
    .createMaterial(name)
    .setBaseColorFactor([...color, 1])
    .setMetallicFactor(metallic)
    .setRoughnessFactor(roughness);
  if (!ior) return material;
  return material.setExtension(
    'KHR_materials_ior',
    doc.createExtension(KHRMaterialsIOR).createIOR().setIOR(ior)
  );
}

export async function writeRing(path, { tube = 0.1, radial = 24, pave = 0 } = {}) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const materials = Object.fromEntries(
    Object.entries(MATERIALS).map(([name, factors]) => [
      name,
      // Pavé writes per-mesh copies, as exporters like KeyShot do, so ModelViewer must merge them.
      createMaterial(doc, pave && name === 'Band' ? 'Band_1' : name, factors),
    ])
  );
  const radius = 1;
  const scene = doc.createScene();
  scene.addChild(
    doc
      .createNode('Band')
      .setMesh(mesh(doc, buffer, 'Band', torus(radius, tube, radial, 96), materials.Band))
  );
  for (const [name, size] of Object.entries(STONES)) {
    const node = doc
      .createNode(name)
      .setMesh(mesh(doc, buffer, name, brilliant(size), materials.Stone))
      .setTranslation([0, radius + tube + size * PAVILION, 0]);
    scene.addChild(node);
  }
  for (let i = 1; i <= pave; i++) {
    const side = i % 2 ? -1 : 1;
    const tilt = side * (ACCENT_GAP + Math.floor((i - 1) / 2) * ACCENT_STEP);
    const angle = Math.PI / 2 + tilt;
    const material = createMaterial(doc, `Stone_${i}`, MATERIALS.Stone);
    const node = doc
      .createNode(`Accent_${i}`)
      .setMesh(mesh(doc, buffer, `Accent_${i}`, brilliant(ACCENT_SIZE), material))
      .setTranslation([Math.cos(angle) * (radius + tube), Math.sin(angle) * (radius + tube), 0])
      .setRotation([0, 0, Math.sin(tilt / 2), Math.cos(tilt / 2)]);
    scene.addChild(node);
  }
  await new NodeIO().registerExtensions([KHRMaterialsIOR]).write(path, doc);
}

await writeRing('public/models/ring.glb');
// Thick, square-section band with the same part and material names, for the model swap demo.
await writeRing('public/models/ring-alt.glb', { tube: 0.22, radial: 4 });
await writeRing('public/models/ring-pave.glb', { pave: 8 });
