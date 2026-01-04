import type { ItemProps } from './item.types';

export interface ItemsGridProps {
  items: ItemProps[];
  columns?: number;
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  class?: string;
  defaultItemConfig?: Partial<ItemProps>;
}
