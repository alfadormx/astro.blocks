import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { I18N } from 'site-config';
import { describe, expect, it } from 'vitest';
import LanguageToggle from '~/components/blocks/primitives/LanguageToggle.astro';

type Language = (typeof I18N.languages)[number];

const render = async (path: string, props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(LanguageToggle, {
    props,
    request: new Request(`http://localhost${path}`),
  });
};

const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const anchors = (html: string) => html.match(/<a\b[\s\S]*?<\/a>/g) ?? [];
const activeLabel = (html: string) =>
  html.match(/<a[^>]*aria-current="page"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';

const defaultLang = I18N.languages.find((l: Language) => l.code === I18N.default)!;
const prefixed: Language[] = I18N.languages.filter((l: Language) => l.basePath !== '/');

describe('LanguageToggle', () => {
  it.each(prefixed)(
    'treats a path that only shares the $code prefix as the default language',
    async (lang: Language) => {
      const html = await render(`${lang.basePath}tate`);
      expect(activeLabel(html)).toContain(defaultLang.label);
    }
  );

  it.each(prefixed)('detects $code on its basePath and on nested paths', async (lang: Language) => {
    expect(activeLabel(await render(lang.basePath))).toContain(lang.label);
    expect(activeLabel(await render(`${lang.basePath}/x`))).toContain(lang.label);
  });

  it.each(prefixed)(
    'strips the $code prefix from nested paths when linking to other languages',
    async (lang: Language) => {
      const html = await render(`${lang.basePath}/pricing`);
      expect(hrefs(html)).toEqual(
        I18N.languages.map((l: Language) =>
          l.basePath === '/' ? '/pricing' : `${l.basePath}/pricing`
        )
      );
    }
  );

  it('links every language to its basePath when preservePath is false', async () => {
    const html = await render('/documentation/primitives/LanguageToggle', { preservePath: false });
    expect(hrefs(html)).toEqual(I18N.languages.map((l: Language) => l.basePath));
  });

  it('keeps the current path in every link by default', async () => {
    const html = await render('/pricing');
    expect(hrefs(html)).toEqual(
      I18N.languages.map((l: Language) =>
        l.basePath === '/' ? '/pricing' : `${l.basePath}/pricing`
      )
    );
  });

  it('marks every language button with its own language', async () => {
    const links = anchors(await render('/'));
    expect(links.map((a) => a.match(/\blang="([^"]+)"/)?.[1])).toEqual(
      I18N.languages.map((l: Language) => l.code)
    );
  });

  it('shows full labels by default', async () => {
    const html = await render('/');
    for (const lang of I18N.languages as Language[]) expect(html).toContain(lang.label);
  });

  it('shows codes with the full label as accessible name when labelFormat is code', async () => {
    const links = anchors(await render('/', { labelFormat: 'code' }));
    I18N.languages.forEach((lang: Language, i: number) => {
      expect(links[i]).toContain(`aria-label="${lang.label}"`);
      expect(links[i]).toContain(`>${lang.code.toUpperCase()}<`);
    });
  });
});
