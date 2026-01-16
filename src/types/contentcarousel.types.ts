import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';
import type { ImageProps } from '~/utils/images-optimization';

export type CarouselItem = Partial<ImageProps> & {
  id?: string;
  class?: string;
};

export interface AutoplayConfig {
  enabled?: boolean;
  delay?: number;
  pauseOnHover?: boolean;
  pauseOnInteraction?: boolean;
}

export interface ContentCarouselProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  items?: CarouselItem[];
  initialIndex?: number;
  itemClass?: string;
  controlsPosition?: 'inside' | 'outside';
  showIndicators?: boolean;
  showControls?: boolean;
  draggable?: boolean;
  loop?: boolean;
  autoplay?: AutoplayConfig | boolean | number;
  snapFallback?: 'transform' | 'scroll-snap';
  ariaLabel?: string;
  debug?: boolean;
  prevButtonConfig?: Partial<ButtonProps>;
  nextButtonConfig?: Partial<ButtonProps>;
  indicatorButtonConfig?: Partial<ButtonProps>;
  pauseButtonConfig?: Partial<ButtonProps>;
  class?: string;
}
