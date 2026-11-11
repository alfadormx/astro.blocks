import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Item from '~/components/blocks/composite/Item.astro';
import Footer from '~/components/blocks/composite/Footer.astro';
import Container from '~/components/blocks/layout/Container.astro';
import Accordion from '~/components/blocks/primitives/Accordion.astro';

type Component = Parameters<AstroContainer['renderToString']>[0];

const render = async (component: Component, props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props });
};

describe('RichText fields', () => {
  it('Item renders Markdown content', async () => {
    expect(await render(Item, { content: 'A **b**' })).toContain('A <strong>b</strong>');
  });

  it('Accordion renders Markdown item content', async () => {
    const html = await render(Accordion, { items: [{ title: 'Q', content: '- one\n- two' }] });
    expect(html).toMatch(/<ul>\s*<li>one<\/li>/);
  });

  it('Footer renders Markdown disclaimer and footnote', async () => {
    const html = await render(Footer, { disclaimer: '_Terms_ apply', footnote: '© **Brand**' });
    expect(html).toContain('<em>Terms</em> apply');
    expect(html).toContain('© <strong>Brand</strong>');
  });

  it('Container renders Markdown item content', async () => {
    const html = await render(Container, { items: [{ content: 'One\n\nTwo' }] });
    expect(html).toContain('<p>One</p>');
    expect(html).toContain('<p>Two</p>');
  });

  it('Item keeps an existing HTML string unchanged', async () => {
    expect(await render(Item, { content: '<p class="x">Hi</p>' })).toContain('<p class="x">Hi</p>');
  });
});
