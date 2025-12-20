import type { MetaData } from '~/types/metadata.types';
import merge from 'lodash.merge';

export type Config = {
  site?: SiteConfig;
  metadata?: MetaDataConfig;
  i18n?: I18NConfig;
};

export interface SiteConfig {
  name: string;
  site?: string;
  base?: string;
  trailingSlash?: boolean;
}

export interface MetaDataConfig extends Omit<MetaData, 'title'> {
  title?: {
    default: string;
    template: string;
    separator?: string;
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

const getI18N = (config: Config) => {
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

export default (config: Config) => ({
  SITE: getSite(config),
  I18N: getI18N(config),
  METADATA: getMetadata(config),
});
