import type { HTMLAttributes } from 'astro/types';
import type { ContainerProps } from './container.types';
import type { NavigationTreeHorizontalProps } from './navigationtreehorizontal.types';
import type { ButtonProps } from './button.types';
import type { LogoProps } from './logo.types';

export type HeaderBreakpoint = 'sm' | 'md' | 'lg';
export type HeaderNavigationAlign = 'left' | 'center' | 'right';
export type HeaderActionsAir = 'none' | 'tight' | 'normal' | 'loose';

export interface HeaderProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  isSticky?: boolean;
  isFloating?: boolean;
  showThemeToggle?: boolean;
  breakpoint?: HeaderBreakpoint;
  navigationAlign?: HeaderNavigationAlign;
  actionsAir?: HeaderActionsAir;
  container?: ContainerProps;
  logo?: LogoProps;
  navigationTreeHorizontal?: NavigationTreeHorizontalProps;
  themeToggle?: ButtonProps;
  actions?: ButtonProps[];
  class?: string;
}
