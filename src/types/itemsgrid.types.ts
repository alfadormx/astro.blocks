import type { ItemProps } from './item.types';

export interface ItemsGridProps {
  /** The list of items to render in the grid, each rendered via the Item component. */
  items: ItemProps[];
  /** Maximum number of grid columns, reached when the grid's container is wide enough; the grid steps down to fewer columns in narrower containers (default: 3). */
  columns?: 1 | 2 | 3 | 4;
  /** Gap spacing between grid items (default: 'normal'). */
  air?: 'none' | 'tight' | 'normal' | 'loose';
  /** Additional CSS classes appended to the grid container (default: ''). */
  class?: string;
  /** Default values merged into every item's props before rendering, overridden by each item's own values. */
  defaultItemConfig?: Partial<ItemProps>;
}
