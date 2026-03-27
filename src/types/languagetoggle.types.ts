import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';

export interface LanguageToggleProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  /**
   * Layout orientation for language buttons
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether to show full language labels or just language codes
   * @default true
   */
  showLabels?: boolean;

  /**
   * Default button configuration to apply to all language buttons
   */
  defaultButtonConfig?: Partial<ButtonProps>;

  /**
   * Button configuration for the active (current) language
   * Merged with defaultButtonConfig
   */
  activeButtonConfig?: Partial<ButtonProps>;

  /**
   * Button configuration for inactive languages
   * Merged with defaultButtonConfig
   */
  inactiveButtonConfig?: Partial<ButtonProps>;

  /**
   * CSS class for the container element
   */
  class?: string;

  /**
   * Gap between language buttons (Tailwind class)
   * @default 'gap-2'
   */
  gap?: string;
}
