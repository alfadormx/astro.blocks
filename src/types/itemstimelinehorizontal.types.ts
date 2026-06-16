import type { ItemProps } from './item.types';
import type { ConnectorStyle } from './itemstimeline.types';

export type { ConnectorStyle } from './itemstimeline.types';

export interface ItemsTimelineHorizontalProps {
  items: ItemProps[];
  connectorStyle?: ConnectorStyle;
  air?: 'none' | 'tight' | 'normal' | 'loose';
  class?: string;
  defaultItemConfig?: Partial<ItemProps>;
}
