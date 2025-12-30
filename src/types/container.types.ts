import type { BackgroundConfig } from './background.types';

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

export type ContainerAir = 'none' | 'normal';
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

export interface SpacingConfig {
  padding?: string; // e.g., "p-8" or "px-4 py-8"
  margin?: string; // e.g., "mx-auto mb-8"
  gap?: string; // e.g., "gap-4"
}

export interface BorderConfig {
  width?: string; // e.g., "border" or "border-2" or "border-t-2"
  color?: string; // e.g., "border-gray-200"
  radius?: string; // e.g., "rounded-lg"
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
  background?: BackgroundConfig;
  content?: ContentConfig;
  spacing?: SpacingConfig;
  border?: BorderConfig;
  layout?: LayoutConfig;
  overflow?: OverflowType;
  htmlTag?: ContainerTag;
  containerClass?: string;
  containerWidthType?: ContainerWidthType;
  width?: string; // Tailwind class or CSS value
  minHeight?: string; // Tailwind class or CSS value
  equalHeight?: boolean;
  items?: ContainerItem[];
}

export interface GridLayoutProps extends Omit<ContainerProps, 'layout' | 'items'> {
  /** Gap between columns/sections (default: 'gap-6') */
  gap?: string;
  /** Responsive behavior (default: false - always side-by-side) */
  responsive?: boolean;
  /** Responsive breakpoint (default: 'md:' - use 'sm:', 'lg:', etc.) */
  breakpoint?: string;
  /** Custom grid classes (overrides default) */
  gridClass?: string;
}

export interface TwoColumnContainerProps extends GridLayoutProps {
  /** Reverse order on mobile (default: false) */
  reverseOnMobile?: boolean;
}

export type ThreeColumnContainerProps = GridLayoutProps;

export type FourColumnContainerProps = GridLayoutProps;

export type SidebarContainerProps = GridLayoutProps;
