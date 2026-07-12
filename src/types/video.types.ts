import type { Options, SourceInfo } from 'plyr';
import type { ButtonProps } from './button.types';

export type AspectRatio = 'video' | 'square' | 'portrait' | 'cinema';

export interface VideoProps {
  /** Plyr source configuration describing the video to play, passed to the underlying player. */
  source: SourceInfo;
  /** Plyr options object merged on top of the defaults and convenience props (highest priority). */
  options?: Options;
  /** Aspect ratio applied to the video wrapper and passed to Plyr's ratio option (default: 'video'). */
  aspectRatio?: AspectRatio;
  /** Enables a floating (picture-in-picture style) player that docks on scroll (default: false). */
  isFloating?: boolean;
  /** Value of the `crossorigin` attribute on the underlying `<video>` element (default: 'anonymous'). */
  crossorigin?: 'anonymous' | 'use-credentials';
  /** Enables autoplay by setting Plyr's autoplay convenience option. */
  autoplay?: boolean;
  /** Mutes the player; if unset, defaults to true whenever autoplay is enabled. */
  muted?: boolean;
  /** Hides all Plyr controls by setting the controls list to empty. */
  hideControls?: boolean;
  /** Enables looping playback via Plyr's loop convenience option. */
  loop?: boolean;
  /** Additional CSS classes merged onto the video wrapper element. */
  class?: string;
  /** Horizontal alignment of the video wrapper within its container. */
  align?: 'left' | 'center' | 'right';
  /** Config for the floating player's close (PiP) button, merged with the default button config. */
  pipButtonConfig?: ButtonProps;
}
