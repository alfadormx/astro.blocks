import type { CarouselItem, ContentCarouselProps } from './contentcarousel.types';
import type { EntryLayoutProps, EntryLocation } from './entrylayout.types';
import type { MapProps } from './map.types';

export interface CaseStudyLayoutProps extends EntryLayoutProps {
  /** Client name, first in the meta line. */
  client: string;
  /** Project date, formatted in the layout language's locale. */
  date: Date;
  /** Headline figures shown above the body, value over label. */
  results?: { label: string; value: string }[];
  /** Project location; with `lat` and `lon` the layout shows a Map after the body. */
  location?: EntryLocation;
  /** Map shown when `location` has coordinates; `false` hides it (default: zoom from the location or 13, height '320px'). */
  map?: Omit<MapProps, 'lat' | 'lon'> | false;
  /** Images shown as a carousel after the body, before the map; renders only when non-empty. */
  gallery?: CarouselItem[];
  /** Configuration for the gallery ContentCarousel (default: { ariaLabel: per-language "Project gallery", defaultImageConfig: { widths: [640, 960, 1280], sizes: '(min-width: 768px) 768px, 100vw' } }); other image defaults are ContentCarousel's. */
  contentCarousel?: Omit<ContentCarouselProps, 'items'>;
  /** Classes on the results list (`data-case-study-results`). */
  resultsClass?: string;
}
