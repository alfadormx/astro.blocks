import { I18N } from 'site-config';
import type { HeadlineProps } from '@alfadormx/blocks/types/headline';
import type { NavigationTreeItem } from '@alfadormx/blocks/types/navigationtree';

type Language = (typeof I18N.languages)[number];
type JewelleryCopy = AstroBlocks.CopyRegistry['jewellery'];

export const CONTACT_ADDRESS = 'atelier@example.com';
export const PHONE = '+3230000000';
export const GEO = { lat: 51.2175, lon: 4.421 };

/** Preset ring designs as configurator codes: model, carat, metal, clarity, no extras, no engraving. */
export const RING_PRESETS = {
  classic: 'RING01-classic-medium-yellow-if--',
  bold: 'RING01-bold-large-rose-vvs1--',
  pave: 'RING01-pave-small-white-if--',
} as const;

/** Small spaced capitals: eyebrows, footer labels, card actions. */
export const LABEL = 'text-xs font-semibold uppercase tracking-[0.2em]';

/** Text on the burgundy band and on hero media: light in both themes, since both stay dark. */
export const ON_DARK = 'text-background dark:text-normal';

/** Links on the burgundy band follow its text colour. */
export const DARK_LINKS =
  '[--color-link:var(--color-background)] [--color-link-hover:var(--color-background)] dark:[--color-link:var(--color-normal)] dark:[--color-link-hover:var(--color-normal)]';

/** Centred section heading: tracked eyebrow, serif title, muted lead. */
export const SECTION_HEADLINE: HeadlineProps = {
  align: 'center',
  class: 'mt-0 mb-12 space-y-3',
  taglineClass: `${LABEL} text-muted`,
  titleClass: 'text-4xl md:text-5xl font-medium tracking-tight leading-tight mb-0',
  subtitleClass: 'text-lg text-muted max-w-2xl mx-auto',
};

function prefixOf(langCode: string): string {
  const lang = I18N.languages.find((l: Language) => l.code === langCode);
  return lang && lang.basePath !== '/' ? lang.basePath : '';
}

export function jewelleryHome(langCode: string): string {
  return `${prefixOf(langCode)}/demos/jewellery`;
}

export function configuratorUrl(langCode: string, code?: string): string {
  const url = `${jewelleryHome(langCode)}/configurator`;
  return code ? `${url}?code=${code}` : url;
}

const trim = (path: string) => path.replace(/\/$/, '');

export function jewelleryNav(
  langCode: string,
  currentPath: string,
  nav: JewelleryCopy['nav']
): NavigationTreeItem[] {
  const home = jewelleryHome(langCode);
  const current = trim(currentPath);
  const sections = [
    { label: nav.configurator, href: configuratorUrl(langCode) },
    { label: nav.collections, href: `${home}/collections` },
    { label: nav.about, href: `${home}/about` },
    { label: nav.contact, href: `${home}/contact` },
  ];
  return sections.map(({ label, href }) =>
    current === trim(href) ? { label, href, 'aria-current': 'page' as const } : { label, href }
  );
}
