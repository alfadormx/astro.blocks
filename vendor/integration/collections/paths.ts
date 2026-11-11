import type { CollectionSort } from '../utils/configBuilder';

export interface RawEntryData {
  title: string;
  slug?: string;
  draft: boolean;
  date?: Date;
  start?: Date;
  end?: Date;
}

export interface RawEntry {
  id: string;
  data: RawEntryData;
}

export interface LinkedEntry<E extends RawEntry = RawEntry> {
  /** Filename without language folder or extension; shared by an entry's translations. */
  key: string;
  langCode: string;
  slug: string;
  entry: E;
}

export interface Lang {
  code: string;
  basePath: string;
}

export interface ListPage {
  currentPage: number;
  lastPage: number;
  url: { current: string; prev?: string; next?: string; first: string; last: string };
}

export interface Alternates {
  /** Where the language toggle sends each language. */
  toggle: Record<string, string>;
  /** Languages that really have this page, for `<link rel="alternate" hreflang>`. */
  hreflang: Record<string, string>;
}

export type LanguageLayout = 'multi' | 'single';

/** Any id with a language folder (`en/hello`) makes the collection multi-language. */
export function layoutOf(entries: RawEntry[]): LanguageLayout {
  return entries.some((e) => e.id.includes('/')) ? 'multi' : 'single';
}

/** `en/hello` → { lang: 'en', key: 'hello' }; single-language ids use `defaultLang`. */
export function parseEntryId(
  id: string,
  layout: LanguageLayout,
  defaultLang: string
): { lang: string; key: string } {
  if (layout === 'single') return { lang: defaultLang, key: id };
  const slash = id.indexOf('/');
  return { lang: id.slice(0, slash), key: id.slice(slash + 1) };
}

export function linkEntries<E extends RawEntry>(
  entries: E[],
  defaultLang: string
): LinkedEntry<E>[] {
  const layout = layoutOf(entries);
  return entries.map((entry) => {
    const { lang, key } = parseEntryId(entry.id, layout, defaultLang);
    return { key, langCode: lang, slug: entry.data.slug ?? key, entry };
  });
}

export function filterDrafts<E extends RawEntry>(entries: E[], prod: boolean): E[] {
  return prod ? entries.filter((e) => !e.data.draft) : entries;
}

const time = (d: Date | undefined) => d?.getTime() ?? 0;

/** An event is past once its end (or start, without an end) is before `now`. */
export function isPast(entry: RawEntry, now: Date): boolean {
  return time(entry.data.end ?? entry.data.start) < now.getTime();
}

export function sortEntries<E extends RawEntry>(
  entries: LinkedEntry<E>[],
  sort: CollectionSort,
  now: Date
): LinkedEntry<E>[] {
  const list = [...entries];
  const by = (f: (a: E, b: E) => number) => list.sort((a, b) => f(a.entry, b.entry));
  switch (sort) {
    case 'date-desc':
      return by((a, b) => time(b.data.date) - time(a.data.date));
    case 'date-asc':
      return by((a, b) => time(a.data.date) - time(b.data.date));
    case 'title-asc':
      return by((a, b) => a.data.title.localeCompare(b.data.title));
    case 'start-asc': {
      const upcoming = list.filter((l) => !isPast(l.entry, now));
      const past = list.filter((l) => isPast(l.entry, now));
      upcoming.sort((a, b) => time(a.entry.data.start) - time(b.entry.data.start));
      past.sort((a, b) => time(b.entry.data.start) - time(a.entry.data.start));
      return [...upcoming, ...past];
    }
  }
}

export function withTrailingSlash(path: string, trailingSlash: boolean): string {
  if (trailingSlash) return path.endsWith('/') ? path : `${path}/`;
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

const langPrefix = (basePath: string) => (basePath === '/' ? '' : basePath.replace(/\/$/, ''));

export function entryUrl(
  langBasePath: string,
  route: string,
  slug: string,
  trailingSlash: boolean
): string {
  return withTrailingSlash(`${langPrefix(langBasePath)}${route}/${slug}`, trailingSlash);
}

/** Page 1 is the route itself; later pages are `<route>/page/<n>`. */
export function listUrl(
  langBasePath: string,
  route: string,
  page: number,
  trailingSlash: boolean
): string {
  const base = `${langPrefix(langBasePath)}${route}`;
  return withTrailingSlash(page > 1 ? `${base}/page/${page}` : base || '/', trailingSlash);
}

/** `pageSize` unset puts everything on one page; page 1 has no `page/1` param. */
export function paginate<T>(
  items: T[],
  pageSize: number | undefined,
  pageUrl: (page: number) => string
): { param: string | undefined; items: T[]; page: ListPage }[] {
  if (items.length === 0) return [];
  const size = pageSize && pageSize > 0 ? pageSize : items.length;
  const lastPage = Math.ceil(items.length / size);
  return Array.from({ length: lastPage }, (_, i) => {
    const n = i + 1;
    return {
      param: n === 1 ? undefined : `page/${n}`,
      items: items.slice(i * size, n * size),
      page: {
        currentPage: n,
        lastPage,
        url: {
          current: pageUrl(n),
          prev: n > 1 ? pageUrl(n - 1) : undefined,
          next: n < lastPage ? pageUrl(n + 1) : undefined,
          first: pageUrl(1),
          last: pageUrl(lastPage),
        },
      },
    };
  });
}

export function assertNoReservedSlug(linked: LinkedEntry[], collection: string): void {
  if (linked.some((l) => l.slug === 'page')) {
    throw new Error(`slug \`page\` is reserved in collection \`${collection}\``);
  }
}

/** Toggle: each translation's URL, else that language's list. hreflang: translations only. */
export function entryAlternates(
  key: string,
  linked: LinkedEntry[],
  langs: Lang[],
  route: string,
  trailingSlash: boolean
): Alternates {
  const toggle: Record<string, string> = {};
  const hreflang: Record<string, string> = {};
  for (const lang of langs) {
    const translation = linked.find((l) => l.key === key && l.langCode === lang.code);
    if (translation) {
      toggle[lang.code] = hreflang[lang.code] = entryUrl(
        lang.basePath,
        route,
        translation.slug,
        trailingSlash
      );
    } else {
      toggle[lang.code] = listUrl(lang.basePath, route, 1, trailingSlash);
    }
  }
  return { toggle, hreflang };
}

/** Same page number where that language has it, else page 1; a language with no list links home. */
export function listAlternates(
  pageNumber: number,
  lastPageByLang: Record<string, number>,
  langs: Lang[],
  route: string,
  trailingSlash: boolean
): Alternates {
  const toggle: Record<string, string> = {};
  const hreflang: Record<string, string> = {};
  for (const lang of langs) {
    const last = lastPageByLang[lang.code];
    if (!last) {
      toggle[lang.code] = withTrailingSlash(lang.basePath, trailingSlash);
      continue;
    }
    const page = pageNumber <= last ? pageNumber : 1;
    toggle[lang.code] = hreflang[lang.code] = listUrl(lang.basePath, route, page, trailingSlash);
  }
  return { toggle, hreflang };
}
