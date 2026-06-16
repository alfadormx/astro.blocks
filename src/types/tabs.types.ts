import type { ButtonProps } from '~/types/button.types';
import type { ContainerProps } from '~/types/container.types';

export interface TabsProps {
  items: Partial<ButtonProps>[];
  defaultTabConfig?: Partial<ButtonProps>;
  activeTabConfig?: Partial<ButtonProps>;
  orientation?: 'horizontal' | 'vertical';
  container?: Partial<ContainerProps>;
}
