import { describe, expect, it } from 'vitest';
import { collectionsWithoutEntryPages } from '../../vendor/integration/collections/routes';

const config = {
  entries: {
    posts: { preset: 'post' as const, route: '/demos/blog', path: 'x', sort: 'date-desc' as const },
    notes: { preset: 'post' as const, path: 'y', sort: 'date-desc' as const },
  },
};

describe('collectionsWithoutEntryPages', () => {
  it('passes a collection whose entry page was built', () => {
    expect(
      collectionsWithoutEntryPages(config, ['/', '/es'], ['demos/blog/', 'demos/blog/hello/'])
    ).toEqual([]);
  });

  it('counts an entry built only in another language', () => {
    expect(collectionsWithoutEntryPages(config, ['/', '/es'], ['es/demos/blog/hola/'])).toEqual([]);
  });

  it('flags a route with only list pages built', () => {
    expect(
      collectionsWithoutEntryPages(config, ['/', '/es'], ['demos/blog/', 'demos/blog/page/2/'])
    ).toEqual([['posts', '/demos/blog']]);
  });

  it('skips collections without a route', () => {
    expect(collectionsWithoutEntryPages(config, ['/'], []).map(([name]) => name)).toEqual([
      'posts',
    ]);
  });
});

describe('getCollections', () => {
  it('rejects an unknown preset by name', async () => {
    const { getCollections } = await import('../../vendor/integration/utils/configBuilder');
    expect(() => getCollections({ collections: { posts: { preset: 'posst' as never } } })).toThrow(
      'Collection "posts" has unknown preset "posst"'
    );
  });

  it('resolves path and sort defaults', async () => {
    const { getCollections } = await import('../../vendor/integration/utils/configBuilder');
    expect(
      getCollections({ collections: { timezone: 'UTC', events: { preset: 'event' } } })
    ).toEqual({
      timezone: 'UTC',
      entries: {
        events: {
          preset: 'event',
          path: 'src/content/events',
          sort: 'start-asc',
          route: undefined,
          pageSize: undefined,
        },
      },
    });
  });
});
