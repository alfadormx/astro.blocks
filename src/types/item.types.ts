import type { SpacingConfig } from './spacing.types';
import type { BorderConfig } from './border.types';
import type { SimpleBackgroundProps } from './background.types';
import type { ButtonProps } from './button.types';
import type { IconConfig } from './icon.types';

export type ItemLayout = 'vertical' | 'horizontal';

export interface ItemProps {
  /** Icon configuration (name, class, aria-label) rendered alongside the title/content. */
  icon?: IconConfig;
  /** Title text displayed for the item (required). */
  title: string;
  /** Body text displayed below/beside the title (required). */
  content: string;
  /** Action buttons rendered below/beside the content (default: []). */
  actions?: ButtonProps[];
  /** Layout of the item: stacked/centered or icon-left/text-right (default: 'vertical'). */
  layout?: ItemLayout;
  /** Background configuration for the item; only color backgrounds supported. */
  background?: SimpleBackgroundProps;
  /** Spacing configuration applied to the item. */
  spacing?: SpacingConfig;
  /** Border configuration applied to the item. */
  border?: BorderConfig;
  /** Additional custom classes merged onto the item's root element (default: ''). */
  class?: string;
  /** Additional custom classes applied to the content element. */
  contentClass?: string;
  /** Shows a connector line on both sides of the item, for timeline UIs (default: false). */
  showConnector?: boolean;
  /** Shows a connector line on the left/top side of the item (default: false). */
  showConnectorLeft?: boolean;
  /** Shows a connector line on the right/bottom side of the item (default: false). */
  showConnectorRight?: boolean;
  /** Visual style of the connector line (default: 'solid'). */
  connectorStyle?: 'solid' | 'dashed' | 'dotted';
  /** Additional custom classes applied to the connector line(s) (default: ''). */
  connectorClass?: string;
}
