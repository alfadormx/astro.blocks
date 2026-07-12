import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';

export type NavigationTreeHorizontalTrigger = 'hover' | 'click';

export interface NavigationTreeHorizontalProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  /** Navigation items to render as top-level buttons; items with a `children` array render a dropdown menu (default: []). */
  items: ButtonProps[];
  /** How dropdown menus are triggered: 'hover' shows on mouse hover, 'click' toggles on click and closes on outside click or Escape (default: 'hover'). */
  trigger?: NavigationTreeHorizontalTrigger;
  /** Horizontal alignment of dropdown menus relative to their parent nav item (default: 'left'). */
  dropdownPosition?: 'left' | 'center' | 'right';
  /** Custom classes merged onto the outer nav container element (default: ''). */
  class?: string;
  /** Custom classes merged onto each nav item wrapper div (default: ''). */
  itemClass?: string;
  /** Custom classes merged onto each dropdown menu container (default: ''). */
  dropdownClass?: string;
  /** Partial ButtonProps applied as shared defaults to top-level and child buttons, overriding the built-in ghost/neutral base config but overridden by each item's own props. */
  defaultItemConfig?: Partial<ButtonProps>;
}
