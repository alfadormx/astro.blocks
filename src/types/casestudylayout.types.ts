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
  /** Classes on the results list (`data-case-study-results`). */
  resultsClass?: string;
}
