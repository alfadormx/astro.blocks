import { describe, expect, it } from 'vitest';
import {
  assertNoReservedSlug,
  entryAlternates,
  entryUrl,
  filterDrafts,
  isPast,
  linkEntries,
  listAlternates,
  listUrl,
  paginate,
  parseEntryId,
  sortEntries,
  type RawEntry,
} from '../../vendor/integration/collections/paths';

const entry = (id: string, data: Partial<RawEntry['data']> = {}): RawEntry => ({
  id,
  data: { title: id, draft: false, ...data },
});

const langs = [
  { code: 'en', basePath: '/' },
  { code: 'es', basePath: '/es' },
];

describe('parseEntryId', () => {
  it('splits a language folder from the key', () => {
    expect(parseEntryId('es/hello-world', 'multi', 'en')).toEqual({
      lang: 'es',
      key: 'hello-world',
    });
  });

  it('gives single-language ids the default language', () => {
    expect(parseEntryId('hello-world', 'single', 'en')).toEqual({ lang: 'en', key: 'hello-world' });
  });
});

describe('linkEntries', () => {
  const linked = linkEntries(
    [entry('en/hello'), entry('es/hello', { slug: 'hola' }), entry('en/only-en')],
    'en'
  );

  it('links translations by filename', () => {
    expect(linked.filter((l) => l.key === 'hello').map((l) => l.langCode)).toEqual(['en', 'es']);
  });

  it('uses the front-matter slug, else the key', () => {
    expect(linked.map((l) => l.slug)).toEqual(['hello', 'hola', 'only-en']);
  });

  it('leaves an untranslated entry out of the other language', () => {
    expect(linked.filter((l) => l.langCode === 'es').map((l) => l.key)).toEqual(['hello']);
  });

  it('treats a collection without language folders as the default language', () => {
    expect(linkEntries([entry('a'), entry('b')], 'en').map((l) => l.langCode)).toEqual([
      'en',
      'en',
    ]);
  });
});

describe('filterDrafts', () => {
  const entries = [entry('en/a'), entry('en/b', { draft: true })];

  it('drops drafts in production', () => {
    expect(filterDrafts(entries, true).map((e) => e.id)).toEqual(['en/a']);
  });

  it('keeps drafts in development', () => {
    expect(filterDrafts(entries, false)).toHaveLength(2);
  });
});

describe('sortEntries', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  const sorted = (entries: RawEntry[], sort: Parameters<typeof sortEntries>[1]) =>
    sortEntries(linkEntries(entries, 'en'), sort, now).map((l) => l.key);

  it('orders date-desc newest first', () => {
    expect(
      sorted(
        [
          entry('en/old', { date: new Date('2026-01-01') }),
          entry('en/new', { date: new Date('2026-03-01') }),
        ],
        'date-desc'
      )
    ).toEqual(['new', 'old']);
  });

  it('orders title-asc alphabetically', () => {
    expect(
      sorted([entry('en/b', { title: 'B' }), entry('en/a', { title: 'A' })], 'title-asc')
    ).toEqual(['a', 'b']);
  });

  it('orders start-asc upcoming by start ascending, then past by start descending', () => {
    expect(
      sorted(
        [
          entry('en/past-old', { start: new Date('2026-01-01') }),
          entry('en/later', { start: new Date('2026-09-01') }),
          entry('en/past-recent', { start: new Date('2026-05-01') }),
          entry('en/soon', { start: new Date('2026-07-01') }),
        ],
        'start-asc'
      )
    ).toEqual(['soon', 'later', 'past-recent', 'past-old']);
  });

  it('keeps an event that started but has not ended among the upcoming', () => {
    expect(
      sorted(
        [
          entry('en/next', { start: new Date('2026-07-01') }),
          entry('en/running', { start: new Date('2026-05-30'), end: new Date('2026-06-02') }),
        ],
        'start-asc'
      )
    ).toEqual(['running', 'next']);
  });
});

describe('isPast', () => {
  const now = new Date('2026-06-01T12:00:00Z');

  it('uses the end when set', () => {
    expect(
      isPast(entry('a', { start: new Date('2026-05-01'), end: new Date('2026-06-02') }), now)
    ).toBe(false);
  });

  it('uses the start without an end', () => {
    expect(isPast(entry('a', { start: new Date('2026-05-01') }), now)).toBe(true);
  });
});

describe('entryUrl', () => {
  it('prefixes the language base path', () => {
    expect(entryUrl('/es', '/blog', 'hola', false)).toBe('/es/blog/hola');
  });

  it('adds no prefix for the root language', () => {
    expect(entryUrl('/', '/blog', 'hello', false)).toBe('/blog/hello');
  });

  it('appends a trailing slash when the site uses them', () => {
    expect(entryUrl('/', '/blog', 'hello', true)).toBe('/blog/hello/');
  });
});

describe('paginate', () => {
  const pages = paginate([1, 2, 3, 4, 5], 2, (n) => listUrl('/', '/blog', n, false));

  it('splits items by page size', () => {
    expect(pages.map((p) => p.items)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('serves page 1 at the route and never emits page/1', () => {
    expect(pages.map((p) => p.param)).toEqual([undefined, 'page/2', 'page/3']);
    expect(pages[0].page.url.current).toBe('/blog');
  });

  it('links prev and next only where they exist', () => {
    expect(pages[0].page.url).toMatchObject({ prev: undefined, next: '/blog/page/2' });
    expect(pages[2].page.url).toMatchObject({ prev: '/blog/page/2', next: undefined });
  });

  it('puts everything on one page without a page size', () => {
    expect(paginate([1, 2, 3], undefined, String)).toHaveLength(1);
  });

  it('emits no pages for no items', () => {
    expect(paginate([], 2, String)).toEqual([]);
  });
});

describe('assertNoReservedSlug', () => {
  it('names the collection in the reserved-slug error', () => {
    expect(() => assertNoReservedSlug(linkEntries([entry('en/page')], 'en'), 'posts')).toThrow(
      'slug `page` is reserved in collection `posts`'
    );
  });
});

describe('entryAlternates', () => {
  const linked = linkEntries(
    [entry('en/hello'), entry('es/hello', { slug: 'hola' }), entry('en/only-en')],
    'en'
  );

  it('links each translation to its own slug', () => {
    expect(entryAlternates('hello', linked, langs, '/blog', false).toggle).toEqual({
      en: '/blog/hello',
      es: '/es/blog/hola',
    });
  });

  it('sends the toggle for a missing translation to that language list, and leaves it out of hreflang', () => {
    const { toggle, hreflang } = entryAlternates('only-en', linked, langs, '/blog', false);
    expect(toggle.es).toBe('/es/blog');
    expect(hreflang).toEqual({ en: '/blog/only-en' });
  });
});

describe('listAlternates', () => {
  it('falls back to page 1 where the other language has fewer pages', () => {
    expect(listAlternates(3, { en: 3, es: 2 }, langs, '/blog', false).toggle).toEqual({
      en: '/blog/page/3',
      es: '/es/blog',
    });
  });

  it('keeps the page number where it exists', () => {
    expect(listAlternates(2, { en: 3, es: 2 }, langs, '/blog', false).hreflang.es).toBe(
      '/es/blog/page/2'
    );
  });

  it('links a language without entries to its home and leaves it out of hreflang', () => {
    const { toggle, hreflang } = listAlternates(1, { en: 1 }, langs, '/blog', false);
    expect(toggle.es).toBe('/es');
    expect(hreflang.es).toBeUndefined();
  });
});
