import type { ButtonProps } from './button.types';

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
  /** Still image shown before playback and while a background video is paused; same sources as `image`. Applies only with `video`. */
  poster?: string;
  /** Pause button shown over a playing background video. Restyle through this field; it cannot be removed. */
  pauseButton?: ButtonProps;
  /** Play button shown over a paused background video. Inherits `pauseButton`'s defaults. */
  playButton?: ButtonProps;
}

export type SimpleBackgroundProps = Omit<
  BackgroundProps,
  'image' | 'video' | 'attachment' | 'overlayClass' | 'poster' | 'pauseButton' | 'playButton'
>;
