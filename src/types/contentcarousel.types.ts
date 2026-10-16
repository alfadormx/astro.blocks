import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';
import type { ImageProps } from './image.types';
import type { ContainerProps } from './container.types';
import type { LayerConfig } from './config.types';

export type CarouselItem = Partial<ImageProps> & {
  id?: string;
  /** Classes on the slide wrapper, not the image; style the image with `defaultImageConfig.class`. */
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
  /** Previous-slide button merged over the default; `false` hides it (default: rendered). */
  prevButton?: ButtonProps | false;
  /** Next-slide button merged over the default; `false` hides it (default: rendered). */
  nextButton?: ButtonProps | false;
  /** Button config merged under every slide indicator; `aria-label` is a prefix, and the slide number is appended. */
  defaultIndicatorButtonConfig?: LayerConfig<ButtonProps>;
  /**
   * Image config merged under every slide in `items`, over the defaults (default: { class: 'w-full h-auto', layout: 'fullWidth', aspectRatio: 16 / 9 }).
   * Named after the block it reaches, since a slide's `class` stays on its wrapper (contract A14).
   * `object-fit` is written inline by the image optimiser (`cover`; `contain` with `layout: 'contained'`); change it through `layout`, not a class.
   */
  defaultImageConfig?: LayerConfig<ImageProps>;
  /** Autoplay pause button merged over the default. */
  pauseButton?: ButtonProps;
  /** Autoplay resume button merged over the default. */
  playButton?: ButtonProps;
  /** Container wrapping the carousel; rendered only when set. Carousel attributes stay on the inner root. */
  container?: ContainerProps;
  /** Additional class names applied to the root carousel element (default: ''). */
  class?: string;
}

export interface ContentCarouselItemProps extends ContainerProps {
  /** Tailwind basis class controlling slide width (default: 'basis-full') */
  basis?: string;
}
