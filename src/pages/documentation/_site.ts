import { I18N } from 'site-config';
import { collectionIndex } from '../../../vendor/integration/collections/pages';
import { assertEntry, orderLinks, trimSlash, type DocLink } from './_nav';
import { sections } from './_sections';

/** Every docs entry, in section and page order. */
export async function docLinks(): Promise<DocLink[]> {
  const entries = await collectionIndex('documentation', I18N.default);
  return orderLinks(
    entries.map((e) => ({
      key: e.key,
      href: trimSlash(e.href),
      title: e.data.title,
      section: assertEntry(e.key, e.data, sections),
      order: e.data.order,
    })),
    sections
  );
}
