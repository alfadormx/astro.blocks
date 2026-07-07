import type { ButtonProps } from '~/types/button.types';
import type { ContainerProps } from '~/types/container.types';
import type { SimpleBackgroundProps } from '~/types/background.types';
import type { SpacingConfig } from '~/types/spacing.types';
import type { BorderConfig } from '~/types/border.types';

export interface TabsProps {
  items: Partial<ButtonProps>[];
  defaultTabConfig?: Partial<ButtonProps>;
  activeTabConfig?: Partial<ButtonProps>;
  orientation?: 'horizontal' | 'vertical';
  container?: Partial<ContainerProps>;
  tabList?: {
    background?: SimpleBackgroundProps;
    spacing?: SpacingConfig;
    border?: BorderConfig;
    class?: string;
  };
}
