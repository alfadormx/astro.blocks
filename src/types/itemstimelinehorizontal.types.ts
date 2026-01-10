import type { ItemProps } from './item.types';

export type ConnectorStyle = 'solid' | 'dashed' | 'dotted';

export interface ItemsTimelineHorizontalProps {
  items: ItemProps[];
  connectorStyle?: ConnectorStyle;
  air?: 'none' | 'tight' | 'normal' | 'loose';
  class?: string;
  defaultItemConfig?: Partial<ItemProps>;
}
