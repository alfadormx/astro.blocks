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
