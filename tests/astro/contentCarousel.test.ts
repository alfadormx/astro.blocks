import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ContentCarousel from '~/components/blocks/composite/ContentCarousel.astro';

const imgStyles = (html: string) =>
  [...html.matchAll(/<img\b[^>]*\sstyle="([^"]*)"/g)].map((m) => m[1]);

describe('ContentCarousel', () => {
  it('local-asset slides keep the 16:9 aspect ratio without a fixed px height', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContentCarousel, {
      props: {
        items: [
          { src: '~/assets/images/demos/portfolio/brand-refresh-1.jpg', alt: 'Brand refresh' },
        ],
      },
    });
    const styles = imgStyles(html);
    expect(styles).toHaveLength(1);
    for (const style of styles) {
      expect(style).not.toMatch(/(^|[;\s])height:\s*\d+(\.\d+)?px/);
      expect(style).toContain(`aspect-ratio: ${16 / 9}`);
    }
  });
});
