import type { IconConfig } from './icon.types';

export interface ButtonProps {
  id?: string;
  label?: string;
  subtitle?: string;
  icon?: IconConfig;
  iconPosition?: 'left' | 'right';
  iconSize?: string;
  href?: string;
  target?: '_blank' | '_self';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  intent?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral';
  shape?: 'rounded' | 'square' | 'pill';
  width?: 'auto' | 'full';
  disabled?: boolean;
  class?: string;
  labelClass?: string;
  subtitleClass?: string;
  iconClass?: string;
}
