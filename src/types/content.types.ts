import type { ContainerProps, TwoColumnContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ButtonProps } from './button.types';
import type { ItemsGridProps } from './itemsgrid.types';
import type { ImageProps } from '~/utils/images-optimization';

export interface ContentProps {
  /** Configuration for the outer Container wrapping the block */
  container?: ContainerProps;
  /** Configuration for the Headline shown above the two-column content */
  headline?: Partial<HeadlineProps>;
  /** Configuration for the Image in the opposite column; style the column wrapper with `imageClass` */
  image?: ImageProps;
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
  /** Configuration for the TwoColumnContainer holding the content and image columns; wins over `reverseOnMobile` (default: { htmlTag: 'div', content: { air: 'none' }, responsive: true }) */
  twoColumnContainer?: TwoColumnContainerProps;
  /** Configuration for the ItemsGrid below the content; its `items` replace the flat `items` prop, so move them here once you use it (default: { columns: 1, air: 'normal', defaultItemConfig: { layout: 'horizontal' }, class: 'mt-6 md:mt-8' }) */
  itemsGrid?: ItemsGridProps;
  /** Custom classes for the wrapper div around the image column; style the Image itself with `image.class` */
  imageClass?: string;
}
