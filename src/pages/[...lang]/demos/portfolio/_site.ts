import { I18N } from 'site-config';
import type { NavigationTreeItem } from '~/types/navigationtree.types';
import { collectionUrl } from '../../../../../vendor/integration/collections/pages';

type Language = (typeof I18N.languages)[number];
type PortfolioCopy = AstroBlocks.CopyRegistry['portfolio'];
type NavCopy = PortfolioCopy['nav'];

export const CONTACT_ADDRESS = 'hello@example.com';

export function portfolioHome(langCode: string): string {
  const lang = I18N.languages.find((l: Language) => l.code === langCode);
  const prefix = lang && lang.basePath !== '/' ? lang.basePath : '';
  return `${prefix}/demos/portfolio`;
}

const trim = (path: string) => path.replace(/\/$/, '');

export function portfolioNav(
  langCode: string,
  currentPath: string,
  nav: NavCopy
): NavigationTreeItem[] {
  const home = portfolioHome(langCode);
  const current = trim(currentPath);
  const sections = [
    { label: nav.work, href: collectionUrl('cases', langCode), prefix: true },
    { label: nav.about, href: `${home}/about`, prefix: false },
    { label: nav.contact, href: `${home}/contact`, prefix: false },
  ];
  return sections.map(({ label, href, prefix }) => {
    const target = trim(href);
    const active = current === target || (prefix && current.startsWith(`${target}/`));
    return active ? { label, href, 'aria-current': 'page' as const } : { label, href };
  });
}
