import type { ItemProps } from './item.types';
import type { LayerConfig } from './config.types';

/**
 * Selection behaviour of an ItemsGrid. `'none'` renders a static grid; `'single'` and
 * `'multiple'` make every item an option in the named selection group.
 */
export type ItemsGridSelection =
  | { mode: 'none' }
  | {
      mode: 'single';
      /** Selection group the grid publishes to (`data-selection-group`). */
      group: string;
      /** Accessible name of the option set; used when `labelledBy` is not given. */
      label?: string;
      /** Id of the element naming the option set; wins over `label`. */
      labelledBy?: string;
      /** Colour of the selected border and focus ring, matching Button (default: 'primary'). */
      intent?:
        | 'primary'
        | 'secondary'
        | 'tertiary'
        | 'accent'
        | 'success'
        | 'warning'
        | 'error'
        | 'neutral';
    }
  | {
      mode: 'multiple';
      /** Selection group the grid publishes to (`data-selection-group`). */
      group: string;
      /** Accessible name of the option set; used when `labelledBy` is not given. */
      label?: string;
      /** Id of the element naming the option set; wins over `label`. */
      labelledBy?: string;
      /** Minimum number of selected options; a deselect below it is refused. */
      min?: number;
      /** Maximum number of selected options; further options are disabled at the limit. */
      max?: number;
      /** Colour of the selected border and focus ring, matching Button (default: 'primary'). */
      intent?:
        | 'primary'
        | 'secondary'
        | 'tertiary'
        | 'accent'
        | 'success'
        | 'warning'
        | 'error'
        | 'neutral';
    };

/** An ItemsGrid item: Item props plus the option fields read when selection is enabled. */
export type ItemsGridItem = ItemProps & {
  /** Option code published when this item is selected; required when selection is enabled. */
  code?: string;
  /** Whether the item is selected on load (default: false). */
  selected?: boolean;
};

export interface ItemsGridProps {
  /** The list of items to render in the grid, each rendered via the Item component. */
  items: ItemsGridItem[];
  /** Maximum number of grid columns, reached when the grid's container is wide enough; with `responsive` the grid steps down to fewer columns in narrower containers, without it the count is fixed (default: 3). */
  columns?: 1 | 2 | 3 | 4;
  /** Steps the column count down in narrower containers; `false` keeps `columns` at any width (default: true). */
  responsive?: boolean;
  /** A lone item in the last row spans the full row; computed from `columns`, so exact only with `responsive: false` (default: false). */
  fillLastRow?: boolean;
  /** Gap spacing between grid items (default: 'normal'). */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Additional CSS classes appended to the grid container (default: ''). */
  class?: string;
  /** Default values merged into every item's props before rendering, overridden by each item's own values. */
  defaultItemConfig?: LayerConfig<ItemProps>;
  /** Selection mode of the grid; `'none'` renders a static, non-interactive grid (default: { mode: 'none' }). */
  selection?: ItemsGridSelection;
  /** Values merged into each item's selected variant, after `defaultItemConfig` and before the item's own values. */
  selectedItemConfig?: LayerConfig<ItemProps>;
}
