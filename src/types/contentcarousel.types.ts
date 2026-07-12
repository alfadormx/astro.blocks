import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';
import type { ImageProps } from '~/utils/images-optimization';
import type { ContainerProps } from './container.types';

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
  /** Images rendered as slides when no default slot content is provided (default: []). */
  items?: CarouselItem[];
  /** Slide index shown on load (default: 0). */
  initialIndex?: number;
  /** Tailwind classes applied to each rendered slide, e.g. for basis sizing (default: 'basis-full'). */
  itemClass?: string;
  /** Whether controls/indicators overlay the viewport or sit adjacent to it (default: 'inside'). */
  controlsPosition?: 'inside' | 'outside';
  /** Whether the slide indicator dots are rendered (default: true). */
  showIndicators?: boolean;
  /** Whether the previous/next navigation buttons are rendered (default: true). */
  showControls?: boolean;
  /** Whether pointer/touch drag navigation is enabled (default: true). */
  draggable?: boolean;
  /** Whether the carousel loops infinitely using cloned slides (default: false). */
  loop?: boolean;
  /** Autoplay behavior: boolean to enable/disable, number as delay in ms, or a full config object (default: false). */
  autoplay?: AutoplayConfig | boolean | number;
  /** Positioning strategy used when moving between slides (default: 'transform'). */
  snapFallback?: 'transform' | 'scroll-snap';
  /** Accessible label for the carousel region (falls back to 'Content carousel' when unset). */
  ariaLabel?: string;
  /** Shows a debug overlay with live drag/index state (default: false). */
  debug?: boolean;
  /** Overrides merged into the default previous-slide button config. */
  prevButtonConfig?: Partial<ButtonProps>;
  /** Overrides merged into the default next-slide button config. */
  nextButtonConfig?: Partial<ButtonProps>;
  /** Overrides merged into the default slide indicator button config. */
  indicatorButtonConfig?: Partial<ButtonProps>;
  /** Overrides merged into the default autoplay pause button config. */
  pauseButtonConfig?: Partial<ButtonProps>;
  /** Overrides merged into the default autoplay play/resume button config. */
  playButtonConfig?: Partial<ButtonProps>;
  /** Additional class names applied to the root carousel element (default: ''). */
  class?: string;
}

export interface ContentCarouselItemProps extends ContainerProps {
  /** Tailwind basis class controlling slide width (default: 'basis-full') */
  basis?: string;
}
