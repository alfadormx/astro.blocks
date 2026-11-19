import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import PostLayout from '~/components/blocks/composite/PostLayout.astro';

const render = async (props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(PostLayout, {
    props: { headline: { title: 'Hello' }, date: new Date('2026-10-01T12:00:00Z'), ...props },
    slots: { default: '<p>Body text</p>' },
  });
};

describe('PostLayout', () => {
  it('renders the title as an h1', async () => {
    expect(await render()).toMatch(/<h1[^>]*>\s*Hello\s*<\/h1>/);
  });

  it('renders the body inside the typography hook', async () => {
    expect(await render()).toMatch(/data-entry-body[^>]*>\s*<p>Body text<\/p>/);
  });

  it('merges bodyClass onto the body wrapper', async () => {
    expect(await render({ bodyClass: 'max-w-none' })).toMatch(
      /<div class="prose max-w-none" data-entry-body>/
    );
  });

  it('renders the date as a machine-readable time', async () => {
    expect(await render()).toContain('<time datetime="2026-10-01T12:00:00.000Z">');
  });

  it('shows updated, author and reading time when set', async () => {
    const html = await render({
      updated: new Date('2026-10-20T12:00:00Z'),
      author: 'Ada',
      readingTime: 3,
    });
    expect(html).toMatch(/Updated\s*<time datetime="2026-10-20/);
    expect(html).toContain('By Ada');
    expect(html).toContain('3 min read');
  });

  it('hides the reading time when false', async () => {
    expect(await render({ readingTime: false })).not.toContain('min read');
  });

  it('formats dates in the layout language', async () => {
    expect(await render({ langCode: 'es', updated: new Date('2026-10-20') })).toContain(
      'Actualizado'
    );
  });
});
