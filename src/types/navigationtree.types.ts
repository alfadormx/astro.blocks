import type { ButtonProps } from './button.types';

export type ExpansionStrategy =
  'always' | 'active-only' | 'first-level' | 'depth' | 'active-siblings' | 'toggleable';

export type ToggleMode =
  | 'button' // Whole button toggles children (default, mobile-friendly)
  | 'icon'; // Only icon toggles, button navigates to href

export interface NavigationTreeProps {
  /** The list of navigation items to render, each a ButtonProps optionally with nested `children` for sub-trees. */
  items: ButtonProps[];
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
  /** Whether clicking the whole button or only the icon toggles children (default: `'button'`). */
  toggleMode?: ToggleMode;
  /** Button config merged into non-active items, overriding the built-in defaults. */
  defaultItemConfig?: Partial<ButtonProps>;
  /** Button config merged into the active item, overriding the built-in defaults. */
  defaultActiveItemConfig?: Partial<ButtonProps>;
  /** The strategy that decides whether an item's children are shown (default: `'active-only'`). */
  expansionStrategy?: ExpansionStrategy;
  /** The maximum depth expanded when `expansionStrategy` is `'depth'` (default: `Infinity`). */
  maxDepth?: number;
}
