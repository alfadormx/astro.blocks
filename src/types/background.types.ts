export type BackgroundAttachment = 'scroll' | 'fixed';

export interface BackgroundProps {
  /** Background image path or URL (supports `~/assets/`, public, and external URLs). */
  image?: string;
  /** Background video source URL. */
  video?: string;
  /** Scroll behavior for the background image; defaults to `'scroll'`. */
  attachment?: BackgroundAttachment;
  /** Additional classes applied to the background layer (color, sizing, etc.). */
  class?: string;
  /** Classes applied to the optional overlay div rendered on top of the background. */
  overlayClass?: string;
}

export type SimpleBackgroundProps = Omit<
  BackgroundProps,
  'image' | 'video' | 'attachment' | 'overlayClass'
>;
