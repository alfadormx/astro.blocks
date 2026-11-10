import { describe, expect, it } from 'vitest';
import { inputId, validateInput } from '~/utils/input';

type ValidatedProps = Parameters<typeof validateInput>[0];

const props: ValidatedProps = { label: 'Full name' };

describe('validateInput', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    { name: 'empty label', input: { label: '' }, expected: /^input: a label is required/ },
    { name: 'blank label', input: { label: '   ' }, expected: /^input: a label is required/ },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateInput(input)).toThrow(expected);
  });

  it('accepts a labelled field', () => {
    expect(() => validateInput(props)).not.toThrow();
  });
});

describe('inputId', () => {
  it('returns a distinct input-N id per call', () => {
    const a = inputId();
    const b = inputId();
    expect(a).toMatch(/^input-\d+$/);
    expect(b).toMatch(/^input-\d+$/);
    expect(a).not.toBe(b);
  });
});
