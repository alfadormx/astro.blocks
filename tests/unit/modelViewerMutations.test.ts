import { BoxGeometry, Group, Mesh, MeshStandardMaterial, SRGBColorSpace } from 'three';
import { describe, expect, it } from 'vitest';
import type { ModelViewerSelectionGroup } from '~/types/modelviewer.types';
import { applyState, createBaseline, effectiveSrc } from '~/utils/modelViewerMutations';

function part(name: string, material: MeshStandardMaterial): Mesh {
  const mesh = new Mesh(new BoxGeometry(), material);
  mesh.name = `${name}_1`;
  mesh.userData.name = name;
  return mesh;
}

function ring() {
  const band = new MeshStandardMaterial({
    name: 'Band',
    color: 0xffcc00,
    metalness: 1,
    roughness: 0.3,
  });
  const stone = new MeshStandardMaterial({ name: 'Stone' });
  const roseGold = new MeshStandardMaterial({ name: 'RoseGold' });
  const bandMesh = part('Band', band);
  const root = new Group().add(bandMesh, part('Stone_Small', stone), part('Stone_Large', stone));
  return { root, band, stone, roseGold, bandMesh, fileMaterials: [band, stone, roseGold] };
}

const hex = (m: MeshStandardMaterial) => m.color.getHexString(SRGBColorSpace);

const bandGroup: ModelViewerSelectionGroup = {
  options: {
    white: [{ type: 'material', material: 'Band', color: '#eeeeee', roughness: 0.1 }],
    red: [{ type: 'material', material: 'Band', color: '#ff0000' }],
    matte: [{ type: 'material', material: 'Band', roughness: 0.9, metalness: 0.2 }],
    rose: [{ type: 'material', part: 'Band', use: 'RoseGold' }],
  },
};

describe('applyState', () => {
  it('recolours the named material when its option is selected', () => {
    const { root, band, fileMaterials } = ring();
    const selections = { band: bandGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    expect(applyState(baseline, selections, { band: ['white'] })).toEqual([]);

    expect(hex(band)).toBe('eeeeee');
    expect(band.roughness).toBe(0.1);
  });

  it('reverts a group to the baseline when its selection is empty', () => {
    const { root, band, fileMaterials } = ring();
    const selections = { band: bandGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { band: ['white'] });
    applyState(baseline, selections, { band: [] });

    expect(hex(band)).toBe('ffcc00');
    expect(band.roughness).toBe(0.3);
    expect(band.metalness).toBe(1);
  });

  it('lets the later declared group win when two groups set the same property', () => {
    const { root, band, fileMaterials } = ring();
    const selections = {
      first: { options: { on: [{ type: 'material', material: 'Band', color: '#0000ff' }] } },
      second: { options: { on: [{ type: 'material', material: 'Band', color: '#00ff00' }] } },
    } satisfies Record<string, ModelViewerSelectionGroup>;
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { second: ['on'], first: ['on'] });

    expect(hex(band)).toBe('00ff00');
  });

  it('applies codes in selection order for a multiple group', () => {
    const { root, band, fileMaterials } = ring();
    const selections = { band: bandGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { band: ['red', 'white'] });
    expect(hex(band)).toBe('eeeeee');

    applyState(baseline, selections, { band: ['white', 'red'] });
    expect(hex(band)).toBe('ff0000');
    expect(band.roughness).toBe(0.1);
  });

  it('assigns a file material to a part with use and restores it on revert', () => {
    const { root, band, roseGold, bandMesh, fileMaterials } = ring();
    const selections = { band: bandGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { band: ['rose'] });
    expect(bandMesh.material).toBe(roseGold);

    applyState(baseline, selections, { band: [] });
    expect(bandMesh.material).toBe(band);
  });

  it('matches parts by the raw glTF name, not the sanitized three.js name', () => {
    const { root, roseGold, bandMesh, fileMaterials } = ring();
    const selections = {
      band: { options: { rose: [{ type: 'material', part: 'Band_1', use: 'RoseGold' }] } },
    } satisfies Record<string, ModelViewerSelectionGroup>;
    const baseline = createBaseline(root, fileMaterials, selections);

    const warnings = applyState(baseline, selections, { band: ['rose'] });

    expect(warnings).toEqual(['part "Band_1" is not in the model']);
    expect(bandMesh.material).not.toBe(roseGold);
  });

  it('warns and leaves the scene untouched when a material name is missing', () => {
    const { root, band, fileMaterials } = ring();
    const selections = {
      band: { options: { gold: [{ type: 'material', material: 'Gold', color: '#ff0000' }] } },
    } satisfies Record<string, ModelViewerSelectionGroup>;
    const baseline = createBaseline(root, fileMaterials, selections);

    const warnings = applyState(baseline, selections, { band: ['gold'] });

    expect(warnings).toEqual(['material "Gold" is not in the model']);
    expect(hex(band)).toBe('ffcc00');
  });

  it('warns when a use target or part is missing', () => {
    const { root, band, bandMesh, fileMaterials } = ring();
    const selections = {
      band: {
        options: {
          noVariant: [{ type: 'material', part: 'Band', use: 'Platinum' }],
          noPart: [{ type: 'material', part: 'Shank', use: 'RoseGold' }],
        },
      },
    } satisfies Record<string, ModelViewerSelectionGroup>;
    const baseline = createBaseline(root, fileMaterials, selections);

    const warnings = applyState(baseline, selections, { band: ['noVariant', 'noPart'] });

    expect(warnings).toEqual([
      'material "Platinum" is not in the model',
      'part "Shank" is not in the model',
    ]);
    expect(bandMesh.material).toBe(band);
  });

  it('ignores codes that have no configured mutations', () => {
    const { root, band, fileMaterials } = ring();
    const selections = { band: bandGroup, other: {} };
    const baseline = createBaseline(root, fileMaterials, selections);

    const warnings = applyState(baseline, selections, { band: ['unknown'], other: ['x'] });

    expect(warnings).toEqual([]);
    expect(hex(band)).toBe('ffcc00');
  });
});

describe('applyState visibility', () => {
  function stones() {
    const stone = new MeshStandardMaterial({ name: 'Stone' });
    const small = part('Stone_Small', stone);
    const medium = part('Stone_Medium', stone);
    const large = part('Stone_Large', stone);
    const band = part('Band', new MeshStandardMaterial({ name: 'Band' }));
    const root = new Group().add(band, small, medium, large);
    return { root, band, small, medium, large, fileMaterials: [stone] };
  }

  const caratGroup: ModelViewerSelectionGroup = {
    options: {
      small: [{ type: 'visible', parts: ['Stone_Small'] }],
      medium: [{ type: 'visible', parts: ['Stone_Medium'] }],
      large: [{ type: 'visible', parts: ['Stone_Large'] }],
    },
  };

  it('shows the selected part and hides the other parts the group manages', () => {
    const { root, small, medium, large, fileMaterials } = stones();
    const selections = { carat: caratGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    expect(applyState(baseline, selections, { carat: ['medium'] })).toEqual([]);

    expect([small.visible, medium.visible, large.visible]).toEqual([false, true, false]);
  });

  it('leaves unmanaged parts alone', () => {
    const { root, band, fileMaterials } = stones();
    const selections = { carat: caratGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { carat: ['small'] });

    expect(band.visible).toBe(true);
  });

  it("shows every selected option's parts in a multiple group", () => {
    const { root, small, medium, large, fileMaterials } = stones();
    const selections = { carat: caratGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { carat: ['small', 'large'] });

    expect([small.visible, medium.visible, large.visible]).toEqual([true, false, true]);
  });

  it('restores baseline visibility when the group is cleared', () => {
    const { root, small, medium, large, fileMaterials } = stones();
    large.visible = false;
    const selections = { carat: caratGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { carat: ['large'] });
    applyState(baseline, selections, { carat: [] });

    expect([small.visible, medium.visible, large.visible]).toEqual([true, true, false]);
  });

  it('hides every node that shares a part name', () => {
    const { root, small, fileMaterials } = stones();
    const twin = part('Stone_Small', new MeshStandardMaterial());
    root.add(twin);
    const selections = { carat: caratGroup };
    const baseline = createBaseline(root, fileMaterials, selections);

    applyState(baseline, selections, { carat: ['large'] });

    expect([small.visible, twin.visible]).toEqual([false, false]);
  });

  it('warns for a missing visible part and still applies the others', () => {
    const { root, small, medium, fileMaterials } = stones();
    const selections = {
      carat: {
        options: { huge: [{ type: 'visible', parts: ['Stone_Huge', 'Stone_Small'] }] },
      },
      other: caratGroup,
    } satisfies Record<string, ModelViewerSelectionGroup>;
    const baseline = createBaseline(root, fileMaterials, selections);

    const warnings = applyState(baseline, selections, { carat: ['huge'] });

    expect(warnings).toEqual(['part "Stone_Huge" is not in the model']);
    expect([small.visible, medium.visible]).toEqual([true, true]);
  });
});

describe('effectiveSrc', () => {
  const selections = {
    style: {
      options: {
        classic: [{ type: 'model', src: '/ring.glb' }],
        bold: [{ type: 'model', src: '/ring-alt.glb' }],
      },
    },
    band: bandGroup,
    engraving: { options: { deluxe: [{ type: 'model', src: '/ring-deluxe.glb' }] } },
  } satisfies Record<string, ModelViewerSelectionGroup>;

  it('falls back to src when no model option is selected', () => {
    expect(effectiveSrc('/default.glb', selections, { band: ['white'], style: [] })).toBe(
      '/default.glb'
    );
  });

  it('uses the last selected model mutation across groups', () => {
    expect(effectiveSrc('/default.glb', selections, { style: ['bold'] })).toBe('/ring-alt.glb');
    expect(
      effectiveSrc('/default.glb', selections, { engraving: ['deluxe'], style: ['bold'] })
    ).toBe('/ring-deluxe.glb');
  });

  it('ignores model mutations when applying state', () => {
    const { root, fileMaterials } = ring();
    const baseline = createBaseline(root, fileMaterials, selections);

    expect(applyState(baseline, selections, { style: ['bold'] })).toEqual([]);
  });
});
