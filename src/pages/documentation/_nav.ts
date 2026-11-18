import type { NavigationTreeItem } from '~/types/navigationtree.types';
import type { Section, SectionKey } from './_sections';

export interface DocLink {
  key: string;
  href: string;
  title: string;
  section: SectionKey;
  order: number;
}

export const DOCS_HOME = '/documentation';

export const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path);

const indexOf = (sections: readonly Section[], key: string) =>
  sections.findIndex((s) => s.key === key);

/** Section order, then `order`, then title; links in unknown sections are dropped. */
export function orderLinks(links: DocLink[], sections: readonly Section[]): DocLink[] {
  return links
    .filter((l) => indexOf(sections, l.section) !== -1)
    .sort(
      (a, b) =>
        indexOf(sections, a.section) - indexOf(sections, b.section) ||
        a.order - b.order ||
        a.title.localeCompare(b.title)
    );
}

/** The entry's section; throws, naming the entry, on an unknown section, a mismatched folder or a `slug`. */
export function assertEntry(
  key: string,
  data: { section: string; slug?: string },
  sections: readonly Section[]
): SectionKey {
  const folder = key.split('/')[0];
  const section = sections.find((s) => s.key === data.section);
  if (!section) throw new Error(`Docs entry "${key}" has unknown section "${data.section}"`);
  if (folder !== data.section) {
    throw new Error(`Docs entry "${key}" sets section "${data.section}" but lives in "${folder}/"`);
  }
  if (data.slug !== undefined) {
    throw new Error(`Docs entry "${key}" sets slug; a docs URL is its file path`);
  }
  return section.key;
}

export function currentSection(links: DocLink[], currentPath: string): SectionKey | undefined {
  const path = trimSlash(currentPath);
  return links.find((l) => trimSlash(l.href) === path)?.section;
}

const asItem = (l: DocLink): NavigationTreeItem => ({ label: l.title, href: l.href });

/** Every link, grouped under its non-empty section's label. */
export function fullTree(links: DocLink[], sections: readonly Section[]): NavigationTreeItem[] {
  return sections.flatMap(({ key, label }) => {
    const children = links.filter((l) => l.section === key).map(asItem);
    return children.length ? [{ label, children }] : [];
  });
}

/** Adjacent links in the flat, ordered list, so they cross section boundaries. */
export function neighbours(
  links: DocLink[],
  currentPath: string
): { previous?: DocLink; next?: DocLink } {
  const path = trimSlash(currentPath);
  const i = links.findIndex((l) => trimSlash(l.href) === path);
  if (i === -1) return {};
  return { previous: links[i - 1], next: links[i + 1] };
}
