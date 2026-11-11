import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CollectionList from '~/components/blocks/composite/CollectionList.astro';

const post = (title: string, extra: Record<string, unknown> = {}) => ({
  preset: 'post',
  headline: { title },
  href: `/blog/${title.toLowerCase()}`,
  date: new Date('2026-10-01T12:00:00Z'),
  ...extra,
});

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(CollectionList, { props });
};

const cards = (html: string) => html.match(/<article[\s\S]*?<\/article>/g) ?? [];

describe('CollectionList', () => {
  it('renders one card per entry, in order', async () => {
    const html = await render({ entries: [post('One'), post('Two')] });
    expect(cards(html)).toHaveLength(2);
    expect(html.indexOf('One')).toBeLessThan(html.indexOf('Two'));
  });

  it('stacks cards in one column when vertical', async () => {
    const html = await render({ entries: [post('One')], orientation: 'vertical', columns: 3 });
    expect(html).toMatch(/<ul class="[^"]*grid-cols-1[^"]*"/);
    expect(html).not.toContain('@3xl:grid-cols-3');
  });

  it('merges defaultPostCardConfig under every card', async () => {
    const html = await render({
      entries: [post('One'), post('Two')],
      defaultPostCardConfig: { readMoreLabel: 'Continue' },
    });
    expect(html.match(/Continue/g)).toHaveLength(2);
  });

  it('lets an entry override defaultPostCardConfig', async () => {
    const html = await render({
      entries: [post('One', { readMoreLabel: 'Mine' }), post('Two')],
      defaultPostCardConfig: { readMoreLabel: 'Continue' },
    });
    expect(html).toContain('Mine');
    expect(html.match(/Continue/g)).toHaveLength(1);
  });

  it('renders no pager for a single page', async () => {
    const html = await render({
      entries: [post('One')],
      page: { currentPage: 1, lastPage: 1, url: {} },
    });
    expect(html).not.toContain('data-collection-pager');
  });

  it('renders only the pager directions that exist', async () => {
    const html = await render({
      entries: [post('One')],
      page: { currentPage: 1, lastPage: 2, url: { next: '/blog/page/2' } },
    });
    expect(html).toMatch(/<nav[^>]*aria-label="Pagination"/);
    expect(html).toContain('href="/blog/page/2"');
    expect(html).not.toContain('data-collection-pager-prev');
    expect(html).toContain('Page 1 of 2');
  });

  it('localises the pager and replaces the status placeholders', async () => {
    const html = await render({
      entries: [post('One')],
      langCode: 'es',
      page: { currentPage: 2, lastPage: 3, url: { prev: '/es/blog', next: '/es/blog/page/3' } },
      pageStatusLabel: '{current}/{last}',
    });
    expect(html).toContain('Anterior');
    expect(html).toContain('Siguiente');
    expect(html).toContain('2/3');
  });

  it('hides a pager button set to false', async () => {
    const html = await render({
      entries: [post('One')],
      page: { currentPage: 2, lastPage: 3, url: { prev: '/blog', next: '/blog/page/3' } },
      prevButton: false,
    });
    expect(html).not.toContain('data-collection-pager-prev');
    expect(html).toContain('data-collection-pager-next');
  });
});
