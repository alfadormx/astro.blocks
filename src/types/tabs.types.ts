import type { ButtonProps } from '~/types/button.types';
import type { ContainerProps } from '~/types/container.types';
import type { SimpleBackgroundProps } from '~/types/background.types';
import type { SpacingConfig } from '~/types/spacing.types';
import type { BorderConfig } from '~/types/border.types';

export interface TabsProps {
  /** List of tab entries; each item is a Button config rendered as a tab trigger, and its index maps to a `panel-{n}` slot for content. */
  items: Partial<ButtonProps>[];
  /** Button config merged as the base/default styling for every tab (both inactive and active states) before item-specific overrides. */
  defaultTabConfig?: Partial<ButtonProps>;
  /** Button config merged on top of `defaultTabConfig` to style the currently active tab. */
  activeTabConfig?: Partial<ButtonProps>;
  /** Layout direction of the tab list and content: 'horizontal' stacks tabs in a row above the panel, 'vertical' places them side by side in a grid (default: 'horizontal'). */
  orientation?: 'horizontal' | 'vertical';
  /** Config passed to the wrapping Container block that surrounds the whole Tabs component. */
  container?: Partial<ContainerProps>;
  /** Styling and arrangement config for the tablist wrapper (the element with role="tablist"): background, spacing, border, an extra class name, plus `layout` (how the triggers are arranged among themselves) and `columns` (grid layout only). */
  tabList?: {
    background?: SimpleBackgroundProps;
    spacing?: SpacingConfig;
    border?: BorderConfig;
    class?: string;
    /** How the triggers are arranged among themselves; independent of `orientation`. Unset derives from `orientation` ('vertical' -> column, otherwise row). */
    layout?: 'row' | 'column' | 'grid';
    /** Number of trigger columns at the widest step; applies only when `layout` is 'grid', ignored otherwise (default: 2). Steps down by container width, never below 2. */
    columns?: 2 | 3 | 4;
  };
}
