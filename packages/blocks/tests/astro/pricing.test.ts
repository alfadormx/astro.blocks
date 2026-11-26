import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Pricing from '~/components/blocks/composite/Pricing.astro';

const render = async (description: string) => {
  const container = await AstroContainer.create();
  return container.renderToString(Pricing, {
    props: {
      tiers: [
        {
          name: 'Team',
          description,
          price: { monthly: 10 },
          features: ['One'],
          action: { label: 'Buy', href: '#' },
        },
      ],
    },
  });
};

describe('Pricing rich text', () => {
  it('renders Markdown emphasis inside a tier description', async () => {
    const html = await render('**Best** for teams');

    expect(html).toMatch(/<p class="[^"]*">\s*<strong>Best<\/strong> for teams\s*<\/p>/);
  });
});
