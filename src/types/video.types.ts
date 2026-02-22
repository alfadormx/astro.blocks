import type { Options, SourceInfo } from 'plyr';
import type { ButtonProps } from './button.types';

export type AspectRatio = 'video' | 'square' | 'portrait' | 'cinema';

export interface VideoProps {
  source: SourceInfo;
  options?: Options;
  aspectRatio?: AspectRatio;
  isFloating?: boolean;
  crossorigin?: 'anonymous' | 'use-credentials';
  autoplay?: boolean;
  muted?: boolean;
  hideControls?: boolean;
  loop?: boolean;
  class?: string;
  align?: 'left' | 'center' | 'right';
  pipButtonConfig?: ButtonProps;
}
