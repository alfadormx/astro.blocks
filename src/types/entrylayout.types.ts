import type { HeadlineProps } from './headline.types';
import type { ImageProps } from './image.types';

/** A place: a name alone (`Online`), or with an address and map coordinates. */
export interface EntryLocation {
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
  zoom?: number;
}

/** Fields every entry layout shares. */
export interface EntryLayoutProps {
  /** Entry title (default: htmlTag 'h1'). */
  headline: HeadlineProps;
  /** Cover image above the title. */
  image?: ImageProps;
  /** Tags under the body (default: []). */
  tags?: string[];
  /** Language of the layout's dates and UI strings (default: the site's default language). */
  langCode?: string;
  /** Classes on the layout root (`data-entry-layout`). */
  class?: string;
  /** Classes on the Markdown body wrapper (`data-entry-body`), merged after `prose`; use typography modifiers such as `prose-lg` or `max-w-none`. */
  bodyClass?: string;
  /** Classes on the tags list (`data-entry-layout-tags`). */
  tagsClass?: string;
}
