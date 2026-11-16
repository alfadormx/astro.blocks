import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import NavigationTreeHorizontal from '~/components/blocks/composite/NavigationTreeHorizontal.astro';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products', children: [{ label: 'One', href: '/products/1' }] },
  { label: 'Pricing', href: '/#pricing' },
];

const render = async (path: string, props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(NavigationTreeHorizontal, {
    props: { items, ...props },
    request: new Request(`http://localhost${path}`),
  });
};

const current = (html: string) => html.match(/<[a-z]+\b[^>]*aria-current="page"[^>]*>/g) ?? [];

describe('NavigationTreeHorizontal current page', () => {
  it('marks a matching dropdown child and not its parent', async () => {
    const tags = current(await render('/products/1'));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatch(/^<a\b[^>]*href="\/products\/1"/);
  });

  it('never marks a hash link', async () => {
    const tags = current(await render('/'));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatch(/href="\/"/);
  });

  it('marks a hover-mode parent link but not a click-mode parent button', async () => {
    expect(current(await render('/products'))[0]).toMatch(/href="\/products"/);
    expect(current(await render('/products', { trigger: 'click' }))).toHaveLength(0);
  });

  it('prefers an explicit currentPath over the URL', async () => {
    const tags = current(await render('/', { currentPath: '/products/1' }));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatch(/href="\/products\/1"/);
  });

  it('applies activeItemConfig to the current item and inactiveItemConfig to the rest', async () => {
    const html = await render('/', {
      activeItemConfig: { class: 'is-current' },
      inactiveItemConfig: { class: 'is-other' },
    });
    expect(html.match(/is-current/g)).toHaveLength(1);
    expect(current(html)[0]).toMatch(/is-current/);
    expect(html.match(/is-other/g)).toHaveLength(3);
  });
});
