import { describe, expect, it } from 'vitest';
import type { ModelViewerCameraPreset, ModelViewerMutation } from '~/types/modelviewer.types';
import { validateModelViewer } from '~/utils/modelViewer';

type ValidatedProps = Parameters<typeof validateModelViewer>[0];

const props: ValidatedProps = { src: '/models/avocado.glb', label: 'Avocado' };

function withMutation(mutation: ModelViewerMutation): ValidatedProps {
  return { ...props, selections: { finish: { options: { gold: [mutation] } } } };
}

describe('validateModelViewer', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    { name: 'empty src', input: { ...props, src: '' }, expected: /src is required/ },
    { name: 'blank src', input: { ...props, src: '  ' }, expected: /src is required/ },
    { name: 'message prefix', input: { ...props, src: '' }, expected: /^modelViewer: / },
    { name: 'empty label', input: { ...props, label: '' }, expected: /needs a label/ },
    {
      name: 'unsupported extension',
      input: { ...props, src: '/models/chair.obj' },
      expected: /must point to a \.glb or \.gltf file/,
    },
    {
      name: 'no extension',
      input: { ...props, src: '/models/chair' },
      expected: /must point to a \.glb or \.gltf file/,
    },
    {
      name: 'extension only in the query string',
      input: { ...props, src: '/model?file=chair.glb' },
      expected: /must point to a \.glb or \.gltf file/,
    },
    { name: 'zero fov', input: { ...props, fov: 0 }, expected: /between 0 and 180/ },
    { name: '180 fov', input: { ...props, fov: 180 }, expected: /between 0 and 180/ },
    { name: 'NaN fov', input: { ...props, fov: NaN }, expected: /between 0 and 180/ },
    {
      name: 'short cameraPosition',
      input: { ...props, cameraPosition: [1, 2] as unknown as [number, number, number] },
      expected: /cameraPosition must be three finite numbers/,
    },
    {
      name: 'non-finite cameraTarget',
      input: { ...props, cameraTarget: [0, Infinity, 0] },
      expected: /cameraTarget must be three finite numbers/,
    },
    { name: 'negative exposure', input: { ...props, exposure: -0.5 }, expected: /exposure -0.5/ },
    {
      name: 'non-hex color',
      input: withMutation({ type: 'material', material: 'Band', color: 'red' }),
      expected: /selections\.finish\.options\.gold\[0\] has color "red"; expected #rgb or #rrggbb/,
    },
    {
      name: 'metalness above 1',
      input: withMutation({ type: 'material', material: 'Band', metalness: 1.5 }),
      expected: /metalness 1.5; expected a value between 0 and 1/,
    },
    {
      name: 'negative roughness',
      input: withMutation({ type: 'material', material: 'Band', roughness: -0.1 }),
      expected: /roughness -0.1/,
    },
    {
      name: 'empty material',
      input: withMutation({ type: 'material', material: '' }),
      expected: /needs a non-empty material/,
    },
    {
      name: 'empty use',
      input: withMutation({ type: 'material', part: 'Band', use: '' }),
      expected: /needs a non-empty use/,
    },
    {
      name: 'empty part',
      input: withMutation({ type: 'material', part: ' ', use: 'RoseGold' }),
      expected: /needs a non-empty part/,
    },
    {
      name: 'visible without parts',
      input: withMutation({ type: 'visible', parts: [] }),
      expected: /needs at least one part/,
    },
    {
      name: 'visible with an empty part name',
      input: withMutation({ type: 'visible', parts: [''] }),
      expected: /non-empty parts entry/,
    },
    {
      name: 'camera naming an unknown preset',
      input: { ...props, selections: { engraving: { camera: 'inside' } } },
      expected: /selections\.engraving\.camera "inside" is not a key of cameraPresets/,
    },
    {
      name: 'short preset position',
      input: {
        ...props,
        cameraPresets: {
          band: { position: [0, 1] as unknown as [number, number, number], target: [0, 0, 0] },
        },
      },
      expected: /cameraPresets\.band\.position must be three finite numbers/,
    },
    {
      name: 'preset fov of 200',
      input: {
        ...props,
        cameraPresets: { band: { position: [0, 0, 2], target: [0, 0, 0], fov: 200 } },
      },
      expected: /cameraPresets\.band has fov 200; expected a value between 0 and 180/,
    },
    {
      name: 'preset without a target',
      input: {
        ...props,
        cameraPresets: {
          band: { position: [0, 0, 2] } as unknown as ModelViewerCameraPreset,
        },
      },
      expected: /cameraPresets\.band\.target must be three finite numbers; got undefined/,
    },
    {
      name: 'model swap to an .obj',
      input: withMutation({ type: 'model', src: '/models/ring.obj' }),
      expected:
        /selections\.finish\.options\.gold\[0\] "\/models\/ring\.obj" must point to a \.glb or \.gltf file/,
    },
    {
      name: 'model swap without src',
      input: withMutation({ type: 'model', src: '' }),
      expected: /needs a non-empty src/,
    },
    {
      name: 'integer-like group key',
      input: { ...props, selections: { '2': {} } },
      expected: /selections group "2" must not be an integer-like key/,
    },
    {
      name: 'unknown mutation type',
      input: withMutation({ type: 'texture' } as unknown as ModelViewerMutation),
      expected: /has unknown type "texture"/,
    },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateModelViewer(input)).toThrow(expected);
  });

  it.each([
    '/models/chair.glb',
    '/models/chair.gltf',
    '/models/CHAIR.GLB',
    '/models/chair.glb?v=2',
    '/models/chair.gltf#scene',
    'https://cdn.example.com/models/chair.glb?token=abc',
  ])('accepts %s', (src) => {
    expect(() => validateModelViewer({ ...props, src })).not.toThrow();
  });

  it('accepts explicit camera and exposure settings', () => {
    expect(() =>
      validateModelViewer({
        ...props,
        fov: 30,
        cameraPosition: [0, 1, 2],
        cameraTarget: [0, 0, 0],
        exposure: 0,
      })
    ).not.toThrow();
  });

  it('accepts valid selections', () => {
    expect(() =>
      validateModelViewer({
        ...props,
        selections: {
          finish: {
            options: {
              white: [
                { type: 'material', material: 'Band', color: '#FFF', metalness: 0, roughness: 1 },
              ],
              rose: [{ type: 'material', part: 'Band', use: 'RoseGold' }],
              bold: [{ type: 'model', src: '/models/ring-alt.glb' }],
              '1': [{ type: 'visible', parts: ['Stone_Small'] }],
            },
          },
          empty: {},
          '02': {},
          engraving: { camera: 'band' },
        },
        cameraPresets: { band: { position: [0, -1, 2], target: [0, -0.5, 0], fov: 35 } },
      })
    ).not.toThrow();
  });
});
