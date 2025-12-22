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

export interface ContainerItem {
  id?: string;
  content?: string; // simple string content; can be expanded to richer types later
  class?: string;
  style?: Record<string, string>;
}

export interface ContainerProps {
  overflow?: OverflowType;
  htmlTag?: ContainerTag;
  containerClass?: string;
  containerClassName?: string;
  containerWidthType?: ContainerWidthType;
  contentClass?: string;
  contentClassName?: string;
  contentWidthType?: ContentWidthType;
  contentBoxWidth?: string; // Tailwind class for inner max-width
  width?: string; // Tailwind class or CSS value
  minHeight?: string; // Tailwind class or CSS value
  equalHeight?: boolean;
  items?: ContainerItem[];
}
