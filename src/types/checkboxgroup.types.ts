import type { CheckboxProps } from './checkbox.types';
import type { LayerConfig } from './config.types';
import type { FieldBaseProps } from './field.types';

export interface CheckboxGroupProps extends Omit<
  FieldBaseProps,
  'id' | 'name' | 'required' | 'fieldClass'
> {
  /** Form field name shared by every option. */
  name: string;
  /** The checkboxes, in order; each needs a unique `value`. */
  options: Omit<CheckboxProps, 'name'>[];
  /** Flow direction of the options (default: 'vertical'). */
  orientation?: 'horizontal' | 'vertical';
  /** Space between options (default: 'normal'). */
  optionsGap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Classes on the wrapper around the options. */
  optionsClass?: string;
  /** Layer merged into every option, under the option's own fields. */
  defaultOptionConfig?: LayerConfig<Omit<CheckboxProps, 'name' | 'label'>>;
}
