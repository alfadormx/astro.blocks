import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Testimonials from '~/components/blocks/composite/Testimonials.astro';

const render = async (quote: string) => {
  const container = await AstroContainer.create();
  return container.renderToString(Testimonials, {
    props: { testimonials: [{ quote, author: { name: 'Ada' } }] },
  });
};

const blockquote = (html: string) => html.match(/<blockquote[\s\S]*?<\/blockquote>/)?.[0] ?? '';

describe('Testimonials rich text', () => {
  it('renders Markdown emphasis inside the quote', async () => {
    const quote = blockquote(await render('It was **great**.'));

    expect(quote).toContain('<p>It was <strong>great</strong>.</p>');
  });

  it('keeps one paragraph per blank-line-separated part of the quote', async () => {
    const quote = blockquote(await render('First.\n\nSecond.'));

    expect(quote.match(/<p>/g)).toHaveLength(2);
  });

  it('escapes HTML-significant characters in a plain quote', async () => {
    const quote = blockquote(await render(`Tom & Jerry's "best" day`));

    expect(quote).toContain('<p>Tom &amp; Jerry&#39;s &quot;best&quot; day</p>');
  });
});
