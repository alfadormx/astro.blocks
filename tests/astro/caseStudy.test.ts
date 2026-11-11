import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CaseStudyCard from '~/components/blocks/composite/CaseStudyCard.astro';
import CaseStudyLayout from '~/components/blocks/composite/CaseStudyLayout.astro';

type Component = Parameters<AstroContainer['renderToString']>[0];

const render = async (component: Component, props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props, slots: { default: '<p>Body</p>' } });
};

const layout = (props: Record<string, unknown> = {}) =>
  render(CaseStudyLayout, {
    headline: { title: 'Case' },
    client: 'Acme',
    date: new Date('2026-06-10T12:00:00Z'),
    ...props,
  });

describe('CaseStudyCard', () => {
  it('shows the client above a single title link', async () => {
    const html = await render(CaseStudyCard, {
      client: 'Acme',
      headline: { title: 'Case' },
      href: '/work/case',
    });
    expect(html).toMatch(/data-entry-card-eyebrow[^>]*>\s*Acme/);
    expect(html.match(/<a\b/g)).toHaveLength(1);
  });
});

describe('CaseStudyLayout', () => {
  it('renders results as a description list, value over label', async () => {
    const html = await layout({ results: [{ label: 'Conversion', value: '+38%' }] });
    expect(html).toMatch(/<dl[^>]*data-case-study-results/);
    expect(html).toMatch(/<dt[^>]*>Conversion<\/dt>\s*<dd[^>]*>\+38%<\/dd>/);
  });

  it('renders a map only when the location has both coordinates', async () => {
    expect(await layout({ location: { name: 'Here', lat: 1, lon: 2 } })).toContain(
      'data-map-config'
    );
    expect(await layout({ location: { name: 'Here', lat: 1 } })).not.toContain('data-map-config');
    expect(await layout({ location: { name: 'Remote' } })).not.toContain('data-map-config');
  });

  it('hides the map when map is false', async () => {
    expect(await layout({ location: { name: 'Here', lat: 1, lon: 2 }, map: false })).not.toContain(
      'data-map-config'
    );
  });

  it('defaults the map zoom to the location zoom and merges the map prop over it', async () => {
    const html = await layout({ location: { name: 'Here', lat: 1, lon: 2, zoom: 9 } });
    expect(html).toContain('&quot;zoom&quot;:9');
    expect(
      await layout({ location: { name: 'Here', lat: 1, lon: 2 }, map: { zoom: 5 } })
    ).toContain('&quot;zoom&quot;:5');
  });
});
