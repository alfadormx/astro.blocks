import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';

export type LanguageToggleGap = 'none' | 'tight' | 'normal' | 'loose';

export type LanguageToggleLabelFormat = 'label' | 'code';

type LanguageButton = Omit<ButtonProps, 'href' | 'label' | 'lang' | 'aria-label' | 'aria-current'>;

export interface LanguageToggleProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  /** Layout direction of the language buttons inside the container (default: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';

  /** Button text: the language's full label (`Español`) or its uppercase code (`ES`); with `code`, the full label becomes the accessible name (default: 'label') */
  labelFormat?: LanguageToggleLabelFormat;

  /** Base Button props merged into both the active and inactive language buttons; `href`, `label`, `lang`, `aria-label` and `aria-current` come from each language. */
  defaultButtonConfig?: LayerConfig<LanguageButton>;

  /** Button props applied to the currently active language button, merged over defaultButtonConfig */
  activeButtonConfig?: LayerConfig<LanguageButton>;

  /** Button props applied to inactive language buttons, merged over defaultButtonConfig */
  inactiveButtonConfig?: LayerConfig<LanguageButton>;

  /** CSS class applied to the container div wrapping the language buttons */
  class?: string;

  /** Space between the language buttons (default: 'normal') */
  gap?: LanguageToggleGap;

  /** Keep the current path when switching language (`/x` → `/es/x`); when false, each button links to that language's basePath (default: true) */
  preservePath?: boolean;
}
