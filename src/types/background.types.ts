export type BackgroundAttachment = 'scroll' | 'fixed';

export interface BackgroundProps {
  image?: string;
  video?: string;
  attachment?: BackgroundAttachment;
  class?: string;
  overlayClass?: string;
}
