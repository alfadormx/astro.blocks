import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { SITE } from 'site-config';
import { describe, expect, it } from 'vitest';
import Layout from '~/layouts/Layout.astro';

const render = async (props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create({ astroConfig: { site: SITE.site } });
  return container.renderToString(Layout, {
    props,
    slots: { default: '<p>Body</p>' },
    request: new Request('http://localhost/'),
  });
};

const htmlTag = (html: string) => html.match(/<html[^>]*>/)?.[0] ?? '';

describe('Layout', () => {
  it('renders data-demo on html when demo is set', async () => {
    expect(htmlTag(await render({ demo: 'saas' }))).toContain('data-demo="saas"');
  });

  it('renders no data-demo attribute when demo is unset', async () => {
    expect(htmlTag(await render())).not.toContain('data-demo');
  });
});

describe('Layout icons', () => {
  const iconLinks = (html: string) =>
    html.match(/<link[^>]*rel="(?:icon|apple-touch-icon|mask-icon)"[^>]*>/g) ?? [];

  it('renders one link per configured icon', async () => {
    const links = iconLinks(await render());

    expect(links).toHaveLength(5);
    for (const href of [
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/safari-pinned-tab.svg',
    ]) {
      expect(links.filter((link) => link.includes(`href="${href}"`))).toHaveLength(1);
    }
  });

  it('keeps sizes on the apple icon and the mask-icon colour', async () => {
    const links = iconLinks(await render());

    expect(links.find((l) => l.includes('apple-touch-icon'))).toContain('sizes="180x180"');
    expect(links.find((l) => l.includes('mask-icon'))).toContain('color="#1e66f5"');
  });

  it("applies a page's metadata.icons override in the single output", async () => {
    const links = iconLinks(await render({ metadata: { icons: { favicon: '/page.ico' } } }));

    expect(links).toHaveLength(5);
    expect(links.filter((l) => l.includes('href="/page.ico"'))).toHaveLength(1);
    expect(links.some((l) => l.includes('href="/favicon.ico"'))).toBe(false);
  });
});

describe('Layout head slot', () => {
  it('renders slot="head" content inside head, after the library tags', async () => {
    const container = await AstroContainer.create({ astroConfig: { site: SITE.site } });
    const html = await container.renderToString(Layout, {
      slots: {
        default: '<p>Body</p>',
        head: '<link rel="preconnect" href="https://fonts.gstatic.com">',
      },
      request: new Request('http://localhost/'),
    });
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
    const preconnect = head.indexOf('rel="preconnect"');

    expect(preconnect).toBeGreaterThan(-1);
    expect(preconnect).toBeGreaterThan(head.lastIndexOf('</script>'));
    expect(preconnect).toBeGreaterThan(head.indexOf('rel="canonical"'));
  });
});
