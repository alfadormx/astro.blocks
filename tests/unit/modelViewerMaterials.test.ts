import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { familyName, mergeMaterials } from '~/utils/modelViewerMaterials';

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
