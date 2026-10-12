import type { ContainerProps, TwoColumnContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ButtonProps } from './button.types';
import type { ItemsGridProps } from './itemsgrid.types';
import type { ImageProps } from './image.types';

export interface ContentProps {
  /** Configuration for the outer Container wrapping the block */
  container?: ContainerProps;
  /** Configuration for the Headline shown above the two-column content */
  headline?: HeadlineProps;
  /** Configuration for the Image in the opposite column; style the column wrapper with `imageClass` */
  image?: ImageProps;
  /** Configuration for the Button rendered below the slotted content */
  action?: ButtonProps;
  /** Side the image column sits on (default: 'right') */
  imagePosition?: 'left' | 'right';
  /** Custom classes for the wrapper div around the slotted content */
  slotClass?: string;
  /** Configuration for the TwoColumnContainer holding the content and image columns (default: { htmlTag: 'div', content: { air: 'none' }, responsive: true }) */
  twoColumnContainer?: TwoColumnContainerProps;
  /** Configuration for the ItemsGrid below the content; rendered when `items` is non-empty (default: { columns: 1, gap: 'normal', defaultItemConfig: { orientation: 'horizontal' }, class: 'mt-6 md:mt-8' }) */
  itemsGrid?: ItemsGridProps;
  /** Custom classes for the wrapper div around the image column; style the Image itself with `image.class` */
  imageClass?: string;
}
