import type { ImageProps } from '~/utils/images-optimization';
import type { VectorProps } from './vector.types';
import type { ButtonProps } from './button.types';

export interface LogoProps extends Partial<ButtonProps> {
  /** Props for rendering the logo as an SVG vector; when its `src` is set, it takes precedence over `image` inside the Button. */
  vector?: VectorProps;
  /** Props for rendering the logo as a raster image; used when `vector.src` is not provided. */
  image?: ImageProps;
}
