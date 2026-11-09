import type { LayerConfig } from './config.types';
import type { ContainerProps } from './container.types';
import type { ContentCarouselProps } from './contentcarousel.types';
import type { HeadlineProps } from './headline.types';
import type { ImageProps } from './image.types';

export interface TestimonialAuthor {
  /** Name shown in the caption */
  name: string;
  /** Job title, company or other context under the name */
  role?: string;
  /** Small round photo beside the name; decorative, since the name is shown (default: { alt: '', width: 48, height: 48, layout: 'fixed', class: 'size-12 rounded-full object-cover' }) */
  avatar?: ImageProps;
}

export interface TestimonialSource {
  /** Link text, e.g. the site the review was posted on */
  label: string;
  /** Link to the original review; opens in the same tab */
  href: string;
}

export interface Testimonial {
  /** The quote as plain text; blank lines split it into paragraphs. HTML is escaped */
  quote: string;
  /** Who said it */
  author: TestimonialAuthor;
  /** Whole stars from 1 to 5; announced as text through `ratingLabel` */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Where the quote was published; rendered as a cited link in the caption */
  source?: TestimonialSource;
  /** Classes on the card's figure (default: 'flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-6') */
  class?: string;
  /** Classes on the blockquote; the defaults cancel the global pull-quote look (default: 'font-body not-italic text-[1rem] leading-normal border-0 pl-0 my-0 space-y-3') */
  quoteClass?: string;
  /** Classes on the figcaption (default: 'mt-auto flex items-center gap-3') */
  authorClass?: string;
  /** Classes on the rating wrapper (default: 'flex gap-0.5') */
  ratingClass?: string;
  /** Screen-reader text for the rating; `{rating}` is replaced by the number (default: '{rating} out of 5') */
  ratingLabel?: string;
}

export interface TestimonialsProps {
  /** Configuration for the outer Container */
  container?: ContainerProps;
  /** Headline above the testimonials; not rendered when omitted (default: { htmlTag: 'h2', align: 'center' }) */
  headline?: HeadlineProps;
  /** The testimonials, at least one */
  testimonials: Testimonial[];
  /** Cards in a grid, or one card per slide in a ContentCarousel (default: 'grid') */
  layout?: 'grid' | 'carousel';
  /** Grid columns at the widest size; steps down with the container width. Grid only (default: 3) */
  columns?: 1 | 2 | 3 | 4;
  /** Space between cards. Grid only (default: 'normal') */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Classes on the grid wrapper. Grid only */
  testimonialsClass?: string;
  /** Configuration for the ContentCarousel. Carousel only (default: { ariaLabel: 'Testimonials', controlsPosition: 'outside' }) */
  contentCarousel?: Omit<ContentCarouselProps, 'items'>;
  /** Basis classes on each slide, setting how many cards show at once. Carousel only (default: 'basis-full @lg:basis-1/2 @3xl:basis-1/3') */
  slideClass?: string;
  /** Presentation merged under every testimonial, over the internal defaults */
  defaultTestimonialConfig?: LayerConfig<
    Omit<Testimonial, 'quote' | 'author' | 'rating' | 'source'>
  >;
}
