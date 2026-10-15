import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';

export type LanguageToggleGap = 'none' | 'tight' | 'normal' | 'loose';

export interface LanguageToggleProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  /** Layout direction of the language buttons inside the container (default: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';

  /** Whether each language button shows its full label instead of just the language code (default: true) */
  showLabels?: boolean;

  /** Base Button props merged into both the active and inactive language buttons; `href`, `label` and `aria-current` come from each language. */
  defaultButtonConfig?: LayerConfig<Omit<ButtonProps, 'href' | 'label' | 'aria-current'>>;

  /** Button props applied to the currently active language button, merged over defaultButtonConfig */
  activeButtonConfig?: LayerConfig<Omit<ButtonProps, 'href' | 'label' | 'aria-current'>>;

  /** Button props applied to inactive language buttons, merged over defaultButtonConfig */
  inactiveButtonConfig?: LayerConfig<Omit<ButtonProps, 'href' | 'label' | 'aria-current'>>;

  /** CSS class applied to the container div wrapping the language buttons */
  class?: string;

  /** Space between the language buttons (default: 'normal') */
  gap?: LanguageToggleGap;
}
