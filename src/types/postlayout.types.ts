import type { EntryLayoutProps } from './entrylayout.types';

export interface PostLayoutProps extends EntryLayoutProps {
  /** Publication date, formatted in the layout language's locale. */
  date: Date;
  /** Last update; shown as "Updated …" when set. */
  updated?: Date;
  /** Author name. */
  author?: string;
  /** Minutes to read; `false` or unset hides it. */
  readingTime?: number | false;
}
