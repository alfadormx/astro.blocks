import type { HTMLAttributes } from 'astro/types';
import type { ImageMetadata } from 'astro';

export type VectorLayout = 'responsive' | 'fixed' | 'intrinsic' | 'fill';
export type VectorFit = 'contain' | 'cover' | 'fill';
export type VectorAlign = 'left' | 'center' | 'right';

export interface VectorProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  /** The SVG source: a path/URL string (root-relative, relative, external, or raw `<svg>` markup) or an imported `ImageMetadata` object, used to load the SVG content. */
  src: string | ImageMetadata;
  /** Layout mode controlling the wrapper's sizing behavior: 'responsive' fills width/height and centers content, 'fixed' sizes to the given width/height, 'intrinsic' sizes to the SVG's natural dimensions, 'fill' stretches to fill the container (default: 'responsive'). */
  layout?: VectorLayout;
  /** How the SVG should fit within its container (contain, cover, or fill). */
  fit?: VectorFit;
  /** Width of the wrapper; applied as inline CSS (in px if a number) only when layout is 'fixed'. */
  width?: number | string;
  /** Height of the wrapper; applied as inline CSS (in px if a number) only when layout is 'fixed'. */
  height?: number | string;
  /** Horizontal alignment of the SVG within the wrapper for non-'fill' layouts. */
  align?: VectorAlign;
  /** Additional CSS class names appended to the wrapper element (default: ''). */
  class?: string;
  /** Accessible label added as `aria-label` on the rendered `<svg>` element (also sets `role="img"`) when provided. */
  ariaLabel?: string;
  /** When true, keeps the SVG's original fill/stroke colors instead of replacing them with `currentColor` (default: false). */
  preserveColors?: boolean;
}
