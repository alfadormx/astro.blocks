import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';

/** A navigation entry: Button props plus optional nested `children` rendered as a sub-tree. */
export type NavigationTreeItem = ButtonProps & { children?: NavigationTreeItem[] };

export type ExpansionStrategy =
  'always' | 'active-only' | 'first-level' | 'depth' | 'active-siblings' | 'toggleable';

export type ToggleMode =
  | 'button' // Whole button toggles children (default, mobile-friendly)
  | 'icon'; // Only icon toggles, button navigates to href

export interface NavigationTreeProps {
  /** The list of navigation items to render, each a ButtonProps optionally with nested `children` for sub-trees. */
  items: NavigationTreeItem[];
  /** The path used to determine which item is active (default: `Astro.url.pathname`). */
  currentPath?: string;
  /** The current nesting depth, used for indentation and recursive rendering (default: `0`). */
  level?: number;
  /** Additional CSS class(es) applied to the root `<nav>` element (default: `''`). */
  class?: string;
  /** The icon name shown on items that have children (default: `'mdi:chevron-right'`). */
  iconName?: string;
  /** Whether the expand icon rotates when its item is expanded (default: `true`). */
  rotateIconOnExpand?: boolean;
  /** Whether clicking the whole button or only the icon toggles children; in 'button' mode a parent's `href` is cleared so the button toggles (default: `'button'`). */
  toggleMode?: ToggleMode;
  /** Button config merged into every item, in every state, under the state layers. */
  defaultItemConfig?: LayerConfig<ButtonProps>;
  /** Button config merged over `defaultItemConfig` on non-active items. */
  inactiveItemConfig?: LayerConfig<ButtonProps>;
  /** Button config merged over `defaultItemConfig` on the active item. */
  activeItemConfig?: LayerConfig<ButtonProps>;
  /** The strategy that decides whether an item's children are shown (default: `'active-only'`). */
  expansionStrategy?: ExpansionStrategy;
  /** The maximum depth expanded when `expansionStrategy` is `'depth'` (default: `Infinity`). */
  maxDepth?: number;
}
