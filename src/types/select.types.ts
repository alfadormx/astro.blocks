import type { HTMLAttributes } from 'astro/types';
import type { FieldBaseProps, FieldVariant } from './field.types';

export interface SelectOption {
  /** Submitted value; unique within the select. */
  value: string;
  /** Visible text. */
  label: string;
  /** Makes the option unselectable (default: false). */
  disabled?: boolean;
  /** Initially selected; at most one option (default: false). */
  selected?: boolean;
}

export interface SelectProps extends FieldBaseProps {
  /** Choices, in order. */
  options: SelectOption[];
  /** Disabled empty first option, selected while no option is; with `required`, the field is invalid until a choice is made. */
  placeholder?: string;
  /** Border and fill style (default: 'outline'). */
  variant?: FieldVariant;
}

/** Select props plus the native `<select>` attributes (`autocomplete`, `form`, …) forwarded to the field. */
export type SelectAttributes = SelectProps &
  Omit<HTMLAttributes<'select'>, keyof SelectProps | 'multiple' | 'size'>;
