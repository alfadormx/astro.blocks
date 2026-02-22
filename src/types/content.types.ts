import type { ContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ButtonProps } from './button.types';
import type { ItemsGridProps } from './itemsgrid.types';
import type { ImageProps } from '~/utils/images-optimization';

export interface ContentProps {
  container?: Partial<ContainerProps>;
  headline?: Partial<HeadlineProps>;
  image?: ImageProps;
  content?: string;
  action?: ButtonProps;
  items?: ItemsGridProps['items'];
  imageOnLeft?: boolean;
  reverseOnMobile?: boolean;
  contentSlotClass?: string;
}
