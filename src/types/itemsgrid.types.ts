import type { ItemProps } from './item.types';

export interface ItemsGridProps {
  /** The list of items to render in the grid, each rendered via the Item component. */
  items: ItemProps[];
  /** Number of grid columns at the largest breakpoint; 2, 3, or 4 apply responsive column classes (default: 3). */
  columns?: number;
  /** Gap spacing between grid items (default: 'normal'). */
  air?: 'none' | 'tight' | 'normal' | 'loose';
  /** Additional CSS classes appended to the grid container (default: ''). */
  class?: string;
  /** Default values merged into every item's props before rendering, overridden by each item's own values. */
  defaultItemConfig?: Partial<ItemProps>;
}
