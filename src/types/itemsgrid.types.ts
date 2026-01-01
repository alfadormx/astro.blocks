import type { ItemProps } from './item.types';

export interface ItemsGridProps {
  items: ItemProps[];
  columns?: number;
  gap?: string;
  class?: string;
  defaultItemConfig?: Partial<ItemProps>;
}
