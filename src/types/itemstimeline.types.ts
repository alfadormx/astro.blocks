import type { ItemProps } from './item.types';
import type { LayerConfig } from './config.types';

export type ConnectorStyle = 'solid' | 'dashed' | 'dotted';

/** Item props for a timeline entry; orientation and connectors are set by the timeline. */
export type TimelineItemProps = Omit<
  ItemProps,
  'orientation' | 'showConnector' | 'showConnectorLeft' | 'showConnectorRight' | 'connectorStyle'
>;

export interface ItemsTimelineProps {
  /** The list of items rendered as timeline entries, each displayed via the Item component. */
  items: TimelineItemProps[];
  /** The connector line style drawn between timeline items, applied to every item except the last (default: 'solid'). */
  connectorStyle?: ConnectorStyle;
  /** The vertical spacing between timeline items, controlling the bottom padding applied to each item's content (default: 'normal'). */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Additional CSS classes merged onto the timeline's outer container element (default: ''). */
  class?: string;
  /** Default Item props merged into every timeline item before its own item-specific values are applied. */
  defaultItemConfig?: LayerConfig<TimelineItemProps>;
}
