import type { ImageProps } from '~/utils/images-optimization';
import type { VectorProps } from './vector.types';
import type { ButtonProps } from './button.types';

export interface LogoProps extends Partial<ButtonProps> {
  vector?: VectorProps;
  image?: ImageProps;
}
