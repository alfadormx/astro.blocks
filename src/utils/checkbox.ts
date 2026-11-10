import type { CheckboxProps } from '~/types/checkbox.types';
import type { CheckboxGroupProps } from '~/types/checkboxgroup.types';
import { fieldId, validateFieldLabel } from '~/utils/field';

function fail(message: string): never {
  throw new Error(`checkboxGroup: ${message}`);
}

/** Throws on a Checkbox config that cannot render a valid labelled box. */
export function validateCheckbox(props: Pick<CheckboxProps, 'label'>): void {
  validateFieldLabel('checkbox', props.label);
}

/** Throws on a CheckboxGroup config whose options can't submit as one named set. */
export function validateCheckboxGroup(
  props: Pick<CheckboxGroupProps, 'label' | 'name' | 'options'>
): void {
  const { label, name, options } = props;
  validateFieldLabel('checkboxGroup', label);
  if (!name?.trim()) fail(`group "${label}" has no name`);
  if (!options?.length) fail(`group "${label}" has no options`);
  const seen = new Set<string>();
  options.forEach((option, i) => {
    if (option.value === undefined) fail(`group "${label}" option ${i} has no value`);
    if (seen.has(option.value)) fail(`group "${label}" repeats option value "${option.value}"`);
    seen.add(option.value);
  });
}

/** A checkbox `<input>` id unique per rendered instance. */
export function checkboxId(): string {
  return fieldId('checkbox');
}

/** A `<fieldset>` id unique per rendered group; option ids derive from it. */
export function checkboxGroupId(): string {
  return fieldId('checkbox-group');
}

// Full literal class strings so Tailwind's scanner sees every one.
export const CHECKBOX_SIZE = {
  xs: { box: 'size-3.5', mark: 'size-2.5' },
  sm: { box: 'size-4', mark: 'size-3' },
  md: { box: 'size-5', mark: 'size-3.5' },
  lg: { box: 'size-6', mark: 'size-4' },
  xl: { box: 'size-7', mark: 'size-5' },
} as const;

export const OPTIONS_GAP = {
  none: 'gap-0',
  tight: 'gap-2',
  normal: 'gap-3',
  loose: 'gap-5',
} as const;
