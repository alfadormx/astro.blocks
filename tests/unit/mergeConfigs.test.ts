import { describe, expect, it } from 'vitest';
import { mergeConfigs } from '~/utils/mergeConfigs';

describe('mergeConfigs', () => {
  const cases: Array<{
    name: string;
    inputs: Array<Record<string, unknown> | null | undefined>;
    expected: Record<string, unknown>;
  }> = [
    { name: 'no arguments', inputs: [], expected: {} },
    { name: 'empty configs', inputs: [{}, {}], expected: {} },
    {
      name: 'skips null and undefined',
      inputs: [null, undefined, { class: 'p-2' }],
      expected: { class: 'p-2' },
    },
    {
      name: 'tailwind conflict is last-wins',
      inputs: [{ class: 'p-2 text-red-500' }, { class: 'p-4' }],
      expected: { class: 'text-red-500 p-4' },
    },
    {
      name: 'three configs collapse to last',
      inputs: [{ class: 'p-1' }, { class: 'p-2' }, { class: 'p-3' }],
      expected: { class: 'p-3' },
    },
    {
      name: 'non-conflicting tokens concatenate, repeat dropped',
      inputs: [{ class: 'flex' }, { class: 'gap-2' }, { class: 'flex' }],
      expected: { class: 'flex gap-2' },
    },
    {
      name: 'array class values are stringified',
      inputs: [{ class: ['flex', 'gap-2', 3, true, null, undefined, { a: 1 }] }, { class: 'p-1' }],
      expected: { class: 'flex gap-2 3 true p-1' },
    },
    {
      name: 'string then array',
      inputs: [{ class: 'flex' }, { class: ['gap-2', 'p-1'] }],
      expected: { class: 'flex gap-2 p-1' },
    },
    { name: 'numeric class value', inputs: [{ class: 5 }], expected: { class: '5' } },
    { name: 'boolean class value', inputs: [{ class: true }], expected: { class: 'true' } },
    {
      name: 'camelCase class key',
      inputs: [{ titleClass: 'a' }, { titleClass: 'b' }],
      expected: { titleClass: 'a b' },
    },
    {
      name: 'lowercase suffix class key',
      inputs: [{ titleclass: 'x' }, { titleclass: 'y' }],
      expected: { titleclass: 'x y' },
    },
    {
      name: 'className key',
      inputs: [{ className: 'a' }, { className: 'p-2 p-3' }],
      expected: { className: 'a p-3' },
    },
    {
      name: 'non-class keys use plain merge',
      inputs: [{ id: 'a' }, { id: 'b' }],
      expected: { id: 'b' },
    },
    {
      name: 'nested class keys merge at their path',
      inputs: [{ a: { b: { class: 'p-1' } } }, { a: { b: { class: 'p-2', other: 1 } } }],
      expected: { a: { b: { class: 'p-2', other: 1 } } },
    },
    {
      name: 'deeply nested class keys',
      inputs: [
        { a: { b: { c: { d: { class: 'p-1' } } } } },
        { a: { b: { c: { d: { class: 'p-2 flex' } } } } },
      ],
      expected: { a: { b: { c: { d: { class: 'p-2 flex' } } } } },
    },
    {
      name: 'disjoint keys are both kept',
      inputs: [{ class: 'p-1' }, { id: 'x' }],
      expected: { class: 'p-1', id: 'x' },
    },
    {
      name: 'whitespace runs collapse and dedupe',
      inputs: [{ class: '  p-1\n\t p-1   flex  ' }],
      expected: { class: 'p-1 flex' },
    },
    {
      name: 'sibling and nested class keys merge independently',
      inputs: [
        { class: 'p-1', a: { class: 'm-1' } },
        { class: 'p-2', a: { class: 'm-2' } },
      ],
      expected: { class: 'p-2', a: { class: 'm-2' } },
    },
    {
      name: 'arrays merge index-wise',
      inputs: [{ items: [1, 2, 3] }, { items: [9] }],
      expected: { items: [9, 2, 3] },
    },
  ];

  it.each(cases)('$name', ({ inputs, expected }) => {
    expect(mergeConfigs(...inputs)).toEqual(expected);
  });
});

describe('mergeConfigs edge cases', () => {
  it('keeps a null class value as null', () => {
    expect(mergeConfigs({ class: null })).toEqual({ class: null });
  });

  // lodash.merge copies the key across even when its value is undefined, and the
  // class pass skips it (no tokens), so the key survives holding undefined rather
  // than being dropped.
  it('keeps an undefined class key with an undefined value', () => {
    expect(mergeConfigs({ class: undefined })).toEqual({});
    expect(Object.keys(mergeConfigs({ class: undefined }))).toEqual(['class']);
    expect(mergeConfigs({ class: undefined }).class).toBeUndefined();
  });

  it('lets a later config fill in an undefined class', () => {
    expect(mergeConfigs<{ class?: string }>({ class: undefined }, { class: 'p-2' })).toEqual({
      class: 'p-2',
    });
  });

  it('yields an empty string, not a removal, for empty-string-only class values', () => {
    expect(mergeConfigs({ class: '' }, { class: '' })).toEqual({ class: '' });
  });

  it('ignores an empty-string class alongside a real one', () => {
    expect(mergeConfigs({ class: '' }, { class: 'p-1' })).toEqual({ class: 'p-1' });
  });

  it("matches 'superclass' via the endsWith('class') rule", () => {
    expect(mergeConfigs({ superclass: 'p-1' }, { superclass: 'p-2' })).toEqual({
      superclass: 'p-2',
    });
  });

  it('does not merge class keys inside arrays', () => {
    expect(mergeConfigs({ items: [{ class: 'p-1' }] }, { items: [{ class: 'p-2' }] })).toEqual({
      items: [{ class: 'p-2' }],
    });
  });

  it("does not recurse into a class key's own object value", () => {
    expect(mergeConfigs({ class: { inner: { class: 'p-1' } } })).toEqual({
      class: { inner: { class: 'p-1' } },
    });
    expect(mergeConfigs({ class: { a: 1 } })).toEqual({ class: { a: 1 } });
  });

  it('silently replaces a scalar sitting on a class path', () => {
    expect(mergeConfigs<{ a: unknown }>({ a: { class: 'p-1' } }, { a: 'str' })).toEqual({
      a: { class: 'p-1' },
    });
    expect(mergeConfigs<{ a: unknown }>({ a: 'str' }, { a: { class: 'p-1' } })).toEqual({
      a: { class: 'p-1' },
    });
  });

  it('dedupes tokens first-wins before twMerge resolves conflicts last-wins', () => {
    expect(mergeConfigs({ class: 'flex flex' }, { class: 'flex gap-2' })).toEqual({
      class: 'flex gap-2',
    });
    expect(mergeConfigs({ class: 'p-2' }, { class: 'p-4' })).toEqual({ class: 'p-4' });
  });

  it('does not mutate its inputs and clones nested objects', () => {
    type Nested = { a: { deep: { class: string } } };
    const src: Nested = { a: { deep: { class: 'p-1' } } };
    const out = mergeConfigs<Nested>(src, { a: { deep: { class: 'p-2' } } });
    expect(src).toEqual({ a: { deep: { class: 'p-1' } } });
    expect(out.a.deep).not.toBe(src.a.deep);
  });
});
