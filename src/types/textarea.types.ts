import type { HTMLAttributes } from 'astro/types';
import type { FieldBaseProps, FieldVariant } from './field.types';

export interface TextAreaProps extends FieldBaseProps {
  /** Selection group the field publishes its text to; omit for a standalone field. */
  group?: string;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Initial text. */
  value?: string;
  /** Visible text rows; sets the initial height (default: 3). */
  rows?: number;
  /** Maximum length in UTF-16 code units, enforced natively by the browser. */
  maxLength?: number;
  /** Shows a `length / maxLength` counter; requires `maxLength`. Its id is `<id>-counter` and is added to the description (default: false). */
  showCounter?: boolean;
  /** Makes the field read-only; its value is still focusable and selectable (default: false). */
  readOnly?: boolean;
  /** Border and fill style (default: 'outline'). */
  variant?: FieldVariant;
  /** Classes on the counter. */
  counterClass?: string;
}

/** TextArea props plus the native `<textarea>` attributes forwarded to the field. */
export type TextAreaAttributes = TextAreaProps &
  Omit<HTMLAttributes<'textarea'>, keyof TextAreaProps | 'maxlength' | 'readonly'>;
