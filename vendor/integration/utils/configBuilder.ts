import type { MetaData } from '~/types/metadata.types';
import merge from 'lodash.merge';

export type Config = {
  site?: SiteConfig;
  metadata?: MetaDataConfig;
  i18n?: I18NConfig;
  analytics?: AnalyticsConfig;
  collections?: RawCollectionsConfig;
};

export interface SiteConfig {
  name: string;
  site?: string;
  base?: string;
  trailingSlash?: boolean;
  googleSiteVerificationId?: string;
}

export interface MetaDataConfig extends Omit<MetaData, 'title'> {
  title?: {
    default: string;
    template: string;
  };
}

export interface I18NLanguage {
  code: string;
  locale: string;
  basePath: string;
  direction: 'ltr' | 'rtl';
  label: string;
}

export interface I18NConfig {
  default: string;
  languages: I18NLanguage[];
}

export interface AnalyticsConfig {
  vendors?: {
    googleAnalytics?: {
      id: string;
      partytown?: boolean;
    };
  };
}

export type PresetName = 'post' | 'caseStudy' | 'event';
const PRESETS: PresetName[] = ['post', 'caseStudy', 'event'];
export type CollectionSort = 'date-desc' | 'date-asc' | 'start-asc' | 'title-asc';

export interface RawCollectionSettings {
  preset: PresetName;
  route?: string;
  path?: string;
  sort?: CollectionSort;
  pageSize?: number;
}

export type RawCollectionsConfig = { timezone?: string } & {
  [name: string]: RawCollectionSettings | string | undefined;
};

export interface CollectionSettings {
  preset: PresetName;
  route?: string;
  /** Content folder relative to the project root (default: `src/content/<name>`). */
  path: string;
  /** Resolved sort (default: `start-asc` for `event`, else `date-desc`). */
  sort: CollectionSort;
  pageSize?: number;
}

export interface CollectionsConfig {
  timezone?: string;
  entries: Record<string, CollectionSettings>;
}

const DEFAULT_SITE_NAME = 'Website';

const getSite = (config: Config) => {
  const _default = {
    name: DEFAULT_SITE_NAME,
    logo: undefined,
    site: undefined,
    base: '/',
    trailingSlash: false,

    googleSiteVerificationId: '',
  };

  return merge({}, _default, config?.site ?? {}) as SiteConfig;
};

const getMetadata = (config: Config) => {
  const siteConfig = getSite(config);

  const _default = {
    title: {
      default: siteConfig?.name || DEFAULT_SITE_NAME,
      template: '%s',
    },
    description: '',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: 'website',
    },
  };

  return merge({}, _default, config?.metadata ?? {}) as MetaDataConfig;
};

export const getI18N = (config: Config) => {
  const _default = {
    default: 'en',
    languages: [
      {
        code: 'en',
        locale: 'en-US',
        basePath: '/',
        direction: 'ltr' as const,
        label: 'English',
      },
    ],
  };

  const value = merge({}, _default, config?.i18n ?? {});

  return value as I18NConfig;
};

const getAnalytics = (config: Config) => {
  const _default = {
    vendors: {},
  };

  return merge({}, _default, config?.analytics ?? {}) as AnalyticsConfig;
};

export const getCollections = (config: Config): CollectionsConfig => {
  const { timezone, ...rest } = config?.collections ?? {};
  const entries: Record<string, CollectionSettings> = {};
  for (const [name, raw] of Object.entries(rest)) {
    if (!raw || typeof raw !== 'object') continue;
    if (!PRESETS.includes(raw.preset)) {
      throw new Error(
        `Collection "${name}" has unknown preset "${raw.preset}"; use one of ${PRESETS.join(', ')}`
      );
    }
    entries[name] = {
      preset: raw.preset,
      route: raw.route,
      path: raw.path ?? `src/content/${name}`,
      sort: raw.sort ?? (raw.preset === 'event' ? 'start-asc' : 'date-desc'),
      pageSize: raw.pageSize,
    };
  }
  return { timezone: typeof timezone === 'string' ? timezone : undefined, entries };
};

export default (config: Config) => ({
  SITE: getSite(config),
  I18N: getI18N(config),
  METADATA: getMetadata(config),
  ANALYTICS: getAnalytics(config),
  COLLECTIONS: getCollections(config),
});
