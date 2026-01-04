export type BackgroundAttachment = 'scroll' | 'fixed';

export interface BackgroundProps {
  image?: string;
  video?: string;
  attachment?: BackgroundAttachment;
  class?: string;
  overlayClass?: string;
}

export type SimpleBackgroundProps = Omit<
  BackgroundProps,
  'image' | 'video' | 'attachment' | 'overlayClass'
>;
