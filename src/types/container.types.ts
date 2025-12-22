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

export interface ContainerItem {
  id?: string;
  content?: string; // simple string content; can be expanded to richer types later
  class?: string;
  style?: Record<string, string>;
}

export interface ContainerProps {
  as?: ContainerTag;
  class?: string;
  className?: string;
  containerWidthType?: ContainerWidthType;
  width?: string; // Tailwind class or CSS value
  minHeight?: string; // Tailwind class or CSS value
  items?: ContainerItem[];
}
