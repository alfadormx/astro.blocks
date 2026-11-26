import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Headline from '~/components/blocks/primitives/Headline.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Headline, { props });
};

describe('Headline rich text', () => {
  it('renders Markdown emphasis inside the title', async () => {
    const html = await render({ title: 'Built for **speed**' });

    expect(html).toMatch(/<h2 [^>]*>Built for <strong>speed<\/strong><\/h2>/);
  });

  it('renders a Markdown link inside the subtitle paragraph', async () => {
    const html = await render({ title: 'Title', subtitle: 'See [the docs](/docs).' });

    expect(html).toMatch(/<p [^>]*data-subtitle>See <a href="\/docs">the docs<\/a>\.<\/p>/);
  });

  it('keeps a multi-paragraph subtitle inside one paragraph', async () => {
    const html = await render({ title: 'Title', subtitle: 'One\n\nTwo' });

    expect(html).not.toMatch(/data-subtitle>\s*<p>/);
  });

  it('escapes HTML-significant characters in a plain title', async () => {
    const html = await render({ title: `Tom & Jerry's "best" day` });

    expect(html).toMatch(/<h2 [^>]*>Tom &amp; Jerry&#39;s &quot;best&quot; day<\/h2>/);
  });

  it('lets the title slot replace the title text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Headline, {
      props: { title: 'Prop' },
      slots: { title: 'Slot' },
    });

    expect(html).toMatch(/<h2 [^>]*>Slot<\/h2>/);
  });
});
