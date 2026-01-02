import type { SpacingConfig } from './spacing.types';
import type { BorderConfig } from './border.types';
import type { BackgroundConfig } from './background.types';
import type { ButtonProps } from './button.types';
import type { IconConfig } from './icon.types';

export type ItemLayout = 'vertical' | 'horizontal';

export type ItemBackgroundConfig = Omit<BackgroundConfig, 'image' | 'video' | 'attachment'>;

export interface ItemProps {
  icon?: IconConfig;
  title: string;
  content: string;
  actions?: ButtonProps[];
  layout?: ItemLayout; // 'vertical' or 'horizontal'
  background?: ItemBackgroundConfig; // only color backgrounds supported
  spacing?: SpacingConfig;
  border?: BorderConfig;
  class?: string;
}
