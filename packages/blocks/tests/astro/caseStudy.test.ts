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

const imgStyles = (html: string) =>
  [...html.matchAll(/<img\b[^>]*\sstyle="([^"]*)"/g)].map((m) => m[1]);

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
  const gallery = [
    { src: 'https://images.unsplash.com/photo-1?w=10', alt: 'A', width: 800, height: 450 },
    { src: 'https://images.unsplash.com/photo-2?w=10', alt: 'B', width: 800, height: 450 },
  ];

  it('crops local gallery images to 16:9 without a fixed px height', async () => {
    const html = await layout({
      gallery: [
        { src: '~/assets/images/hero.jpg', alt: 'A' },
        { src: '~/assets/images/hero.jpg', alt: 'B' },
      ],
    });
    const styles = imgStyles(html);
    expect(styles).toHaveLength(2);
    for (const style of styles) {
      expect(style).not.toMatch(/(^|[;\s])height:\s*\d+(\.\d+)?px/);
      expect(style).toContain(`aspect-ratio: ${16 / 9}`);
    }
  });

  it('renders the gallery as a carousel labelled in the layout language', async () => {
    expect(await layout({ gallery })).toMatch(/data-carousel[\s\S]*?aria-label="Project gallery"/);
    expect(await layout({ gallery, langCode: 'es' })).toContain(
      'aria-label="Galería del proyecto"'
    );
  });

  it('renders no carousel when the gallery is empty or absent', async () => {
    expect(await layout({ gallery: [] })).not.toContain('data-carousel');
    expect(await layout()).not.toContain('data-carousel');
  });

  it('places the gallery after the body and before the map', async () => {
    const html = await layout({ gallery, location: { name: 'Here', lat: 1, lon: 2 } });
    const body = html.indexOf('data-entry-body');
    const carousel = html.indexOf('data-case-study-gallery');
    const map = html.indexOf('data-entry-map');
    expect(body).toBeLessThan(carousel);
    expect(carousel).toBeLessThan(map);
  });

  it('lets contentCarousel override the gallery label', async () => {
    expect(await layout({ gallery, contentCarousel: { ariaLabel: 'Shots' } })).toContain(
      'aria-label="Shots"'
    );
  });

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
