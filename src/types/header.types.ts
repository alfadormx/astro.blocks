import type { HTMLAttributes } from 'astro/types';
import type { ContainerProps } from './container.types';
import type { NavigationTreeHorizontalProps } from './navigationtreehorizontal.types';
import type { ButtonProps } from './button.types';
import type { LogoProps } from './logo.types';

export type HeaderBreakpoint = 'sm' | 'md' | 'lg';
export type HeaderActionsAir = 'none' | 'tight' | 'normal' | 'loose';

export interface HeaderProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  /** Makes the header stick to the top of the viewport on scroll (default: false) */
  isSticky?: boolean;
  /** Makes the header float with margin instead of spanning full width (default: false) */
  isFloating?: boolean;
  /** Shows the theme toggle button (default: false) */
  showThemeToggle?: boolean;
  /** Spacing between action buttons (default: 'normal') */
  actionsAir?: HeaderActionsAir;
  /** Container configuration wrapping the header content */
  container?: ContainerProps;
  /** Logo configuration rendered at the start of the header */
  logo?: LogoProps;
  /** Left-side horizontal navigation tree */
  navigationLeft?: NavigationTreeHorizontalProps;
  /** Right-side horizontal navigation tree */
  navigationRight?: NavigationTreeHorizontalProps;
  /** Theme toggle button configuration */
  themeToggle?: ButtonProps;
  /** Buttons rendered on the left side of the actions area */
  actionsLeft?: ButtonProps[];
  /** Buttons rendered on the right side of the actions area */
  actionsRight?: ButtonProps[];
  /** Default config merged into every action button */
  defaultActionsConfig?: Partial<ButtonProps>;
  /** Custom classes for the root nav element */
  class?: string;
}
