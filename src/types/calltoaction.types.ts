import type { HeadlineProps } from './headline.types';
import type { ButtonProps } from './button.types';
import type { ContainerProps } from './container.types';

export interface CallToActionProps {
  container?: ContainerProps;
  headline: HeadlineProps;
  actions: ButtonProps[];
}
