import { I18N } from 'site-config';
import type { ButtonProps } from '@alfadormx/blocks/types/button';
import type { CollectionListProps } from '@alfadormx/blocks/types/collectionlist';
import type { HeadlineProps } from '@alfadormx/blocks/types/headline';
import type { NavigationTreeItem } from '@alfadormx/blocks/types/navigationtree';
import { collectionUrl } from '@alfadormx/blocks/collections';

type Language = (typeof I18N.languages)[number];
type LocalCopy = AstroBlocks.CopyRegistry['local'];

export const CONTACT_ADDRESS = 'hola@example.com';
export const PHONE = '+34910000000';
export const GEO = { lat: 40.4227, lon: -3.7058 };
export const ANCHORS = ['services', 'about', 'gallery', 'reviews', 'visit', 'contact'] as const;
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

/** Text on the espresso band: light in both themes, since the band stays dark. */
export const ON_DARK = 'text-background dark:text-normal';

/** Links on the espresso band follow its text colour instead of the page's link colour. */
export const DARK_LINKS =
  '[--color-link:var(--color-background)] [--color-link-hover:var(--color-accent)] dark:[--color-link:var(--color-normal)]';

/** Small spaced capitals led by a short rule. */
export const TAGLINE =
  'inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em] before:block before:h-px before:w-6 before:bg-current';

/** Left-aligned section heading: ruled tagline, serif title, muted lead. */
export const SECTION_HEADLINE: HeadlineProps = {
  align: 'left',
  class: 'mt-0 mb-10 space-y-3',
  taglineClass: TAGLINE,
  titleClass: 'text-4xl md:text-[2.6rem] font-bold leading-tight mb-0',
  subtitleClass: 'text-lg text-muted max-w-2xl',
};

/** White card with a hairline border and a soft shadow. */
export const CARD = 'bg-surface border border-border rounded-2xl shadow-sm';

/** Event cards: white, rounded, a 16:9 cover and the serif title. */
export const EVENT_CARD: CollectionListProps['defaultEventCardConfig'] = {
  class: `${CARD} overflow-hidden`,
  image: {
    widths: [400, 800],
    sizes: '(min-width: 1024px) 33vw, 100vw',
  },
  eyebrowClass: 'text-primary font-semibold',
  headline: { titleClass: 'font-title text-xl font-bold leading-snug mb-0' },
};

/** Rounded pill with the primary's warm gradient and glow. */
export const PILL: ButtonProps = {
  variant: 'solid',
  intent: 'primary',
  shape: 'pill',
  class:
    'bg-linear-to-b from-primary to-primary-hover shadow-lg shadow-primary/30 border-0 font-semibold',
};

/** Jagged ridge in `currentColor` that closes the hero into the page below. */
export const RIDGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 48" preserveAspectRatio="none"><path d="M0 48V30L190 10L330 34L520 6L690 28L880 4L1060 32L1250 12L1440 26V48Z" fill="currentColor"/></svg>`;

export function directionsUrl(): string {
  return `https://www.openstreetmap.org/directions?to=${GEO.lat}%2C${GEO.lon}`;
}

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
