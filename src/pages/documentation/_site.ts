import { I18N } from 'site-config';
import { documentationNavigation } from '~/data/documentationNavigation';
import { collectionIndex } from '../../../vendor/integration/collections/pages';
import { assertEntry, orderLinks, staticLinks, trimSlash, type DocLink } from './_nav';
import { sections } from './_sections';

/** Collection entries plus the static pages not yet migrated, in section and page order. */
export async function docLinks(): Promise<DocLink[]> {
  const entries = await collectionIndex('documentation', I18N.default);
  const entryLinks = entries.map((e) => ({
    key: e.key,
    href: trimSlash(e.href),
    title: e.data.title,
    section: assertEntry(e.key, e.data, sections),
    order: e.data.order,
  }));
  const entryHrefs = new Set(entryLinks.map((l) => l.href));
  return orderLinks(
    [...entryLinks, ...staticLinks(documentationNavigation, entryHrefs, sections)],
    sections
  );
}
