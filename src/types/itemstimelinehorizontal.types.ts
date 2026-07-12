import type { ItemProps } from './item.types';
import type { ConnectorStyle } from './itemstimeline.types';

export type { ConnectorStyle } from './itemstimeline.types';

export interface ItemsTimelineHorizontalProps {
  /** The list of items rendered horizontally in the timeline (default: []). */
  items: ItemProps[];
  /** The connector line style applied between timeline items (default: 'solid'). */
  connectorStyle?: ConnectorStyle;
  /** The horizontal spacing between timeline items (default: 'normal'). */
  air?: 'none' | 'tight' | 'normal' | 'loose';
  /** Additional CSS classes merged onto the timeline wrapper element (default: ''). */
  class?: string;
  /** Default item props merged into every item before its own values are applied. */
  defaultItemConfig?: Partial<ItemProps>;
}
