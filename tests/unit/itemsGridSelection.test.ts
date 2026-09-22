import { describe, expect, it } from 'vitest';
import type { ItemsGridItem, ItemsGridSelection } from '~/types/itemsgrid.types';
import { validateItemsGridSelection } from '~/utils/itemsGridSelection';

type SelectableSelection = Exclude<ItemsGridSelection, { mode: 'none' }>;

const item = (code?: string, extra: Partial<ItemsGridItem> = {}): ItemsGridItem => ({
  code,
  title: code,
  ...extra,
});

const single: SelectableSelection = { mode: 'single', group: 'g', label: 'Group' };
const multiple: SelectableSelection = { mode: 'multiple', group: 'g', label: 'Group' };

describe('validateItemsGridSelection', () => {
  const throwCases: Array<{
    name: string;
    selection: SelectableSelection;
    items: ItemsGridItem[];
    expected: RegExp;
  }> = [
    {
      name: 'single without group',
      selection: { ...single, group: '' },
      items: [item('a')],
      expected: /requires a group/,
    },
    {
      name: 'multiple without group',
      selection: { ...multiple, group: '' },
      items: [item('a')],
      expected: /requires a group/,
    },
    {
      name: 'no label and no labelledBy',
      selection: { mode: 'single', group: 'g' },
      items: [item('a')],
      expected: /needs a label or labelledBy/,
    },
    {
      name: 'item without code',
      selection: single,
      items: [item('a'), item()],
      expected: /item 1 .* has no code/,
    },
    {
      name: 'duplicate code',
      selection: single,
      items: [item('a'), item('a')],
      expected: /code "a" is used twice/,
    },
    {
      name: 'item with actions',
      selection: single,
      items: [item('a', { actions: [{ label: 'x' }] })],
      expected: /has actions/,
    },
    {
      name: 'single with two selected',
      selection: single,
      items: [item('a', { selected: true }), item('b', { selected: true })],
      expected: /2 items selected in single group/,
    },
    {
      name: 'multiple with negative min',
      selection: { ...multiple, min: -1 },
      items: [item('a')],
      expected: /min is negative/,
    },
    {
      name: 'multiple with negative max',
      selection: { ...multiple, max: -1 },
      items: [item('a')],
      expected: /max is negative/,
    },
    {
      name: 'multiple with min greater than max',
      selection: { ...multiple, min: 3, max: 2 },
      items: [item('a')],
      expected: /min \(3\) is greater than max \(2\)/,
    },
    {
      name: 'multiple with more selected than max',
      selection: { ...multiple, max: 1 },
      items: [item('a', { selected: true }), item('b', { selected: true })],
      expected: /2 items selected .* with max 1/,
    },
    {
      name: 'message prefix',
      selection: { ...single, group: '' },
      items: [item('a')],
      expected: /^itemsGrid: /,
    },
  ];

  it.each(throwCases)('throws: $name', ({ selection, items, expected }) => {
    expect(() => validateItemsGridSelection(selection, items)).toThrow(expected);
  });

  const validCases: Array<{
    name: string;
    selection: SelectableSelection;
    items: ItemsGridItem[];
  }> = [
    { name: 'single with no selected item', selection: single, items: [item('a'), item('b')] },
    {
      name: 'multiple below min initially',
      selection: { ...multiple, min: 2 },
      items: [item('a'), item('b')],
    },
    {
      name: 'label and labelledBy both given',
      selection: { ...single, labelledBy: 'heading' },
      items: [item('a')],
    },
    {
      name: 'empty actions array',
      selection: single,
      items: [item('a', { actions: [] })],
    },
  ];

  it.each(validCases)('accepts: $name', ({ selection, items }) => {
    expect(() => validateItemsGridSelection(selection, items)).not.toThrow();
  });
});
