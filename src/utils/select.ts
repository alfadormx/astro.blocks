import type { SelectProps } from '~/types/select.types';
import { fieldId, validateFieldLabel } from '~/utils/field';

function fail(message: string): never {
  throw new Error(`select: ${message}`);
}

/** Throws on a Select config that cannot render a valid labelled single choice. */
export function validateSelect(
  props: Pick<SelectProps, 'label' | 'options' | 'placeholder'>
): void {
  const { label, options, placeholder } = props;
  validateFieldLabel('select', label);
  if (!options?.length) fail(`field "${label}" has no options`);
  const seen = new Set<string>();
  for (const option of options) {
    if (!option.label?.trim()) fail(`field "${label}" has an option without a label`);
    if (seen.has(option.value)) fail(`field "${label}" repeats option value "${option.value}"`);
    seen.add(option.value);
    if (option.selected && option.disabled) {
      fail(`field "${label}" option "${option.value}" is both selected and disabled`);
    }
    if (placeholder !== undefined && option.value === '') {
      fail(`field "${label}" uses value "" which is reserved for the placeholder`);
    }
  }
  if (options.filter((o) => o.selected).length > 1) {
    fail(`field "${label}" selects more than one option`);
  }
}

/** A `<select>` id unique per rendered instance. */
export function selectId(): string {
  return fieldId('select');
}
