import type { EntryCardProps } from './entrycard.types';

export interface CaseStudyCardProps extends EntryCardProps {
  /** Client name, shown above the title. */
  client: string;
  /** Visual "Read more" text; hidden from assistive tech, since the title is the link (default: per-language string). */
  readMoreLabel?: string;
}
