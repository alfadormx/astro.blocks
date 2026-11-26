import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Footer from '~/components/blocks/composite/Footer.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Footer, { props });
};

const classOfBlockHolding = (html: string, text: string) =>
  html.match(new RegExp(`<div class="([^"]*)">\\s*(?:<p>)?${text}`))?.[1];

describe('Footer footnote and disclaimer defaults', () => {
  it('colours the footnote and disclaimer with the muted token', async () => {
    const html = await render({ footnote: 'Footnote', disclaimer: 'Disclaimer' });

    expect(html).not.toContain('text-subtle');
    expect(classOfBlockHolding(html, 'Footnote')).toBe('text-sm text-muted');
    expect(classOfBlockHolding(html, 'Disclaimer')).toBe('text-xs text-muted');
  });

  it('gives the footnote no outer margin, so a border-t spans its width', async () => {
    const html = await render({ footnote: 'Footnote', footnoteClass: 'border-t' });

    expect(classOfBlockHolding(html, 'Footnote')).toBe('text-sm text-muted border-t');
  });
});
