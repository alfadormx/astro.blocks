// Literal class strings only: Tailwind scans source text.
const RESPONSIVE_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 @lg:grid-cols-2',
  3: 'grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3',
  4: 'grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4',
} as const;

const FIXED_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const;

export type GridColumns = keyof typeof FIXED_COLUMNS;

export function gridColumnsClass(columns: GridColumns, responsive: boolean): string {
  return (responsive ? RESPONSIVE_COLUMNS : FIXED_COLUMNS)[columns];
}

/** Whether the last item sits alone in its row at `columns` columns. */
export function lastItemAlone(count: number, columns: number): boolean {
  return columns > 1 && count % columns === 1;
}
