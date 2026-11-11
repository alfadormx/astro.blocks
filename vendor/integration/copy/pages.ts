import type { AstroGlobal } from 'astro';
import { I18N } from 'site-config';
import { COPY } from 'site-copy';

type Lang = (typeof I18N.languages)[number];
export type CopyPage = keyof AstroBlocks.CopyRegistry;

/** `getStaticPaths` for a page under `src/pages/[...lang]/`: one path per configured language. */
export function localizedPaths() {
  return I18N.languages.map((lang: Lang) => ({
    params: { lang: lang.basePath === '/' ? undefined : lang.basePath.replace(/^\//, '') },
    props: { langCode: lang.code, basePath: lang.basePath },
  }));
}

/** The page's copy in the current language, typed from its default-language YAML. */
export function useCopy<P extends CopyPage>(
  astro: AstroGlobal,
  page: P
): { langCode: string; copy: AstroBlocks.CopyRegistry[P] } {
  const langCode = (astro.props as { langCode?: string }).langCode ?? I18N.default;
  const byLang = COPY[page as string];
  if (!byLang) throw new Error(`No copy for "${String(page)}" under src/copy/`);
  return {
    langCode,
    copy: (byLang[langCode] ?? byLang[I18N.default]) as AstroBlocks.CopyRegistry[P],
  };
}
