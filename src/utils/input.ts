import type { InputProps } from '~/types/input.types';
import { fieldId, validateFieldLabel } from '~/utils/field';

/** Throws on an Input config that cannot render a valid labelled field. */
export function validateInput(props: Pick<InputProps, 'label'>): void {
  validateFieldLabel('input', props.label);
}

/** An `<input>` id unique per rendered instance. */
export function inputId(): string {
  return fieldId('input');
}
