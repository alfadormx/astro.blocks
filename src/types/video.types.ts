import type { Options, SourceInfo } from 'plyr';
import type { ButtonProps } from './button.types';

export type AspectRatio = 'video' | 'square' | 'portrait' | 'cinema';

export interface VideoProps {
  source: SourceInfo;
  options?: Options;
  aspectRatio?: AspectRatio;
  isFloating?: boolean;
  crossorigin?: 'anonymous' | 'use-credentials';
  class?: string;
  pipButtonConfig?: ButtonProps;
}
