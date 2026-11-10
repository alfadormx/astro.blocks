import { describe, expect, it } from 'vitest';
import { validateLogoCloud } from '~/utils/logoCloud';

const vectorLogo = { name: 'Acme', vector: { src: '<svg viewBox="0 0 10 10"></svg>' } };
const imageLogo = {
  name: 'Globex',
  image: { src: '/favicon.svg', alt: '', width: 32, height: 32 },
};

describe('validateLogoCloud', () => {
  it('validateLogoCloud throws on an empty list', () => {
    expect(() => validateLogoCloud([], 'static')).toThrow(/^LogoCloud: expected at least one/);
  });

  const throwCases = [
    {
      name: 'a logo with neither image nor vector',
      input: [{ name: 'Acme' }],
      expected: /exactly one/,
    },
    {
      name: 'a logo with both image and vector',
      input: [{ ...vectorLogo, image: imageLogo.image }],
      expected: /exactly one/,
    },
    { name: 'a logo without a name', input: [{ ...vectorLogo, name: '' }], expected: /no name/ },
  ];
  for (const { name, input, expected } of throwCases) {
    it(`validateLogoCloud throws on ${name}`, () => {
      expect(() => validateLogoCloud(input as never, 'static')).toThrow(expected);
    });
  }

  it('validateLogoCloud accepts image and vector logos in a static strip', () => {
    expect(() => validateLogoCloud([vectorLogo, imageLogo], 'static')).not.toThrow();
  });

  it('validateLogoCloud throws on a marquee with fewer than 6 logos', () => {
    expect(() => validateLogoCloud(Array(5).fill(vectorLogo), 'marquee')).toThrow(/at least 6/);
  });

  it('validateLogoCloud accepts a marquee with 6 logos', () => {
    expect(() => validateLogoCloud(Array(6).fill(vectorLogo), 'marquee')).not.toThrow();
  });

  it('validateLogoCloud accepts a static strip with fewer than 6 logos', () => {
    expect(() => validateLogoCloud(Array(2).fill(vectorLogo), 'static')).not.toThrow();
  });
});
