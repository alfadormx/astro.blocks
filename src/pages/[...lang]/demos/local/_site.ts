import { I18N } from 'site-config';
import type { ButtonProps } from '~/types/button.types';
import type { NavigationTreeItem } from '~/types/navigationtree.types';
import { collectionUrl } from '../../../../../vendor/integration/collections/pages';

type Language = (typeof I18N.languages)[number];
type LocalCopy = AstroBlocks.CopyRegistry['local'];

export const CONTACT_ADDRESS = 'hola@example.com';
export const PHONE = '+34910000000';
export const GEO = { lat: 40.4227, lon: -3.7058 };
export const ANCHORS = ['services', 'about', 'reviews', 'visit'] as const;
export const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:30',
    closes: '19:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Saturday',
    opens: '08:30',
    closes: '14:00',
  },
];

export function localHome(langCode: string): string {
  const lang = I18N.languages.find((l: Language) => l.code === langCode);
  const prefix = lang && lang.basePath !== '/' ? lang.basePath : '';
  return `${prefix}/demos/local`;
}

const trim = (path: string) => path.replace(/\/$/, '');

export function localNav(
  langCode: string,
  currentPath: string,
  nav: LocalCopy['nav']
): NavigationTreeItem[] {
  const home = localHome(langCode);
  const events = collectionUrl('events', langCode);
  const current = trim(currentPath);
  const eventsActive = current === trim(events) || current.startsWith(`${trim(events)}/`);
  return [
    ...ANCHORS.map((id) => ({ label: nav[id], href: `${home}#${id}` })),
    eventsActive
      ? { label: nav.events, href: events, 'aria-current': 'page' as const }
      : { label: nav.events, href: events },
  ];
}

export function localCta(langCode: string, nav: LocalCopy['nav']): ButtonProps {
  return {
    label: nav.cta,
    href: `${localHome(langCode)}#visit`,
    variant: 'solid',
    intent: 'primary',
    size: 'sm',
  };
}

export function localBusinessJsonLd(
  business: LocalCopy['business'],
  url: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: business.name,
    url,
    telephone: PHONE,
    email: CONTACT_ADDRESS,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.street,
      postalCode: business.postalCode,
      addressLocality: business.locality,
      addressCountry: 'ES',
    },
    geo: { '@type': 'GeoCoordinates', latitude: GEO.lat, longitude: GEO.lon },
    openingHoursSpecification: OPENING_HOURS,
  };
}
