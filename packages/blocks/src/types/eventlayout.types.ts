import type { ButtonProps } from './button.types';
import type { EntryLayoutProps, EntryLocation } from './entrylayout.types';
import type { MapProps } from './map.types';

export interface EventLayoutProps extends EntryLayoutProps {
  /** Start date and time. */
  start: Date;
  /** End date and time; a same-day end shows as a time range. */
  end?: Date;
  /** IANA time zone the times are shown in (default: 'UTC'; the page helpers pass the event's or the site's zone). */
  timezone?: string;
  /** Venue; its name and address follow the date in the meta line, and coordinates add a Map. */
  location?: EntryLocation;
  /** Registration link; the Register button renders when it is set. */
  registrationUrl?: string;
  /** Register Button above the body; `false` hides it (default: solid primary, per-language "Register"). */
  registerButton?: Omit<ButtonProps, 'href'> | false;
  /** Map shown when `location` has coordinates; `false` hides it (default: zoom from the location or 13, height '320px'). */
  map?: Omit<MapProps, 'lat' | 'lon'> | false;
}
