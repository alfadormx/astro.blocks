import type { HTMLAttributes } from 'astro/types';
import type { ContainerProps } from './container.types';
import type { NavigationTreeHorizontalProps } from './navigationtreehorizontal.types';
import type { ButtonProps } from './button.types';
import type { LogoProps } from './logo.types';
import type { LayerConfig } from './config.types';
import type { ThemeToggleProps } from './themetoggle.types';

export type HeaderBreakpoint = 'sm' | 'md' | 'lg';
export type HeaderButtonsGap = 'none' | 'tight' | 'normal' | 'loose';

export interface HeaderProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  /** Makes the header stick to the top of the viewport on scroll (default: false) */
  isSticky?: boolean;
  /** Makes the header float with margin instead of spanning full width (default: false) */
  isFloating?: boolean;
  /** Space between buttons in each button group (default: 'normal') */
  buttonsGap?: HeaderButtonsGap;
  /** Custom classes for both button-group wrappers (default: 'flex flex-row flex-wrap gap-1') */
  buttonsClass?: string;
  /** Container configuration wrapping the header content */
  container?: ContainerProps;
  /** Logo rendered once between the zones; centred while the zones fit, pushed aside rather than covered, and wrapped onto its own line with the zones when they don't fit (A16). */
  logo?: LogoProps;
  /** Horizontal navigation tree in the left zone */
  leftNavigationTreeHorizontal?: NavigationTreeHorizontalProps;
  /** Horizontal navigation tree in the right zone */
  rightNavigationTreeHorizontal?: NavigationTreeHorizontalProps;
  /** NavigationTreeHorizontal config merged under both navigation trees; share nav button defaults through its `defaultItemConfig` */
  defaultNavigationTreeHorizontalConfig?: LayerConfig<Omit<NavigationTreeHorizontalProps, 'items'>>;
  /** Theme toggle in the right zone; rendered when set (`{}` for defaults) */
  themeToggle?: ThemeToggleProps;
  /** Buttons in the left zone */
  leftButtons?: ButtonProps[];
  /** Buttons in the right zone */
  rightButtons?: ButtonProps[];
  /** Button config merged under every entry in `leftButtons` and `rightButtons` */
  defaultButtonConfig?: LayerConfig<ButtonProps>;
  /** Classes merged onto the zones row (flex, wraps when the zones don't fit); a consumer `grid` replaces `flex`. */
  class?: string;
}
