import type { HTMLAttributes } from 'astro/types';
import type { IconConfig } from './icon.types';
import type { ImageProps } from './image.types';

export interface ButtonProps extends Omit<HTMLAttributes<'button'>, 'class'> {
  /** HTML `id` attribute applied to the rendered `<button>` or `<a>` element. */
  id?: string;
  /** Main text label displayed inside the button. */
  label?: string;
  /** Secondary text rendered below the label; enables the promotional (subtitle) layout. */
  subtitle?: string;
  /**
   * Arrangement of the icon or image relative to the label. No literal default: when
   * omitted it resolves to 'vertical' if `subtitle` is set, otherwise 'horizontal'.
   * An explicit value always wins, including 'horizontal' together with `subtitle`.
   */
  layout?: 'horizontal' | 'vertical';
  /** Icon configuration (name, class, aria-label) rendered alongside the label. */
  icon?: IconConfig;
  /**
   * Image configuration rendered through the Image primitive, in the same media slot as
   * `icon`. Mutually exclusive with `icon` — when both are set the image wins. `alt` is
   * required at runtime; the Image primitive throws without it.
   */
  image?: ImageProps;
  /** Position of the icon or image relative to the label (default: 'left'). */
  iconPosition?: 'left' | 'right';
  /** Explicit icon size class, overriding the size-derived default icon size. */
  iconSize?: string;
  /**
   * Explicit image size class, overriding the size-derived default
   * (xs: 'size-3', sm: 'size-4', md: 'size-5', lg: 'size-6', xl: 'size-7').
   */
  imageSize?: string;
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
