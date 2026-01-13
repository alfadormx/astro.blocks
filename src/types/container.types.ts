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
  background?: BackgroundProps;
  content?: ContentConfig;
  spacing?: SpacingConfig;
  border?: BorderConfig;
  layout?: LayoutConfig;
  overflow?: OverflowType;
  htmlTag?: ContainerTag;
  class?: string;
  containerWidthType?: ContainerWidthType;
  width?: string; // Tailwind class or CSS value
  minHeight?: string; // Tailwind class or CSS value
  equalHeight?: boolean;
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
  background?: SimpleBackgroundProps;
  spacing?: SpacingConfig;
  border?: BorderConfig;
  class?: string;
}

export interface TwoColumnContainerProps extends GridLayoutProps {
  /** Reverse order on mobile (default: false) */
  reverseOnMobile?: boolean;

  leftColumn?: CellProps;
  rightColumn?: CellProps;
}

export interface ThreeColumnContainerProps extends GridLayoutProps {
  leftColumn?: CellProps;
  centerColumn?: CellProps;
  rightColumn?: CellProps;
}

export interface FourColumnContainerProps extends GridLayoutProps {
  leftColumn?: CellProps;
  centerLeftColumn?: CellProps;
  centerRightColumn?: CellProps;
  rightColumn?: CellProps;
}

export interface SidebarContainerProps extends GridLayoutProps {
  sidebar?: CellProps;
  mainContent?: CellProps;
}
