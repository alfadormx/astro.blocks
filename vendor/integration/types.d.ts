declare module 'site-config' {
  import type {
    SiteConfig,
    I18NConfig,
    MetaDataConfig,
    AnalyticsConfig,
  } from './utils/configBuilder';

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const METADATA: MetaDataConfig;
  export const ANALYTICS: AnalyticsConfig;
}
