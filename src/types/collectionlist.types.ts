import type { ButtonProps } from './button.types';
import type { CaseStudyCardProps } from './casestudycard.types';
import type { LayerConfig } from './config.types';
import type { EventCardProps } from './eventcard.types';
import type { PostCardProps } from './postcard.types';

/** One list entry: a card's props tagged by the collection's preset. */
export type CollectionListEntry =
  | ({ preset: 'post' } & PostCardProps)
  | ({ preset: 'caseStudy' } & CaseStudyCardProps)
  | ({ preset: 'event' } & EventCardProps);

/** Page position for the pager; built by the collection page helpers. */
export interface CollectionListPage {
  currentPage: number;
  lastPage: number;
  url: { prev?: string; next?: string };
}

export interface CollectionListProps {
  /** Entries in display order; each renders the card for its `preset`. */
  entries: CollectionListEntry[];
  /** `horizontal` lays cards in a grid; `vertical` stacks them in one column (default: 'horizontal'). */
  orientation?: 'horizontal' | 'vertical';
  /** Grid columns at the widest size; ignored when vertical (default: 3). */
  columns?: 1 | 2 | 3 | 4;
  /** Space between cards (default: 'normal'). */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Classes on the list (`data-collection-list`). */
  class?: string;
  /** Layer merged under every PostCard, under each entry's own values. */
  defaultPostCardConfig?: LayerConfig<Omit<PostCardProps, 'href' | 'date'>>;
  /** Layer merged under every CaseStudyCard, under each entry's own values. */
  defaultCaseStudyCardConfig?: LayerConfig<Omit<CaseStudyCardProps, 'href' | 'client'>>;
  /** Layer merged under every EventCard, under each entry's own values. */
  defaultEventCardConfig?: LayerConfig<Omit<EventCardProps, 'href' | 'start' | 'end' | 'past'>>;
  /** Page position; the pager renders when there is more than one page. */
  page?: CollectionListPage;
  /** Previous-page Button; `false` hides it (default: outline, per-language "Previous"). */
  prevButton?: Omit<ButtonProps, 'href'> | false;
  /** Next-page Button; `false` hides it (default: outline, per-language "Next"). */
  nextButton?: Omit<ButtonProps, 'href'> | false;
  /** Pager status text; `{current}` and `{last}` are replaced (default: per-language "Page {current} of {last}"). */
  pageStatusLabel?: string;
  /** Classes on the pager (`data-collection-pager`). */
  pagerClass?: string;
  /** Language of the pager's UI strings (default: the site's default language). */
  langCode?: string;
}
