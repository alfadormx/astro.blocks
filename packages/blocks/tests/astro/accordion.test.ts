import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Accordion from '~/components/blocks/primitives/Accordion.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Accordion, { props });
};

describe('Accordion rich text', () => {
  it('renders Markdown emphasis inside an item title', async () => {
    const html = await render({ items: [{ title: 'Is it **free**?', content: 'Yes.' }] });

    expect(html).toMatch(/<span [^>]*>Is it <strong>free<\/strong>\?<\/span>/);
  });
});
