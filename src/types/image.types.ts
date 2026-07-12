import type { ImageMetadata } from 'astro';
import type { HTMLAttributes } from 'astro/types';

type Layout = 'fixed' | 'constrained' | 'fullWidth' | 'cover' | 'responsive' | 'contained';

export interface ImageProps extends Omit<HTMLAttributes<'img'>, 'src'> {
  /** Image source — a local ImageMetadata import or a remote/relative URL string; resolved via findImage before rendering */
  src?: string | ImageMetadata | null;
  /** Rendered image width in pixels; numeric strings are parsed with parseInt before use */
  width?: string | number | null;
  /** Rendered image height in pixels; numeric strings are parsed with parseInt before use */
  height?: string | number | null;
  /** Accessible alternative text; required at runtime — the component throws if it is undefined or null */
  alt?: string | null;
  /** Native img loading strategy; falls back to 'lazy' when not set */
  loading?: 'eager' | 'lazy' | null;
  /** Native img decoding hint; falls back to 'async' when not set */
  decoding?: 'sync' | 'async' | 'auto' | null;
  /** Extra inline CSS appended after the layout-generated styles */
  style?: string;
  /** Explicit srcset value; overrides the automatically generated responsive srcset when provided */
  srcset?: string | null;
  /** Explicit sizes attribute; auto-computed from width and layout when left unset */
  sizes?: string | null;
  /** Native fetchpriority hint forwarded to the rendered img element */
  fetchpriority?: 'high' | 'low' | 'auto' | null;

  /** Responsive layout mode used to compute wrapper alignment classes and generated sizing styles */
  layout?: Layout;
  /** Custom breakpoint widths (in px) used to build the responsive srcset */
  widths?: number[] | null;
  /** Forces an aspect ratio (e.g. '16:9' or a number) used to derive a missing width or height */
  aspectRatio?: string | number | null;
  /** CSS object-position value applied to the generated image styles */
  objectPosition?: string;
  /** Horizontal alignment of the image within its wrapper (left, center, or right) */
  align?: 'left' | 'center' | 'right';

  /** Target output image format (e.g. 'webp') requested from the image optimizer */
  format?: string;
}
