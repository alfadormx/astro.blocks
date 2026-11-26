import type { ButtonProps } from './button.types';
import type { VideoFileSource } from './video.types';

export type BackgroundAttachment = 'scroll' | 'fixed';

export interface BackgroundProps {
  /** Background image path or URL (supports `~/assets/`, public, and external URLs). */
  image?: string;
  /** Describes `image` to assistive technology. Leave unset for a decorative image. Applies only with `image`, not `video`. */
  alt?: string;
  /** Background video: a URL, or sources in order of preference (`[{ src, type }]`, smallest format first). A missing `type` is inferred from the file extension. */
  video?: string | VideoFileSource[];
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
  | 'image'
  | 'alt'
  | 'video'
  | 'attachment'
  | 'overlayClass'
  | 'poster'
  | 'pauseButton'
  | 'playButton'
>;
