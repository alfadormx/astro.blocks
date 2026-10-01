import { describe, expect, it } from 'vitest';
import { gridColumnsClass, lastItemAlone, type GridColumns } from '~/utils/itemsGrid';

describe('gridColumnsClass', () => {
  const cases: Array<{
    name: string;
    columns: GridColumns;
    responsive: boolean;
    expected: string;
  }> = [
    {
      name: 'steps down when responsive',
      columns: 3,
      responsive: true,
      expected: 'grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3',
    },
    {
      name: 'keeps a fixed column count when not responsive',
      columns: 3,
      responsive: false,
      expected: 'grid-cols-3',
    },
  ];
  it.each(cases)('$name', ({ columns, responsive, expected }) => {
    expect(gridColumnsClass(columns, responsive)).toBe(expected);
  });
});

describe('lastItemAlone', () => {
  const cases: Array<{ count: number; columns: number; expected: boolean }> = [
    { count: 5, columns: 2, expected: true },
    { count: 4, columns: 2, expected: false },
    { count: 4, columns: 3, expected: true },
    { count: 3, columns: 3, expected: false },
    { count: 3, columns: 1, expected: false },
    { count: 0, columns: 2, expected: false },
  ];
  it.each(cases)('$count items in $columns columns: $expected', ({ count, columns, expected }) => {
    expect(lastItemAlone(count, columns)).toBe(expected);
  });
});
