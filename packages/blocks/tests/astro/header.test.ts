import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Header from '~/components/blocks/composite/Header.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Header, { props });
};

describe('Header languageToggle', () => {
  const rightZone = (html: string) => html.slice(html.indexOf('justify-end'));

  it('renders a LanguageToggle in the right zone, before the theme toggle', async () => {
    const zone = rightZone(await render({ languageToggle: {}, themeToggle: {} }));

    expect(zone).toContain('data-language-toggle');
    expect(zone.indexOf('data-language-toggle')).toBeLessThan(zone.indexOf('data-theme-toggle'));
  });

  it('renders no LanguageToggle when languageToggle is unset', async () => {
    expect(await render({ themeToggle: {} })).not.toContain('data-language-toggle');
  });
});
