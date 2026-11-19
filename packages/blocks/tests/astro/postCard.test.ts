import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import PostCard from '~/components/blocks/composite/PostCard.astro';

const render = async (props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(PostCard, {
    props: {
      headline: { title: 'Hello' },
      href: '/blog/hello',
      date: new Date('2026-10-01T12:00:00Z'),
      ...props,
    },
  });
};

const anchors = (html: string) => html.match(/<a\b[\s\S]*?<\/a>/g) ?? [];

describe('PostCard', () => {
  it('renders exactly one link, whose text is the title', async () => {
    const links = anchors(await render());
    expect(links).toHaveLength(1);
    expect(links[0]!).toMatch(/href="\/blog\/hello"/);
    expect(links[0]!.replace(/<[^>]+>/g, '').trim()).toBe('Hello');
  });

  it('renders the title as an h3 by default', async () => {
    expect(await render()).toMatch(/<h3[^>]*>\s*<a/);
  });

  it('lets headline.htmlTag change the heading level', async () => {
    expect(await render({ headline: { title: 'Hello', htmlTag: 'h2' } })).toMatch(/<h2[^>]*>\s*<a/);
  });

  it('formats the date in the card language', async () => {
    expect(await render({ langCode: 'es' })).toMatch(/oct/i);
    expect(await render({ langCode: 'en' })).toContain('Oct 1, 2026');
  });

  it('shows the reading time when set', async () => {
    expect(await render({ readingTime: 4 })).toContain('4 min read');
  });

  it('hides the reading time when false', async () => {
    expect(await render({ readingTime: false })).not.toContain('min read');
  });

  it('hides the read-more text from assistive tech', async () => {
    expect(await render()).toMatch(/<span[^>]*aria-hidden="true"[^>]*>\s*Read more/);
  });

  it('uses the Spanish read-more text for es', async () => {
    expect(await render({ langCode: 'es' })).toContain('Leer más');
  });

  it('renders tags as a list', async () => {
    expect(await render({ tags: ['a', 'b'] })).toMatch(
      /<ul[^>]*data-entry-card-tags[^>]*>[\s\S]*<li[^>]*>a<\/li>[\s\S]*<li[^>]*>b<\/li>/
    );
  });
});
