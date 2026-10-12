import type { ContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ItemsGridProps } from './itemsgrid.types';

export interface ItemsContentProps {
  /** Configuration for the outer Container wrapping the block (default: {}). */
  container?: ContainerProps;
  /** Configuration for the Headline rendered above the items grid (default: {}). */
  headline?: HeadlineProps;
  /** Configuration for the ItemsGrid, including columns, items, and default item config (default: { columns: 2, defaultItemConfig: { orientation: 'horizontal' } }). */
  itemsGrid?: ItemsGridProps;
}
