import type { HeadlineProps } from './headline.types';
import type { ButtonProps } from './button.types';
import type { ContainerProps } from './container.types';

export interface CallToActionProps {
  /** Container/layout configuration wrapping the headline and actions; merged with the block's default centered card styling. */
  container?: ContainerProps;
  /** Headline content rendered at the top of the call-to-action block. */
  headline: HeadlineProps;
  /** List of button configs rendered as the call-to-action buttons below the headline. */
  actions: ButtonProps[];
}
