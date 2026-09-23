import { Document, NodeIO } from '@gltf-transform/core';

const TAU = Math.PI * 2;

// Base colours are linear, as glTF baseColorFactor requires. Hues are far apart for screenshot diffs.
const MATERIALS = {
  Band: { color: [1.0, 0.55, 0.12], metallic: 1, roughness: 0.3 },
  Stone: { color: [0.55, 0.8, 1.0], metallic: 0, roughness: 0.05 },
  // Unassigned; exists so `use: 'RoseGold'` has a variant to swap in.
  RoseGold: { color: [0.9, 0.3, 0.28], metallic: 1, roughness: 0.35 },
};

const STONES = { Stone_Small: 0.12, Stone_Medium: 0.18, Stone_Large: 0.26 };

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

// Flat-shaded, so faces are unindexed and each carries its own normal.
function gem(size) {
  const v = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1.3, 0],
    [0, -1.3, 0],
    [0, 0, 1],
    [0, 0, -1],
  ].map((p) => p.map((c) => c * size));
  const faces = [
    [0, 2, 4],
    [0, 4, 3],
    [0, 3, 5],
    [0, 5, 2],
    [1, 2, 5],
    [1, 5, 3],
    [1, 3, 4],
    [1, 4, 2],
  ];
  const positions = [];
  const normals = [];
  for (const [a, b, c] of faces) {
    const [p, q, r] = [v[a], v[b], v[c]];
    const e1 = q.map((x, k) => x - p[k]);
    const e2 = r.map((x, k) => x - p[k]);
    const n = [
      e1[1] * e2[2] - e1[2] * e2[1],
      e1[2] * e2[0] - e1[0] * e2[2],
      e1[0] * e2[1] - e1[1] * e2[0],
    ];
    const length = Math.hypot(...n);
    positions.push(...p, ...q, ...r);
    for (let k = 0; k < 3; k++) normals.push(...n.map((x) => x / length));
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

export async function writeRing(path, { tube = 0.1, radial = 24 } = {}) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const materials = Object.fromEntries(
    Object.entries(MATERIALS).map(([name, { color, metallic, roughness }]) => [
      name,
      doc
        .createMaterial(name)
        .setBaseColorFactor([...color, 1])
        .setMetallicFactor(metallic)
        .setRoughnessFactor(roughness),
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
      .setMesh(mesh(doc, buffer, name, gem(size), materials.Stone))
      .setTranslation([0, radius + tube + size * 1.3, 0]);
    scene.addChild(node);
  }
  await new NodeIO().write(path, doc);
}

await writeRing('public/models/ring.glb');
// Thick, square-section band with the same part and material names, for the model swap demo.
await writeRing('public/models/ring-alt.glb', { tube: 0.22, radial: 4 });
