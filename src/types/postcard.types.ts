import type { EntryCardProps } from './entrycard.types';

export interface PostCardProps extends EntryCardProps {
  /** Publication date, formatted in the card language's locale. */
  date: Date;
  /** Minutes to read, shown after the date; `false` or unset hides it. */
  readingTime?: number | false;
  /** Visual "Read more" text; hidden from assistive tech, since the title is the link (default: per-language string). */
  readMoreLabel?: string;
}
