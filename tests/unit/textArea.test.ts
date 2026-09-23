import { describe, expect, it } from 'vitest';
import { textAreaId, validateTextArea } from '~/utils/textArea';

type ValidatedProps = Parameters<typeof validateTextArea>[0];

const props: ValidatedProps = { label: 'Message' };

describe('validateTextArea', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    { name: 'empty label', input: { ...props, label: '' }, expected: /a label is required/ },
    { name: 'blank label', input: { ...props, label: '   ' }, expected: /a label is required/ },
    { name: 'message prefix', input: { ...props, label: '' }, expected: /^textArea: / },
    {
      name: 'zero maxLength',
      input: { ...props, maxLength: 0 },
      expected: /expected a positive integer/,
    },
    {
      name: 'fractional maxLength',
      input: { ...props, maxLength: 2.5 },
      expected: /expected a positive integer/,
    },
    {
      name: 'counter without maxLength',
      input: { ...props, showCounter: true },
      expected: /counter without maxLength/,
    },
    {
      name: 'value over maxLength',
      input: { ...props, maxLength: 3, value: 'abcd' },
      expected: /over its maxLength 3/,
    },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateTextArea(input)).toThrow(expected);
  });

  it('accepts a labelled field', () => {
    expect(() => validateTextArea(props)).not.toThrow();
  });

  it('accepts a value at maxLength with a counter', () => {
    expect(() =>
      validateTextArea({ ...props, maxLength: 3, value: 'abc', showCounter: true })
    ).not.toThrow();
  });
});

describe('textAreaId', () => {
  it('returns distinct ids on each call', () => {
    expect(textAreaId()).not.toBe(textAreaId());
  });
});
