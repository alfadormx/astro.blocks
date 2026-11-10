import { describe, expect, it } from 'vitest';
import { selectId, validateSelect } from '~/utils/select';

type ValidatedProps = Parameters<typeof validateSelect>[0];

const props: ValidatedProps = {
  label: 'Country',
  options: [
    { value: 'nl', label: 'Netherlands' },
    { value: 'be', label: 'Belgium' },
  ],
};

describe('validateSelect', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    {
      name: 'empty label',
      input: { ...props, label: '' },
      expected: /^select: a label is required/,
    },
    { name: 'no options', input: { ...props, options: [] }, expected: /has no options/ },
    {
      name: 'option without label',
      input: { ...props, options: [{ value: 'nl', label: ' ' }] },
      expected: /an option without a label/,
    },
    {
      name: 'duplicate value',
      input: {
        ...props,
        options: [
          { value: 'nl', label: 'Netherlands' },
          { value: 'nl', label: 'Holland' },
        ],
      },
      expected: /repeats option value "nl"/,
    },
    {
      name: 'selected and disabled',
      input: { ...props, options: [{ value: 'nl', label: 'NL', selected: true, disabled: true }] },
      expected: /both selected and disabled/,
    },
    {
      name: 'two selected',
      input: {
        ...props,
        options: [
          { value: 'nl', label: 'NL', selected: true },
          { value: 'be', label: 'BE', selected: true },
        ],
      },
      expected: /selects more than one option/,
    },
    {
      name: 'empty value with a placeholder',
      input: { ...props, placeholder: 'Choose', options: [{ value: '', label: 'None' }] },
      expected: /reserved for the placeholder/,
    },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateSelect(input)).toThrow(expected);
  });

  it('accepts a placeholder with nothing selected', () => {
    expect(() => validateSelect({ ...props, placeholder: 'Choose a country' })).not.toThrow();
  });
});

describe('selectId', () => {
  it('returns a distinct select-N id per call', () => {
    const a = selectId();
    expect(a).toMatch(/^select-\d+$/);
    expect(selectId()).not.toBe(a);
  });
});
