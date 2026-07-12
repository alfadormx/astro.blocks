import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';

export interface LanguageToggleProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  /** Layout direction of the language buttons inside the container (default: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';

  /** Whether each language button shows its full label instead of just the language code (default: true) */
  showLabels?: boolean;

  /** Base Button props merged into both the active and inactive language buttons */
  defaultButtonConfig?: Partial<ButtonProps>;

  /** Button props applied to the currently active language button, merged over defaultButtonConfig */
  activeButtonConfig?: Partial<ButtonProps>;

  /** Button props applied to inactive language buttons, merged over defaultButtonConfig */
  inactiveButtonConfig?: Partial<ButtonProps>;

  /** CSS class applied to the container div wrapping the language buttons */
  class?: string;

  /** Tailwind gap utility class controlling spacing between language buttons (default: 'gap-4') */
  gap?: string;
}
