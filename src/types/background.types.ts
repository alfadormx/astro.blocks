export type BackgroundAttachment = 'scroll' | 'fixed';

export interface BackgroundConfig {
  image?: string;
  video?: string;
  attachment?: BackgroundAttachment;
  class?: string;
}

export interface BackgroundProps {
  image?: string;
  video?: string;
  attachment?: BackgroundAttachment;
  class?: string;
  overlayClass?: string;
}
