import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import MapBlock from '~/components/blocks/primitives/Map.astro';

const render = async (props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(MapBlock, { props });

describe('Map', () => {
  it('renders the config hook, label and OSM links without JS', async () => {
    const html = await render({ lat: 40.42, lon: -3.7, title: 'Café Olmo' });
    expect(html).toContain('data-map-config');
    expect(html).toContain('aria-label="Café Olmo"');
    expect(html).toContain('https://www.openstreetmap.org/?mlat=40.42&amp;mlon=-3.7');
  });

  it('is never ready on the server', async () => {
    expect(await render({ lat: 1, lon: 2 })).not.toContain('data-map-ready');
  });

  it('keeps the spaces in the attribution', async () => {
    expect(await render({ lat: 1, lon: 2 })).toMatch(
      /&copy;\s<a[^>]*>OpenStreetMap<\/a> contributors &mdash;\s<a[^>]*>View larger map &rarr;<\/a>/
    );
  });
});
