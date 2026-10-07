import {
  BoxGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Scene,
  Texture,
} from 'three';
import { describe, expect, it } from 'vitest';
import { familyName, mergeMaterials, tuneStones } from '~/utils/modelViewerMaterials';

type Def = { name?: string } & Record<string, unknown>;

function load(defs: Def[]) {
  const materials = defs.map((def) => new MeshStandardMaterial({ name: def.name ?? '' }));
  const meshes = materials.map((m) => new Mesh(new BoxGeometry(), m));
  const root = new Group().add(...meshes);
  const parser = {
    json: { materials: defs },
    associations: new Map(materials.map((m, i) => [m, { materials: i }])),
  };
  return { root, meshes, materials, parser };
}

const gold = { pbrMetallicRoughness: { baseColorFactor: [1, 0.77, 0.34, 1], roughnessFactor: 0 } };

describe('mergeMaterials', () => {
  it('merges same-family materials with equal definitions into one instance', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Gold_#1_6', ...gold },
      { name: 'Gold_#1_7', ...gold },
    ]);

    const { merged, aliases } = mergeMaterials(root, parser);

    expect(meshes[0].material).toBe(materials[0]);
    expect(meshes[1].material).toBe(materials[0]);
    expect(merged).toEqual([materials[1]]);
    expect(aliases.get(materials[0])).toEqual(['Gold_#1_7']);
  });

  it('treats key order inside a definition as irrelevant', () => {
    const { root, meshes, parser } = load([
      { name: 'Gold_1', ...gold },
      {
        pbrMetallicRoughness: { roughnessFactor: 0, baseColorFactor: [1, 0.77, 0.34, 1] },
        name: 'Gold_2',
      },
    ]);

    mergeMaterials(root, parser);

    expect(meshes[1].material).toBe(meshes[0].material);
  });

  it('keeps same-family materials apart when definitions differ', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Gold_1', pbrMetallicRoughness: { roughnessFactor: 0 } },
      { name: 'Gold_2', pbrMetallicRoughness: { roughnessFactor: 0.3 } },
    ]);

    const { merged } = mergeMaterials(root, parser);

    expect(meshes[1].material).toBe(materials[1]);
    expect(merged).toEqual([]);
  });

  it('keeps different families apart even when definitions are equal', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Band', ...gold },
      { name: 'Prong', ...gold },
    ]);

    mergeMaterials(root, parser);

    expect(meshes[1].material).toBe(materials[1]);
  });

  it('keeps loader variants apart when vertex colours differ', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Gold_1', ...gold },
      { name: 'Gold_2', ...gold },
    ]);
    materials[1].vertexColors = true;

    mergeMaterials(root, parser);

    expect(meshes[1].material).toBe(materials[1]);
  });

  it('keeps derivative-tangent variants apart from tangent ones', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Gold_1', ...gold },
      { name: 'Gold_2', ...gold },
    ]);
    materials[1].normalScale.y = -1;

    mergeMaterials(root, parser);

    expect(meshes[1].material).toBe(materials[1]);
  });

  it('leaves a material without a glTF association untouched', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Gold_1', ...gold },
      { name: 'Gold_2', ...gold },
    ]);
    parser.associations.delete(materials[1]);

    const { merged } = mergeMaterials(root, parser);

    expect(meshes[1].material).toBe(materials[1]);
    expect(merged).toEqual([]);
  });

  it('merges inside multi-material meshes', () => {
    const { root, meshes, materials, parser } = load([
      { name: 'Gold_1', ...gold },
      { name: 'Gold_2', ...gold },
    ]);
    const multi = new Mesh(new BoxGeometry(), [materials[0], materials[1]]);
    root.add(multi);

    mergeMaterials(root, parser);

    expect(multi.material).toEqual([materials[0], materials[0]]);
    expect(meshes[1].material).toBe(materials[0]);
  });
});

describe('familyName', () => {
  it.each([
    ['Gold_24k_Polished_#1_6', 'Gold_24k_Polished_#1'],
    ['Stone_3', 'Stone'],
    ['Band', 'Band'],
    ['Stone_Small', 'Stone_Small'],
    ['Band_1_2', 'Band_1'],
    ['', ''],
  ])('strips one trailing numeric suffix from %j', (name, family) => {
    expect(familyName(name)).toBe(family);
  });
});

function environment(): Scene {
  const scene = new Scene();
  scene.environment = new Texture();
  scene.environmentIntensity = 1.3;
  return scene;
}

describe('tuneStones', () => {
  it('gives a diamond a colour shift and a boosted scene environment', () => {
    const scene = environment();
    const stone = new MeshPhysicalMaterial({ ior: 2.418 });
    tuneStones([stone], scene);
    expect(stone.iridescence).toBeGreaterThan(0);
    expect(stone.envMap).toBe(scene.environment);
    expect(stone.envMapRotation).toBe(scene.environmentRotation);
    expect(stone.envMapIntensity).toBeGreaterThan(scene.environmentIntensity);
  });

  it('tunes a transmissive diamond too', () => {
    const stone = new MeshPhysicalMaterial({ transmission: 1, ior: 2.418 });
    tuneStones([stone], environment());
    expect(stone.iridescence).toBeGreaterThan(0);
    expect(stone.envMap).not.toBeNull();
  });

  it('keeps an iridescence the file declares', () => {
    const stone = new MeshPhysicalMaterial({ ior: 2.418, iridescence: 0.8 });
    tuneStones([stone], environment());
    expect(stone.iridescence).toBe(0.8);
    expect(stone.envMap).not.toBeNull();
  });

  it.each([
    { name: 'glass ior', make: () => new MeshPhysicalMaterial({ transmission: 1, ior: 1.5 }) },
    { name: 'sapphire ior', make: () => new MeshPhysicalMaterial({ ior: 1.77 }) },
    { name: 'standard material', make: () => new MeshStandardMaterial() },
  ])('leaves non-stones alone: $name', ({ make }) => {
    const material = make();
    tuneStones([material], environment());
    expect(material.envMap).toBeNull();
    expect(material.envMapIntensity).toBe(1);
    if (material instanceof MeshPhysicalMaterial) expect(material.iridescence).toBe(0);
  });

  it('adds only the colour shift when the scene has no environment', () => {
    const stone = new MeshPhysicalMaterial({ ior: 2.418 });
    tuneStones([stone], new Scene());
    expect(stone.iridescence).toBeGreaterThan(0);
    expect(stone.envMap).toBeNull();
  });

  it('gives the same result when run twice', () => {
    const scene = environment();
    const stone = new MeshPhysicalMaterial({ ior: 2.418 });
    tuneStones([stone], scene);
    const once = { iridescence: stone.iridescence, intensity: stone.envMapIntensity };
    tuneStones([stone], scene);
    expect({ iridescence: stone.iridescence, intensity: stone.envMapIntensity }).toEqual(once);
  });
});
