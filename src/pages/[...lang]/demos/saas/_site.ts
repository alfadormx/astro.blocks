import { I18N } from 'site-config';
import type { ButtonProps } from '~/types/button.types';
import type { CollectionListProps } from '~/types/collectionlist.types';
import type { LogoCloudLogo } from '~/types/logocloud.types';
import type { NavigationTreeItem } from '~/types/navigationtree.types';
import { collectionUrl } from '#blocks/collections';

type Language = (typeof I18N.languages)[number];
type SaasCopy = AstroBlocks.CopyRegistry['saas'];
type NavCopy = SaasCopy['nav'];

export const ANCHORS = ['features', 'pricing', 'testimonials', 'faq'] as const;

export const STEP_ICONS: Record<keyof SaasCopy['workflow']['steps'], string> = {
  track: 'heroicons:cursor-arrow-rays',
  funnel: 'heroicons:funnel',
  dropoff: 'heroicons:arrow-trending-down',
  share: 'heroicons:share',
  watch: 'heroicons:bell-alert',
};

/** Light, tightly tracked section titles over a grey second line. */
export const SECTION_HEADLINE = {
  titleClass: 'text-4xl md:text-[2.6rem] font-normal tracking-tight leading-[1.1]',
  subtitleClass: 'text-4xl md:text-[2.6rem] tracking-tight leading-[1.1] text-emphasis max-w-3xl',
};

/** Text on the dusk gradient: light in both themes, since the gradient stays dark. */
export const ON_DUSK = 'text-background dark:text-normal';

/** Post cards on the landing page and the blog list: white, rounded, with the light title weight. */
export const POST_CARD: CollectionListProps['defaultPostCardConfig'] = {
  class: 'rounded-3xl bg-background',
  headline: { titleClass: 'text-xl font-normal tracking-tight leading-snug mb-0' },
};

export const DUSK_BACKGROUND =
  'bg-linear-to-b from-tertiary from-35% via-secondary via-75% to-accent';

export function saasHome(langCode: string): string {
  const lang = I18N.languages.find((l: Language) => l.code === langCode);
  const prefix = lang && lang.basePath !== '/' ? lang.basePath : '';
  return `${prefix}/demos/saas`;
}

export function saasNav(langCode: string, nav: NavCopy): NavigationTreeItem[] {
  const home = saasHome(langCode);
  return [
    ...ANCHORS.map((id) => ({ label: nav[id], href: `${home}#${id}` })),
    { label: nav.blog, href: collectionUrl('posts', langCode) },
  ];
}

export function saasCta(langCode: string, nav: NavCopy): ButtonProps {
  return {
    label: nav.trial,
    href: `${saasHome(langCode)}#pricing`,
    variant: 'solid',
    intent: 'neutral',
    size: 'sm',
    icon: { name: 'heroicons:arrow-right' },
    iconPosition: 'right',
  };
}

const SHAPES: Record<string, string> = {
  a: '<circle cx="16" cy="16" r="12"/>',
  b: '<polygon points="16,3 29,28 3,28"/>',
  c: '<rect x="4" y="4" width="24" height="24" rx="6"/>',
  d: '<polygon points="16,2 30,16 16,30 2,16"/>',
  e: '<path d="M4 18a12 12 0 0 1 24 0z"/>',
  f: '<path d="M9 10h14a6 6 0 0 1 0 12H9a6 6 0 0 1 0-12z"/>',
};

/** The Driftwave wordmark in `currentColor`, so the header and footer can set its colour. */
export const SAAS_BRAND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 32"><g fill="currentColor"><path d="M4 20c4-8 8-8 12 0s8 8 12 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><text x="38" y="23" font-family="'Libre Franklin', sans-serif" font-size="21" font-weight="500">Driftwave</text></g></svg>`;

export function saasLogos(names: Record<string, string>): LogoCloudLogo[] {
  return Object.entries(names).map(([key, name]) => ({
    name,
    vector: {
      src: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32"><g fill="currentColor">${SHAPES[key]}<text x="40" y="22" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${name}</text></g></svg>`,
    },
  }));
}
