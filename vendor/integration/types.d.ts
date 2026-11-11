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

declare module 'site-copy' {
  /** Copy per page, then per language code, merged over the default language. */
  export const COPY: Record<string, Record<string, unknown>>;
}

// Filled per site by the integration's injected `copy.d.ts`.
declare namespace AstroBlocks {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface CopyRegistry {}
}
