import { describe, expect, it } from 'vitest';
import {
  assertEntry,
  currentSection,
  fullTree,
  neighbours,
  orderLinks,
  type DocLink,
} from '../../src/pages/documentation/_nav';
import { sections, type SectionKey } from '../../src/pages/documentation/_sections';

const link = (section: SectionKey, key: string, order: number): DocLink => ({
  key: `${section}/${key}`,
  href: `/documentation/${section}/${key}`,
  title: key,
  section,
  order,
});

const colors = link('base', 'Colors', 1);
const typography = link('base', 'Typography', 2);
const button = link('primitives', 'Button', 1);
const video = link('primitives', 'Video', 2);
const container = link('layout', 'Container', 1);
const ordered = [colors, typography, button, video, container];

describe('orderLinks', () => {
  it('sorts by section order, then order, then title', () => {
    const alpha = link('base', 'Alpha', 2);
    expect(orderLinks([container, typography, video, colors, button, alpha], sections)).toEqual([
      colors,
      alpha,
      typography,
      button,
      video,
      container,
    ]);
  });

  it('drops links in an unknown section', () => {
    const stray = { ...colors, section: 'blog' as SectionKey };
    expect(orderLinks([stray, button], sections)).toEqual([button]);
  });
});

describe('assertEntry', () => {
  it('returns the section of a valid entry', () => {
    expect(assertEntry('primitives/Button', { section: 'primitives' }, sections)).toBe(
      'primitives'
    );
  });

  it('throws, naming the entry, on an unknown section', () => {
    expect(() => assertEntry('blog/Hello', { section: 'blog' }, sections)).toThrow(
      'Docs entry "blog/Hello" has unknown section "blog"'
    );
  });

  it('throws when the section differs from the folder', () => {
    expect(() => assertEntry('layout/Button', { section: 'primitives' }, sections)).toThrow(
      'Docs entry "layout/Button" sets section "primitives" but lives in "layout/"'
    );
  });

  it('throws when the entry sets a slug', () => {
    expect(() =>
      assertEntry('primitives/Button', { section: 'primitives', slug: 'button' }, sections)
    ).toThrow('Docs entry "primitives/Button" sets slug');
  });
});

describe('currentSection', () => {
  it('ignores a trailing slash', () => {
    expect(currentSection(ordered, '/documentation/primitives/Video/')).toBe('primitives');
  });

  it('is undefined on Overview', () => {
    expect(currentSection(ordered, '/documentation')).toBeUndefined();
  });
});

describe('fullTree', () => {
  it('groups links under section labels and omits empty sections', () => {
    expect(fullTree([colors, button, video], sections)).toEqual([
      { label: 'Base', children: [{ label: 'Colors', href: colors.href }] },
      {
        label: 'Primitives',
        children: [
          { label: 'Button', href: button.href },
          { label: 'Video', href: video.href },
        ],
      },
    ]);
  });
});

describe('neighbours', () => {
  it('gives the first link only a next', () => {
    expect(neighbours(ordered, colors.href)).toEqual({ previous: undefined, next: typography });
  });

  it('gives a middle link both', () => {
    expect(neighbours(ordered, button.href)).toEqual({ previous: typography, next: video });
  });

  it('gives the last link only a previous', () => {
    expect(neighbours(ordered, container.href)).toEqual({ previous: video, next: undefined });
  });

  it('crosses a section boundary', () => {
    expect(neighbours(ordered, video.href).next).toBe(container);
    expect(neighbours(ordered, container.href).previous).toBe(video);
  });

  it('matches a current path with a trailing slash', () => {
    expect(neighbours(ordered, `${button.href}/`).previous).toBe(typography);
  });

  it('returns nothing for an unknown path', () => {
    expect(neighbours(ordered, '/documentation')).toEqual({});
  });
});
