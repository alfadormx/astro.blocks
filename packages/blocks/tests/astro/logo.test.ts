import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Header from '~/components/blocks/composite/Header.astro';
import Footer from '~/components/blocks/composite/Footer.astro';

type Component = Parameters<AstroContainer['renderToString']>[0];

const render = async (component: Component, props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props });
};

const logoLink = /<a[^>]*href="\/"/;

describe('Header logo', () => {
  it('renders the site name as the logo link by default', async () => {
    const html = await render(Header, {});
    expect(html).toMatch(logoLink);
    expect(html).toContain('Fixture');
  });

  it('renders no logo link when logo is false', async () => {
    const html = await render(Header, { logo: false });
    expect(html).not.toMatch(logoLink);
    expect(html).not.toContain('Fixture');
  });

  it('keeps both zones in the row when logo is false', async () => {
    const html = await render(Header, {
      logo: false,
      leftButtons: [{ label: 'Left', href: '/l' }],
      rightButtons: [{ label: 'Right', href: '/r' }],
    });
    const row = html.slice(html.indexOf('data-header-row'));
    expect(row.match(/flex-1 basis-0/g)).toHaveLength(2);
    expect(row.indexOf('Left')).toBeLessThan(row.indexOf('Right'));
  });
});

describe('Footer logo', () => {
  it('renders the site name as the logo link by default', async () => {
    const html = await render(Footer, { footnote: 'f' });
    expect(html).toMatch(logoLink);
    expect(html).toContain('Fixture');
  });

  it('renders no logo and no logo wrapper when logo is false', async () => {
    const html = await render(Footer, { logo: false, footnote: 'f' });
    expect(html).not.toMatch(logoLink);
    expect(html).not.toContain('Fixture');
    expect(html).not.toContain('class="mb-2"');
  });
});
