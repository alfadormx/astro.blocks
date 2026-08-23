import type { ContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ButtonProps } from './button.types';
import type { ItemsGridProps } from './itemsgrid.types';
import type { ImageProps } from '~/utils/images-optimization';

export interface ContentProps {
  /** Configuration for the outer Container wrapping the block */
  container?: ContainerProps;
  /** Configuration for the Headline shown above the two-column content */
  headline?: Partial<HeadlineProps>;
  /** Configuration for the Image shown in the opposite column from the content */
  image?: ImageProps;
  /** Optional text content for the block (not currently rendered by the component) */
  content?: string;
  /** Configuration for the Button rendered below the slotted content */
  action?: ButtonProps;
  /** List of items rendered in an ItemsGrid below the content (default: []) */
  items?: ItemsGridProps['items'];
  /** Places the image column on the left instead of the right (default: false) */
  imageOnLeft?: boolean;
  /** Reverses the column order on mobile screens (default: false) */
  reverseOnMobile?: boolean;
  /** Custom classes applied to the wrapper div around the slotted content */
  contentSlotClass?: string;
}
