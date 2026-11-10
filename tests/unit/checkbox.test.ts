import { describe, expect, it } from 'vitest';
import {
  checkboxGroupId,
  checkboxId,
  validateCheckbox,
  validateCheckboxGroup,
} from '~/utils/checkbox';

type GroupProps = Parameters<typeof validateCheckboxGroup>[0];

const group: GroupProps = {
  label: 'Interests',
  name: 'interests',
  options: [
    { label: 'Laptops', value: 'laptops' },
    { label: 'Phones', value: 'phones' },
  ],
};

describe('validateCheckbox', () => {
  it.each(['', '   '])('throws for label %j', (label) => {
    expect(() => validateCheckbox({ label })).toThrow(/^checkbox: a label is required/);
  });

  it('accepts a labelled box', () => {
    expect(() => validateCheckbox({ label: 'Agree' })).not.toThrow();
  });
});

describe('validateCheckboxGroup', () => {
  const throwCases: Array<{ name: string; input: GroupProps; expected: RegExp }> = [
    {
      name: 'empty label',
      input: { ...group, label: '' },
      expected: /^checkboxGroup: a label is required/,
    },
    { name: 'empty name', input: { ...group, name: ' ' }, expected: /has no name/ },
    { name: 'no options', input: { ...group, options: [] }, expected: /has no options/ },
    {
      name: 'option without value',
      input: { ...group, options: [{ label: 'Laptops' }] },
      expected: /option 0 has no value/,
    },
    {
      name: 'duplicate value',
      input: {
        ...group,
        options: [
          { label: 'Laptops', value: 'x' },
          { label: 'Phones', value: 'x' },
        ],
      },
      expected: /repeats option value "x"/,
    },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateCheckboxGroup(input)).toThrow(expected);
  });

  it('accepts a named group with unique values', () => {
    expect(() => validateCheckboxGroup(group)).not.toThrow();
  });
});

describe('ids', () => {
  it('checkboxId returns a distinct checkbox-N id per call', () => {
    const a = checkboxId();
    expect(a).toMatch(/^checkbox-\d+$/);
    expect(checkboxId()).not.toBe(a);
  });

  it('checkboxGroupId returns a distinct checkbox-group-N id per call', () => {
    const a = checkboxGroupId();
    expect(a).toMatch(/^checkbox-group-\d+$/);
    expect(checkboxGroupId()).not.toBe(a);
  });
});
