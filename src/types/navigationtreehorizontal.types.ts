import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';

export type NavigationTreeHorizontalTrigger = 'hover' | 'click';

export interface NavigationTreeHorizontalProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  items: ButtonProps[];
  trigger?: NavigationTreeHorizontalTrigger;
  dropdownPosition?: 'left' | 'center' | 'right';
  class?: string;
  itemClass?: string;
  dropdownClass?: string;
  defaultItemConfig?: Partial<ButtonProps>;
}
