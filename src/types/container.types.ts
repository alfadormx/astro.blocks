import type { BackgroundProps, SimpleBackgroundProps } from './background.types';
import type { SpacingConfig } from './spacing.types';
import type { BorderConfig } from './border.types';

export type ContainerTag =
  | 'div'
  | 'header'
  | 'footer'
  | 'main'
  | 'article'
  | 'section'
  | 'aside'
  | 'figure'
  | 'figcaption'
  | 'summary'
  | 'nav'
  | 'a';

export type ContainerAir = 'none' | 'tight' | 'normal' | 'loose';
export type ContainerWidthType = 'full' | 'boxed' | 'custom';
export type ContentWidthType = 'full' | 'boxed';
export type OverflowType = 'visible' | 'hidden' | 'auto';

export interface ContentConfig {
  class?: string;
  boxWidth?: string; // Tailwind class for inner max-width
  air?: ContainerAir;
  widthType?: ContentWidthType;
  spacing?: SpacingConfig;
  border?: BorderConfig;
}

export interface LayoutConfig {
  type?: 'flex' | 'grid';
  class?: string; // e.g., "flex-row gap-4 items-center" or "grid-cols-3 gap-6"
}
export interface ContainerItem {
  id?: string;
  content?: string; // simple string content; can be expanded to richer types later
  class?: string;
  style?: Record<string, string>;
}

export interface ContainerProps {
  /** Background image, video, or color/class configuration rendered behind the content */
  background?: BackgroundProps;
  /** Inner content sizing, spacing, and border configuration */
  content?: ContentConfig;
  /** Margin/padding configuration applied to the outer container element */
  spacing?: SpacingConfig;
  /** Border configuration applied to the outer container element */
  border?: BorderConfig;
  /** Flex or grid layout configuration for arranging child elements */
  layout?: LayoutConfig;
  /** CSS overflow behavior for the outer container (default: 'visible') */
  overflow?: OverflowType;
  /** HTML tag rendered for the outer container element (default: 'section') */
  htmlTag?: ContainerTag;
  /** Custom classes for the outer container element */
  class?: string;
  /** Outer container width mode: full-bleed, boxed, or a custom width (default: 'full') */
  containerWidthType?: ContainerWidthType;
  /** Tailwind class or CSS value for the container's custom width (used when containerWidthType is 'custom') */
  width?: string;
  /** Tailwind class or CSS value forcing a minimum height on the container */
  minHeight?: string;
  /** Stretches all direct children to equal height (default: false) */
  equalHeight?: boolean;
  /** Simple content items rendered as direct children when no default slot content is provided */
  items?: ContainerItem[];
}

export interface GridLayoutProps extends Omit<ContainerProps, 'layout' | 'items'> {
  /** Air (spacing) between columns/sections - responsive sizing (default: 'normal') */
  air?: 'none' | 'tight' | 'normal' | 'loose';
  /** Responsive behavior (default: false - always side-by-side) */
  responsive?: boolean;
  /** Responsive breakpoint (default: 'md:' - use 'sm:', 'lg:', etc.) */
  breakpoint?: string;
}

export interface CellProps {
  /** Background color/class configuration for the column (image/video not supported) */
  background?: SimpleBackgroundProps;
  /** Margin/padding configuration applied to the column */
  spacing?: SpacingConfig;
  /** Border configuration applied to the column */
  border?: BorderConfig;
  /** Custom classes for the column element */
  class?: string;
}

export interface TwoColumnContainerProps extends GridLayoutProps {
  /** Reverse order on mobile (default: false) */
  reverseOnMobile?: boolean;
  /** Configuration for the left column */
  leftColumn?: CellProps;
  /** Configuration for the right column */
  rightColumn?: CellProps;
}

export interface ThreeColumnContainerProps extends GridLayoutProps {
  /** Configuration for the left column */
  leftColumn?: CellProps;
  /** Configuration for the center column */
  centerColumn?: CellProps;
  /** Configuration for the right column */
  rightColumn?: CellProps;
}

export interface FourColumnContainerProps extends GridLayoutProps {
  /** Configuration for the leftmost column */
  leftColumn?: CellProps;
  /** Configuration for the center-left column */
  centerLeftColumn?: CellProps;
  /** Configuration for the center-right column */
  centerRightColumn?: CellProps;
  /** Configuration for the rightmost column */
  rightColumn?: CellProps;
}

export interface SidebarContainerProps extends GridLayoutProps {
  /** Configuration for the sidebar column */
  sidebar?: CellProps;
  /** Configuration for the main content column */
  mainContent?: CellProps;
}
