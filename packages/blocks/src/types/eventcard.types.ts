import type { EntryCardProps } from './entrycard.types';
import type { EntryLocation } from './entrylayout.types';

export interface EventCardProps extends EntryCardProps {
  /** Start date and time. */
  start: Date;
  /** End date and time; a same-day end shows as a time range. */
  end?: Date;
  /** IANA time zone the times are shown in (default: 'UTC'; the page helpers pass the event's or the site's zone). */
  timezone?: string;
  /** Venue; its name leads the card footer. */
  location?: EntryLocation;
  /** Marks the event as over and shows the past badge. */
  past?: boolean;
  /** Text of the past badge (default: per-language "Past"). */
  pastLabel?: string;
  /** Visual "Read more" text; hidden from assistive tech, since the title is the link (default: per-language string). */
  readMoreLabel?: string;
}
