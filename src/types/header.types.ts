import type { HTMLAttributes } from 'astro/types';
import type { ContainerProps } from './container.types';
import type { ImageProps } from '~/utils/images-optimization';
import type { VectorProps } from './vector.types';
import type { NavigationTreeHorizontalProps } from './navigationtreehorizontal.types';
import type { ButtonProps } from './button.types';

export type HeaderBreakpoint = 'sm' | 'md' | 'lg';
export type HeaderNavigationAlign = 'left' | 'center' | 'right';
export type HeaderActionsAir = 'none' | 'tight' | 'normal' | 'loose';

export interface LogoButtonProps extends Partial<ButtonProps> {
  vector?: VectorProps;
  image?: ImageProps;
}

export interface HeaderProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  isSticky?: boolean;
  isFloating?: boolean;
  showThemeToggle?: boolean;
  breakpoint?: HeaderBreakpoint;
  navigationAlign?: HeaderNavigationAlign;
  actionsAir?: HeaderActionsAir;
  container?: ContainerProps;
  logoButton?: LogoButtonProps;
  navigationTreeHorizontal?: NavigationTreeHorizontalProps;
  themeToggle?: ButtonProps;
  actions?: ButtonProps[];
  class?: string;
}
