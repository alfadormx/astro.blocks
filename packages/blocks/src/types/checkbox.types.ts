import type { HTMLAttributes } from 'astro/types';
import type { FieldBaseProps } from './field.types';

export interface CheckboxProps extends FieldBaseProps {
  /** Submitted value when checked (browser default: 'on'). */
  value?: string;
  /** Initially checked (default: false). */
  checked?: boolean;
}

/** Checkbox props plus the native `<input>` attributes forwarded to the box. */
export type CheckboxAttributes = CheckboxProps &
  Omit<HTMLAttributes<'input'>, keyof CheckboxProps | 'type' | 'readonly'>;
