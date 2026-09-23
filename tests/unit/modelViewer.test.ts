import { describe, expect, it } from 'vitest';
import { validateModelViewer } from '~/utils/modelViewer';

type ValidatedProps = Parameters<typeof validateModelViewer>[0];

const props: ValidatedProps = { src: '/models/avocado.glb', label: 'Avocado' };

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
});
