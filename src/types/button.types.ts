export interface ButtonProps {
  /** Button text label (optional if icon-only) */
  label?: string;

  /** Secondary text below label (for promotional buttons) */
  subtitle?: string;

  /** Icon name from astro-icon (e.g., 'heroicons:plus') */
  icon?: string;

  /** Icon position relative to label */
  iconPosition?: 'left' | 'right';

  /** Icon size (Tailwind size class) */
  iconSize?: string;

  /** Link URL (renders as <a> if provided) */
  href?: string;

  /** Link target */
  target?: '_blank' | '_self';

  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Visual style variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';

  /** Semantic color intent */
  intent?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral';

  /** Border radius style */
  shape?: 'rounded' | 'square' | 'pill';

  /** Width behavior */
  width?: 'auto' | 'full';

  /** Disabled state */
  disabled?: boolean;

  /** Custom classes */
  class?: string;
  labelClass?: string;
  subtitleClass?: string;
  iconClass?: string;
}
