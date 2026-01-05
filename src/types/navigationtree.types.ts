import type { ButtonProps } from './button.types';

export type ExpansionStrategy =
  | 'always'
  | 'active-only'
  | 'first-level'
  | 'depth'
  | 'active-siblings'
  | 'toggleable';

export type ToggleMode =
  | 'button' // Whole button toggles children (default, mobile-friendly)
  | 'icon'; // Only icon toggles, button navigates to href

export interface NavigationTreeProps {
  items: ButtonProps[];
  currentPath?: string;
  level?: number;
  class?: string;
  iconName?: string;
  rotateIconOnExpand?: boolean;
  toggleMode?: ToggleMode;
  defaultButtonConfig?: Partial<ButtonProps>;
  defaultActiveButtonConfig?: Partial<ButtonProps>;
  expansionStrategy?: ExpansionStrategy;
  maxDepth?: number;
}
