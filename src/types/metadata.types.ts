export interface MetaData {
  title?: {
    default: string;
    template?: string;
  };
  ignoreTitleTemplate?: boolean;

  description?: string;
  author?: string;
  keywords?: string[];
  charset?: string;

  canonical?: string;

  robots?: MetaDataRobots;

  icons?: MetaDataIcons;

  openGraph?: MetaDataOpenGraph;
  twitter?: MetaDataTwitter;

  theme?: MetaDataTheme;

  localized?: Record<string, MetaDataLocalized>;
}

export interface MetaDataRobots {
  index?: boolean;
  follow?: boolean;
}

export interface MetaDataIcons {
  favicon?: string;
  apple?: string;
  icon32?: string;
  icon16?: string;
}

export interface MetaDataImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  secureUrl?: string;
  type?: string;
}

export interface MetaDataOpenGraph {
  url?: string;
  site_name?: string;
  siteName?: string; // Alias for compatibility
  images?: Array<MetaDataImage>;
  locale?: string;
  localeAlternate?: string[];
  type?: string;
  description?: string;
  audio?: string;
  video?: string;
  determiner?: string;
  // Article specific
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    expirationTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}

export interface MetaDataTwitter {
  handle?: string;
  site?: string;
  cardType?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

export interface MetaDataTheme {
  color?: string;
  colorScheme?: string;
}

export interface MetaDataLocalized {
  title?: {
    default: string;
    template: string;
  };
  description?: string;
  openGraph?: {
    site_name?: string;
    locale?: string;
  };
}
