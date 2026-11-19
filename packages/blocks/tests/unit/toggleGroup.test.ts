import { describe, expect, it } from 'vitest';
import type { ToggleGroupOption, ToggleGroupProps } from '~/types/togglegroup.types';
import { toggleGroupName, validateToggleGroup } from '~/utils/toggleGroup';

type ValidatedProps = Parameters<typeof validateToggleGroup>[0];

const option = (code: string, extra: Partial<ToggleGroupOption> = {}): ToggleGroupOption => ({
  code,
  label: code,
  ...extra,
});

const props: Pick<ToggleGroupProps, 'group' | 'label' | 'options'> = {
  group: 'g',
  label: 'Group',
  options: [option('a'), option('b')],
};

describe('validateToggleGroup', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    { name: 'missing group', input: { ...props, group: '' }, expected: /a group is required/ },
    {
      name: 'no label and no labelledBy',
      input: { ...props, label: undefined },
      expected: /needs a label or labelledBy/,
    },
    { name: 'empty options', input: { ...props, options: [] }, expected: /has no options/ },
    {
      name: 'option without code',
      input: { ...props, options: [option('a'), option('')] },
      expected: /option 1 .* has no code/,
    },
    {
      name: 'duplicate code',
      input: { ...props, options: [option('a'), option('a')] },
      expected: /code "a" is used twice/,
    },
    {
      name: 'two selected',
      input: {
        ...props,
        options: [option('a', { selected: true }), option('b', { selected: true })],
      },
      expected: /2 options selected/,
    },
    {
      name: 'selected and disabled option',
      input: { ...props, options: [option('a', { selected: true, disabled: true })] },
      expected: /both selected and disabled/,
    },
    {
      name: 'selected option in disabled group',
      input: { ...props, disabled: true, options: [option('a', { selected: true }), option('b')] },
      expected: /both selected and disabled/,
    },
    { name: 'message prefix', input: { ...props, group: '' }, expected: /^toggleGroup: / },
  ];

  it.each(throwCases)('throws: $name', ({ input, expected }) => {
    expect(() => validateToggleGroup(input)).toThrow(expected);
  });

  it('accepts a valid group with nothing selected', () => {
    expect(() => validateToggleGroup(props)).not.toThrow();
  });

  it('accepts labelledBy without label', () => {
    expect(() =>
      validateToggleGroup({ ...props, label: undefined, labelledBy: 'heading' })
    ).not.toThrow();
  });
});

describe('toggleGroupName', () => {
  it('returns distinct names for the same group', () => {
    expect(toggleGroupName('g')).not.toBe(toggleGroupName('g'));
  });
});
