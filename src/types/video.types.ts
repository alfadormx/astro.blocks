import type { ButtonProps } from './button.types';

export type AspectRatio = 'video' | 'square' | 'portrait' | 'cinema';

/** A self-hosted file in one or more formats; the browser plays the first it supports. */
export interface VideoFileSource {
  /** URL of the media file. */
  src: string;
  /** MIME type, e.g. 'video/mp4'. */
  type?: string;
}

export type VideoSource =
  | { provider: 'html5'; sources: VideoFileSource[]; poster?: string }
  | { provider: 'youtube'; id: string }
  | { provider: 'vimeo'; id: string };

export interface VideoProps {
  /** What to play: self-hosted files (`html5`) or a YouTube or Vimeo video id. */
  source: VideoSource;
  /** Aspect ratio of the video box (default: 'video'). */
  aspectRatio?: AspectRatio;
  /** Docks the video in the bottom-right corner once it scrolls out of view (default: false). */
  isFloating?: boolean;
  /** Value of the `crossorigin` attribute on a self-hosted `<video>` (default: 'anonymous'). */
  crossorigin?: 'anonymous' | 'use-credentials';
  /** Starts playback on load. */
  autoplay?: boolean;
  /** Mutes the video; if unset, defaults to true whenever autoplay is enabled. */
  muted?: boolean;
  /** Renders the video without player controls. */
  hideControls?: boolean;
  /** Restarts playback when the video ends. */
  loop?: boolean;
  /** Additional CSS classes merged onto the video wrapper element. */
  class?: string;
  /** Horizontal alignment of the video wrapper within its container. */
  align?: 'left' | 'center' | 'right';
  /** Config for the floating player's close button, merged over the default button; the floating player owns `hidden`. */
  pipButton?: Omit<ButtonProps, 'hidden'>;
}
