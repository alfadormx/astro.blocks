import type { ButtonProps } from './button.types';
import type { ContainerProps } from './container.types';
import type { SimpleBackgroundProps } from './background.types';
import type { SpacingConfig } from './spacing.types';
import type { BorderConfig } from './border.types';
import type { LayerConfig } from './config.types';

export interface TabsProps {
  /** List of tab entries; each item is a Button config rendered as a tab trigger, and its index maps to a `panel-{n}` slot for content. Any number of tabs is supported — the panel count follows the item count with no upper bound. `id` is omitted because Tabs assigns trigger ids. */
  items: Omit<ButtonProps, 'id'>[];
  /** Button config merged under every tab, in both states, before the item's own values. */
  defaultItemConfig?: LayerConfig<ButtonProps>;
  /** Button config merged over `defaultItemConfig` on the active tab only. */
  activeItemConfig?: LayerConfig<ButtonProps>;
  /** Layout direction of the tab list and content: 'horizontal' stacks tabs in a row above the panel, 'vertical' places them side by side in a grid (default: 'horizontal'). */
  orientation?: 'horizontal' | 'vertical';
  /** Config passed to the wrapping Container block that surrounds the whole Tabs component. */
  container?: Partial<ContainerProps>;
  /** Custom classes for every tab panel (the element with role="tabpanel"); display utilities such as `flex` are safe, inactive panels stay hidden. */
  panelClass?: string;
  /** Styling and arrangement config for the tablist wrapper (the element with role="tablist"): background, spacing, border, an extra class name, plus `layout` (how the triggers are arranged among themselves) and `columns` (grid layout only). */
  tabList?: {
    background?: SimpleBackgroundProps;
    spacing?: SpacingConfig;
    border?: BorderConfig;
    class?: string;
    /** How the triggers are arranged among themselves; independent of `orientation`. Unset derives from `orientation` ('vertical' -> column, otherwise row). In 'grid' and 'column' the triggers fill the tab list (grid: whole cell; column: full width); set `width: 'auto'` on `defaultItemConfig`, `activeItemConfig` or an item to opt out. Setting `align` on a trigger disables the fill. */
    layout?: 'row' | 'column' | 'grid';
    /** Number of trigger columns at the widest step; applies only when `layout` is 'grid', ignored otherwise (default: 2). Steps down by container width, never below 2. */
    columns?: 2 | 3 | 4;
    /** Classes on the `@container` wrapper around the tab list, rendered only when `layout` is 'grid'; use it for `sticky` (the wrapper, not the list, is what sticks). */
    wrapperClass?: string;
  };
}
