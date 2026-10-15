import { describe, expect, it } from 'vitest';
import { stripLogoInstanceFields } from '~/utils/logo';

describe('stripLogoInstanceFields', () => {
  const cases = [
    { name: 'top-level id', input: { id: 'a' }, path: ['id'] },
    { name: 'top-level name', input: { name: 'a' }, path: ['name'] },
    { name: 'top-level anchorId', input: { anchorId: 'a' }, path: ['anchorId'] },
    { name: 'vector id', input: { vector: { src: '/v.svg', id: 'a' } }, path: ['vector', 'id'] },
    {
      name: 'image id',
      input: { image: { src: '/i.png', alt: '', id: 'a' } },
      path: ['image', 'id'],
    },
  ];

  it.each(cases)('drops $name', ({ input, path }) => {
    expect(stripLogoInstanceFields(input)).not.toHaveProperty(path);
  });

  it('keeps fields that are not per-instance', () => {
    expect(
      stripLogoInstanceFields({
        id: 'a',
        label: 'Brand',
        href: '/home',
        class: 'p-2',
        'aria-label': 'Home',
        vector: { src: '/v.svg', id: 'v', ariaLabel: 'Brand' },
        image: { src: '/i.png', alt: 'Brand', width: 32, id: 'i' },
      })
    ).toEqual({
      label: 'Brand',
      href: '/home',
      class: 'p-2',
      'aria-label': 'Home',
      vector: { src: '/v.svg', ariaLabel: 'Brand' },
      image: { src: '/i.png', alt: 'Brand', width: 32 },
    });
  });

  it('adds no media keys when the logo has none', () => {
    expect(stripLogoInstanceFields({ label: 'Brand' })).toEqual({ label: 'Brand' });
  });

  it('returns an empty config for an undefined logo', () => {
    expect(stripLogoInstanceFields(undefined)).toEqual({});
  });
});
