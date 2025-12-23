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

export type ContainerWidthType = 'full' | 'boxed' | 'custom';
export type ContentWidthType = 'full' | 'boxed';
export type OverflowType = 'visible' | 'hidden' | 'auto';

export type BackgroundAttachment = 'scroll' | 'fixed';

export interface BackgroundConfig {
  image?: string;
  video?: string;
  attachment?: BackgroundAttachment;
  class?: string;
}

export interface ContentConfig {
  class?: string;
  boxWidth?: string; // Tailwind class for inner max-width
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
  overflow?: OverflowType;
  htmlTag?: ContainerTag;
  containerClass?: string;
  containerWidthType?: ContainerWidthType;
  width?: string; // Tailwind class or CSS value
  minHeight?: string; // Tailwind class or CSS value
  equalHeight?: boolean;
  items?: ContainerItem[];
}
