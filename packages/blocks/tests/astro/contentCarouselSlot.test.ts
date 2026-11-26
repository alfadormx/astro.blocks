import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SlottedIconCarousel from './fixtures/slottedIconCarousel.astro';

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(SlottedIconCarousel);
};

describe('ContentCarousel with slotted slides', () => {
  it('emits the icon sprite symbol that every slotted slide icon references', async () => {
    const html = await render();
    expect(html.match(/<symbol id="ai:mdi:format-quote-open"/g)).toHaveLength(1);
    expect(html.match(/href="#ai:mdi:format-quote-open"/g)).toHaveLength(3);
  });

  it('renders one indicator per slotted slide', async () => {
    const html = await render();
    expect(html.match(/data-carousel-indicator="true"/g)).toHaveLength(3);
  });
});
