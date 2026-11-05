import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { SITE } from 'site-config';
import { describe, expect, it } from 'vitest';
import Metadata from '~/components/meta/Metadata.astro';
import SiteVerification from '~/components/meta/SiteVerification.astro';

type Component = Parameters<AstroContainer['renderToString']>[0];

const render = async (component: Component, path = '/', props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create({ astroConfig: { site: SITE.site } });
  return container.renderToString(component, {
    props,
    request: new Request(`http://localhost${path}`),
  });
};

const canonicalOf = (html: string) =>
  html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ??
  html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/)?.[1];
const ogUrlOf = (html: string) =>
  html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]+)"/)?.[1] ??
  html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:url"/)?.[1];

describe('SiteVerification', () => {
  it('renders nothing when no verification id is configured', async () => {
    expect((await render(SiteVerification)).trim()).toBe('');
  });
});

describe('Metadata', () => {
  it('contains no placeholder verification id or twitter handle', async () => {
    const html = await render(Metadata);
    expect(html).not.toContain('some-verification-id');
    expect(html).not.toContain('@yourhandle');
  });

  it('emits the configured author and no placeholder author', async () => {
    const html = await render(Metadata);
    expect(html).toMatch(
      /<meta[^>]*name="author"[^>]*content="alFadorMX"|<meta[^>]*content="alFadorMX"[^>]*name="author"/
    );
    expect(html).not.toContain('Your Name');
  });

  it.each(['/documentation/primitives/button', '/demos/jewellery-configurator'])(
    'derives the canonical from the request path %s',
    async (path) => {
      const canonical = canonicalOf(await render(Metadata, path));
      expect(canonical).toBeDefined();
      expect(new URL(canonical!).pathname).toBe(path);
    }
  );

  it('drops the trailing slash from a non-root canonical', async () => {
    const canonical = canonicalOf(await render(Metadata, '/documentation/'));
    expect(new URL(canonical!).pathname).toBe('/documentation');
  });

  it('sets og:url to the derived canonical', async () => {
    const html = await render(Metadata, '/documentation/primitives/button');
    expect(ogUrlOf(html)).toBe(canonicalOf(html));
  });

  it('prefers an explicit canonical prop over the derived one', async () => {
    const explicit = 'https://astrocomponents.dev/es';
    const html = await render(Metadata, '/documentation', { canonical: explicit });
    expect(canonicalOf(html)).toBe(explicit);
    expect(ogUrlOf(html)).toBe(explicit);
  });
});
