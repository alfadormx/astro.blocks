import { I18N } from 'site-config';
import type { ButtonProps } from '~/types/button.types';
import type { LogoCloudLogo } from '~/types/logocloud.types';
import type { NavigationTreeItem } from '~/types/navigationtree.types';
import { collectionUrl } from '../../../../../vendor/integration/collections/pages';

type Language = (typeof I18N.languages)[number];
type SaasCopy = AstroBlocks.CopyRegistry['saas'];
type NavCopy = SaasCopy['nav'];

export const ANCHORS = ['features', 'pricing', 'testimonials', 'faq'] as const;

export const FEATURE_ICONS: Record<keyof SaasCopy['features']['items'], string> = {
  funnels: 'heroicons:funnel',
  retention: 'heroicons:arrow-path',
  segments: 'heroicons:chart-pie',
  dashboards: 'heroicons:squares-2x2',
  alerts: 'heroicons:bell-alert',
  privacy: 'heroicons:shield-check',
};

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
    intent: 'primary',
    size: 'sm',
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

export function saasLogos(names: Record<string, string>): LogoCloudLogo[] {
  return Object.entries(names).map(([key, name]) => ({
    name,
    vector: {
      src: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32"><g fill="currentColor">${SHAPES[key]}<text x="40" y="22" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${name}</text></g></svg>`,
    },
  }));
}
