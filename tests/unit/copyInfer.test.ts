import { describe, expect, it } from 'vitest';
import { copyRegistryDts, toTypeLiteral } from '../../vendor/integration/copy/infer';

const compact = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('toTypeLiteral', () => {
  it('types scalars', () => {
    expect(['a', 1, true, null].map((v) => toTypeLiteral(v))).toEqual([
      'string',
      'number',
      'boolean',
      'null',
    ]);
  });

  it('types a nested object with quoted keys', () => {
    expect(compact(toTypeLiteral({ hero: { 'my-title': 'x' } }))).toBe(
      '{ "hero": { "my-title": string; }; }'
    );
  });

  it('types a uniform array', () => {
    expect(toTypeLiteral(['a', 'b'])).toBe('string[]');
  });

  it('types a mixed array as a union', () => {
    expect(compact(toTypeLiteral(['a', { b: 1 }]))).toBe('(string | { "b": number; })[]');
  });

  it('types an empty array as unknown[]', () => {
    expect(toTypeLiteral([])).toBe('unknown[]');
  });
});

describe('copyRegistryDts', () => {
  it('types each page from its default-language copy', () => {
    const dts = copyRegistryDts(
      { home: { en: { title: 'Hi' }, es: { title: 'Hola', x: 1 } } },
      'en'
    );
    expect(compact(dts)).toContain('interface CopyRegistry { "home": { "title": string; }; }');
    expect(dts).toContain('export {};');
  });
});
