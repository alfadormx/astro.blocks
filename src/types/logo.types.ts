import type { ImageProps } from './image.types';
import type { VectorProps } from './vector.types';
import type { ButtonProps } from './button.types';

export interface LogoProps extends Omit<ButtonProps, 'image'> {
  /** Props for rendering the logo as an SVG vector; when its `src` is set, it takes precedence over `image` inside the Button. */
  vector?: VectorProps;
  /** Props for rendering the logo as a raster image inside the Button slot; used when `vector.src` is not provided. Replaces Button's own `image` media slot. */
  image?: ImageProps;
}
