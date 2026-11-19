declare module 'site-config' {
  import type {
    SiteConfig,
    I18NConfig,
    MetaDataConfig,
    AnalyticsConfig,
    CollectionsConfig,
  } from './utils/configBuilder';

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const METADATA: MetaDataConfig;
  export const ANALYTICS: AnalyticsConfig;
  export const COLLECTIONS: CollectionsConfig;
}

declare module 'site-copy' {
  /** Copy per page, then per language code, merged over the default language. */
  export const COPY: Record<string, Record<string, unknown>>;
}

declare module 'site-images' {
  import type { ImageMetadata } from 'astro';

  /** The site's `src/assets/images/**` files, keyed `/src/assets/images/…`. */
  const images: Record<string, () => Promise<{ default: ImageMetadata }>>;
  export default images;
}

/** Side-effect import of the site's stylesheet (`blocks({ css })`), or the library CSS. */
declare module 'site-styles' {}

// Filled per site by the integration's injected types (`collections.d.ts`, `copy.d.ts`).
declare namespace AstroBlocks {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface CollectionRegistry {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface CopyRegistry {}
}

declare namespace App {
  interface Locals {
    /** Set by the collection page helpers: per-language URLs for the toggle and for `hreflang`. */
    blocksAlternates?: {
      toggle: Record<string, string>;
      hreflang: Record<string, string>;
    };
  }
}
