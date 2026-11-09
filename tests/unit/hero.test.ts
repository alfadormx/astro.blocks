import { describe, expect, it } from 'vitest';
import { validateHero } from '~/utils/hero';

type ValidatedProps = Parameters<typeof validateHero>[0];

const image = { src: '/hero.jpg', alt: '' };
const video = { source: { provider: 'youtube', id: 'bTqVqk7FSmY' } } as const;

describe('validateHero', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    {
      name: 'centered with image',
      input: { layout: 'centered', image },
      expected: /need layout 'split'/,
    },
    {
      name: 'centered with video',
      input: { layout: 'centered', video },
      expected: /need layout 'split'/,
    },
    { name: 'default layout with image', input: { image }, expected: /need layout 'split'/ },
    { name: 'message prefix', input: { image }, expected: /^Hero: / },
    {
      name: 'image and video in split',
      input: { layout: 'split', image, video },
      expected: /set image or video, not both/,
    },
    { name: 'both set wins over centered rule', input: { image, video }, expected: /not both/ },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateHero(input)).toThrow(expected);
  });

  it('accepts centered without media', () => {
    expect(() => validateHero({ layout: 'centered' })).not.toThrow();
  });

  it('accepts split with image', () => {
    expect(() => validateHero({ layout: 'split', image })).not.toThrow();
  });

  it('accepts split with video', () => {
    expect(() => validateHero({ layout: 'split', video })).not.toThrow();
  });

  it('accepts split without media', () => {
    expect(() => validateHero({ layout: 'split' })).not.toThrow();
  });
});
