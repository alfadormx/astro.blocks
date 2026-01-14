import type { HTMLAttributes } from 'astro/types';
import type { ImageMetadata } from 'astro';

export type VectorLayout = 'responsive' | 'fixed' | 'intrinsic' | 'fill';
export type VectorFit = 'contain' | 'cover' | 'fill';
export type VectorAlign = 'left' | 'center' | 'right';

export interface VectorProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  src: string | ImageMetadata;
  layout?: VectorLayout;
  fit?: VectorFit;
  width?: number | string;
  height?: number | string;
  align?: VectorAlign;
  class?: string;
  ariaLabel?: string;
  preserveColors?: boolean;
}
