import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';
import type { ContainerProps, TwoColumnContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ImageProps } from './image.types';
import type { VideoProps } from './video.types';

export interface HeroProps {
  /** How copy and media are arranged: copy alone (with an optional `container.background`) or beside media (default: 'centered') */
  layout?: 'centered' | 'split';
  /** Side the media column sits on in `split`; on small screens the copy always comes first (default: 'right') */
  mediaPosition?: 'left' | 'right';
  /** Image shown beside the copy; `split` only, and not together with `video` */
  image?: ImageProps;
  /** Video shown beside the copy; `split` only, and not together with `image` */
  video?: VideoProps;
  /** Configuration for the outer Container; set `background` for a full-bleed image or video and `minHeight` for height (e.g. 'min-h-[80vh]') */
  container?: ContainerProps;
  /** Configuration for the TwoColumnContainer holding copy and media; `split` only. `responsive` and `reverseOnMobile` are set by Hero */
  twoColumnContainer?: Omit<TwoColumnContainerProps, 'responsive' | 'reverseOnMobile'>;
  /** Headline rendered above the actions (default: { htmlTag: 'h1', align: 'center' in centered, 'left' in split }) */
  headline?: HeadlineProps;
  /** Button configs rendered as the hero actions */
  actions?: ButtonProps[];
  /** Button config merged under every entry in `actions` */
  defaultActionConfig?: LayerConfig<ButtonProps>;
  /** Custom classes for the wrapper around the action buttons (default: 'flex flex-col md:flex-row gap-4', plus 'justify-center' in centered or 'justify-start' in split) */
  actionsClass?: string;
}
