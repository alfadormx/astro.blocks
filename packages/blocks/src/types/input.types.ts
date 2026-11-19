import type { HTMLAttributes } from 'astro/types';
import type { FieldBaseProps, FieldVariant } from './field.types';

export interface InputProps extends FieldBaseProps {
  /** Native input type (default: 'text'). */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date';
  /** Border and fill style (default: 'outline'). */
  variant?: FieldVariant;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Initial value. */
  value?: string;
  /** Makes the field read-only; its value is still focusable and selectable (default: false). */
  readOnly?: boolean;
}

/** Input props plus the native `<input>` attributes (`min`, `max`, `pattern`, `autocomplete`, …) forwarded to the field. */
export type InputAttributes = InputProps &
  Omit<HTMLAttributes<'input'>, keyof InputProps | 'readonly'>;
