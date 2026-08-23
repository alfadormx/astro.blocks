import type { HTMLAttributes } from 'astro/types';
import type { IconConfig } from './icon.types';

export interface ButtonProps extends Omit<HTMLAttributes<'button'>, 'class'> {
  /** HTML `id` attribute applied to the rendered `<button>` or `<a>` element. */
  id?: string;
  /** Main text label displayed inside the button. */
  label?: string;
  /** Secondary text rendered below the label; enables the promotional (subtitle) layout. */
  subtitle?: string;
  /** Icon configuration (name, class, aria-label) rendered alongside the label. */
  icon?: IconConfig;
  /** Position of the icon relative to the label (default: 'left'). */
  iconPosition?: 'left' | 'right';
  /** Explicit icon size class, overriding the size-derived default icon size. */
  iconSize?: string;
  /** URL that, when set, renders the button as an `<a>` element instead of a `<button>`. */
  href?: string;
  /** Anchor `target` attribute used when `href` is set (default: '_self'). */
  target?: '_blank' | '_self';
  /** Size of the button, controlling padding and text scale (default: 'md'). */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual style of the button (default: 'solid'). */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /** Semantic color intent applied to the chosen variant (default: 'primary'). */
  intent?:
    'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  /** Corner shape of the button (default: 'rounded'). */
  shape?: 'rounded' | 'square' | 'pill';
  /** Width behavior of the button; 'full' stretches it to fill its container (default: 'auto'). */
  width?: 'auto' | 'full';
  /** Disables the button and applies disabled styling (default: false). */
  disabled?: boolean;
  /** Additional custom classes merged onto the button/anchor element (default: ''). */
  class?: string;
  /** Additional custom classes applied to the label span (default: ''). */
  labelClass?: string;
  /** Additional custom classes applied to the subtitle span (default: ''). */
  subtitleClass?: string;
  /** Additional custom classes applied to the icon wrapper. */
  iconClass?: string;
  /** Horizontal alignment of the button within its wrapping container. */
  align?: 'left' | 'center' | 'right';
  /** Nested child buttons (self-referential), used to build dropdown-style button groups. */
  children?: ButtonProps[];
}
