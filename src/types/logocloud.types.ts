import type { LayerConfig } from './config.types';
import type { ContainerProps } from './container.types';
import type { ContentCarouselProps } from './contentcarousel.types';
import type { HeadlineProps } from './headline.types';
import type { ImageProps } from './image.types';
import type { VectorProps } from './vector.types';

export interface LogoCloudLogo {
  /** Company or product name; the logo's text alternative unless `image.alt` or `vector.ariaLabel` overrides it */
  name: string;
  /** Link target; the logo renders as a link in the same tab when set */
  href?: string;
  /** Raster or remote logo; pass width and height, or aspectRatio. Set exactly one of `image` and `vector` */
  image?: ImageProps;
  /** Inline SVG logo, recoloured to the text colour unless `preserveColors` is set. Set exactly one of `image` and `vector` */
  vector?: VectorProps;
}

export interface LogoCloudProps {
  /** Configuration for the outer Container */
  container?: ContainerProps;
  /** Headline above the logos; not rendered when omitted (default: { htmlTag: 'h2', align: 'center' }) */
  headline?: HeadlineProps;
  /** The logos, at least one; at least 6 with `layout: 'marquee'` */
  logos: LogoCloudLogo[];
  /** Wrapped and centred, or a continuously drifting ContentCarousel (default: 'static') */
  layout?: 'static' | 'marquee';
  /** Shows logos in greyscale, each regaining colour on hover and focus; no visible effect on a recoloured Vector (default: false) */
  grayscale?: boolean;
  /** Space between logos. Static only (default: 'normal') */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Classes on the logo wrapper. Static only */
  logosClass?: string;
  /** Configuration for the ContentCarousel. Marquee only (default: { ariaLabel: 'Logos', loop: true, autoplay: { mode: 'continuous' }, showIndicators: false, controlsPosition: 'outside' }) */
  contentCarousel?: Omit<ContentCarouselProps, 'items'>;
  /** Image config merged under every `image` logo, over the internal defaults (default: { alt: name, layout: 'contained', class: 'h-8 w-auto' }) */
  defaultImageConfig?: LayerConfig<ImageProps>;
  /** Vector config merged under every `vector` logo, over the internal defaults (default: { ariaLabel: name, class: 'h-8 w-auto' }) */
  defaultVectorConfig?: LayerConfig<VectorProps>;
}
