import type { TextAreaProps } from '~/types/textarea.types';
import { fieldId, validateFieldLabel } from '~/utils/field';

function fail(message: string): never {
  throw new Error(`textArea: ${message}`);
}

/** Throws on a TextArea config that cannot render a valid labelled field. */
export function validateTextArea(
  props: Pick<TextAreaProps, 'label' | 'value' | 'maxLength' | 'showCounter'>
): void {
  const { label, value = '', maxLength, showCounter } = props;
  validateFieldLabel('textArea', label);
  if (maxLength !== undefined && !(Number.isInteger(maxLength) && maxLength > 0)) {
    fail(`field "${label}" has maxLength ${maxLength}; expected a positive integer`);
  }
  if (showCounter && maxLength === undefined) {
    fail(`field "${label}" shows a counter without maxLength`);
  }
  if (maxLength !== undefined && value.length > maxLength) {
    fail(`field "${label}" has a ${value.length}-character value over its maxLength ${maxLength}`);
  }
}

/** A `<textarea>` id unique per rendered instance. */
export function textAreaId(): string {
  return fieldId('textarea');
}
