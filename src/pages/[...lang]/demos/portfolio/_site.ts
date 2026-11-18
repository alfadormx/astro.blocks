import { I18N } from 'site-config';
import type { ButtonProps } from '~/types/button.types';
import type { CollectionListEntry, CollectionListProps } from '~/types/collectionlist.types';
import type { ItemProps } from '~/types/item.types';
import type { NavigationTreeItem } from '~/types/navigationtree.types';
import { collectionUrl } from '../../../../../vendor/integration/collections/pages';

type Language = (typeof I18N.languages)[number];
type PortfolioCopy = AstroBlocks.CopyRegistry['portfolio'];
type NavCopy = PortfolioCopy['nav'];
type FooterCopy = PortfolioCopy['footer'];
type ContactCopy = PortfolioCopy['contact'];

export const CONTACT_ADDRESS = 'hello@example.com';
const CONTACT_PHONE = '+1 555 010 0100';

/** Small uppercase mono labels: section eyebrows, stat captions, footer column titles. */
export const MONO_LABEL =
  'font-mono text-xs md:text-sm font-normal uppercase tracking-tight text-muted';

/** Text on the ink band: light in both themes, since the band stays dark. */
export const ON_INK = 'text-background dark:text-normal';

/** Links inside the ink band follow its text colour instead of the page's link colour. */
export const INK_LINKS =
  '[--color-link:var(--color-background)] [--color-link-hover:var(--color-background)] dark:[--color-link:var(--color-normal)] dark:[--color-link-hover:var(--color-normal)]';

/** Large underlined text link with the arrow in a filled square. */
export const ARROW_LINK: ButtonProps = {
  variant: 'link',
  intent: 'neutral',
  icon: { name: 'heroicons:arrow-right' },
  iconPosition: 'right',
  iconClass: 'size-6 md:size-7 p-1 bg-normal text-background',
  class:
    'px-0 pb-2 gap-3 rounded-none border-b border-normal text-2xl md:text-4xl font-normal tracking-tight no-underline hover:no-underline',
};

/** Project cards: tall cover, no card chrome, discipline under the title. */
export const PROJECT_CARD: CollectionListProps['defaultCaseStudyCardConfig'] = {
  class: 'rounded-none border-0 bg-transparent',
  image: {
    aspectRatio: 4 / 5,
    widths: [400, 800],
    sizes: '(min-width: 1024px) 33vw, 100vw',
    class: 'border border-border',
  },
  eyebrowClass: 'font-mono text-xs uppercase text-muted',
  headline: { titleClass: 'text-[1rem] font-medium tracking-tight leading-snug mb-0' },
};

/** Case entries as project cards: the tags read as the disciplines line, so they leave the footer. */
export function asProjects(entries: CollectionListEntry[]): CollectionListEntry[] {
  return entries.map((entry) => ({ ...entry, description: entry.tags?.join(' + '), tags: [] }));
}

/** Square-and-name wordmark in `currentColor`, stretched to a fixed width so it fills its box. */
export function wordmark(name: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0 0h100v100H0z" fill="currentColor"/><text x="125" y="92" textLength="875" lengthAdjust="spacingAndGlyphs" font-family="'Fustat', sans-serif" font-size="118" font-weight="700" letter-spacing="-2" fill="currentColor">${name.toUpperCase()}</text></svg>`;
}

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
    { label: nav.home, href: home, prefix: false },
    { label: nav.about, href: `${home}/about`, prefix: false },
    { label: nav.work, href: collectionUrl('cases', langCode), prefix: true },
    { label: nav.contact, href: `${home}/contact`, prefix: false },
  ];
  return sections.map(({ label, href, prefix }) => {
    const target = trim(href);
    const active = current === target || (prefix && current.startsWith(`${target}/`));
    return active ? { label, href, 'aria-current': 'page' as const } : { label, href };
  });
}

const lines = (links: string[]) => links.join('  \n');

const MAIL_LINK = `[${CONTACT_ADDRESS}](mailto:${CONTACT_ADDRESS})`;
const PHONE_LINK = `[${CONTACT_PHONE}](tel:${CONTACT_PHONE.replace(/\s/g, '')})`;

/** The contact page's aside: mail, address and phone, each under a mono label. */
export function contactDetails(contact: ContactCopy, address: string): ItemProps[] {
  return [
    { title: contact.mailTitle, content: MAIL_LINK },
    { title: contact.addressTitle, content: address },
    { title: contact.callTitle, content: PHONE_LINK },
  ];
}

/** The four footer columns: address, contact, sitemap and socials. */
export function footerColumns(nav: NavigationTreeItem[], footer: FooterCopy): ItemProps[] {
  return [
    { title: footer.addressTitle, content: footer.address },
    { title: footer.contactTitle, content: lines([MAIL_LINK, PHONE_LINK]) },
    {
      title: footer.sitemapTitle,
      content: lines(nav.map((item) => `[${item.label}](${item.href})`)),
    },
    {
      title: footer.socialsTitle,
      content: lines(['Instagram', 'X', 'LinkedIn', 'Threads'].map((name) => `[${name}](#)`)),
    },
  ];
}
