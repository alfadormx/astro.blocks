import type { ContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ItemsGridProps } from './itemsgrid.types';

export interface FAQProps {
  container?: Partial<ContainerProps>;
  headline?: Partial<HeadlineProps>;
  itemsGrid?: Partial<ItemsGridProps>;
}
