import type { HTMLAttributes } from 'astro/types';
import type { LayerConfig } from './config.types';
import type { ButtonProps } from './button.types';
import type { NavigationTreeItem } from './navigationtree.types';

export type NavigationTreeHorizontalTrigger = 'hover' | 'click';

export interface NavigationTreeHorizontalProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  /** Navigation items to render as top-level buttons; items with a `children` array render a dropdown menu; with `trigger: 'click'`, a parent's `href` is cleared so the button toggles its dropdown (default: []). */
  items: NavigationTreeItem[];
  /** Path matched against each item's own `href` to find the current page; exact match after trimming one trailing slash, and an href with `#` or `?` never matches (default: `Astro.url.pathname`). */
  currentPath?: string;
  /** How dropdown menus are triggered: 'hover' shows on mouse hover, 'click' toggles on click and closes on outside click or Escape (default: 'hover'). */
  trigger?: NavigationTreeHorizontalTrigger;
  /** Horizontal alignment of dropdown menus relative to their parent nav item (default: 'left'). */
  dropdownPosition?: 'left' | 'center' | 'right';
  /** Custom classes merged onto the outer nav container element (default: ''). */
  class?: string;
  /** Custom classes merged onto each nav item wrapper div (default: ''). */
  itemClass?: string;
  /** Custom classes merged onto each dropdown panel; visibility is owned by the wrapper, so display utilities are safe (default: ''). */
  dropdownClass?: string;
  /** ButtonProps applied as shared defaults to top-level and child buttons in every state, above the built-in base and state layers, below `activeItemConfig`/`inactiveItemConfig` and each item's own props. */
  defaultItemConfig?: LayerConfig<ButtonProps>;
  /** ButtonProps layered on the item whose `href` matches `currentPath`, above `defaultItemConfig`; that item also gets `aria-current="page"` when it renders as a link, which this layer or the item can override (default: ghost/primary). */
  activeItemConfig?: LayerConfig<ButtonProps>;
  /** ButtonProps layered on every item that isn't current, above `defaultItemConfig` (default: ghost/neutral). */
  inactiveItemConfig?: LayerConfig<ButtonProps>;
  /** Icon name for the chevron on items with children; sits above `defaultItemConfig`, so a layer icon can't replace it (default: 'heroicons:chevron-down'). */
  iconName?: string;
}
