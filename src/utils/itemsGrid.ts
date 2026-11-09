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

const GAP_CLASSES = {
  none: '',
  tight: 'gap-3 @3xl:gap-4 @5xl:gap-6',
  normal: 'gap-4 @3xl:gap-6 @5xl:gap-8',
  loose: 'gap-6 @3xl:gap-8 @5xl:gap-12',
} as const;

export type GridGapSize = keyof typeof GAP_CLASSES;

export function gridGapClass(gap: GridGapSize): string {
  return GAP_CLASSES[gap];
}

/** Whether the last item sits alone in its row at `columns` columns. */
export function lastItemAlone(count: number, columns: number): boolean {
  return columns > 1 && count % columns === 1;
}
