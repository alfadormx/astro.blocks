import type { HeadlineProps } from './headline.types';
import type { ImageProps } from './image.types';

/** Fields every entry card shares. */
export interface EntryCardProps {
  /** Card title; the title text is the card's one link and its accessible name (default: htmlTag 'h3'). */
  headline: HeadlineProps;
  /** Entry URL; the whole card is one link. */
  href: string;
  /** Excerpt under the title. */
  description?: string;
  /** Cover image above the title. */
  image?: ImageProps;
  /** Tags in the card footer (default: []). */
  tags?: string[];
  /** Language of the card's dates and UI strings (default: the site's default language). */
  langCode?: string;
  /** Classes on the card root (`data-entry-card`). */
  class?: string;
  /** Classes on the eyebrow line above the title (`data-entry-card-eyebrow`). */
  eyebrowClass?: string;
  /** Classes on the tags list (`data-entry-card-tags`). */
  tagsClass?: string;
}
