import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CallToAction from '~/components/blocks/composite/CallToAction.astro';

const CARD_CLASSES = ['bg-elevated', 'rounded-md', 'shadow-xl', 'overflow-hidden'];
const BOX_WIDTH = 'max-w-xl';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(CallToAction, { props });
};

describe('CallToAction surface', () => {
  it('renders the card by default', async () => {
    const html = await render({ headline: { title: 'Go' } });
    for (const cls of CARD_CLASSES) expect(html).toContain(cls);
    expect(html).toContain(BOX_WIDTH);
  });

  it('drops the card classes but keeps the box width with surface plain', async () => {
    const html = await render({ surface: 'plain', headline: { title: 'Go' } });
    for (const cls of CARD_CLASSES) expect(html).not.toContain(cls);
    expect(html).toContain(BOX_WIDTH);
  });
});
