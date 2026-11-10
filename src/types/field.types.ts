/** Props shared by every form control: Input, Select, Checkbox, CheckboxGroup and TextArea. */
export interface FieldBaseProps {
  /** Visible label; always the control's accessible name, even when hidden. */
  label: string;
  /** Renders the label screen-reader-only (default: false). */
  hideLabel?: boolean;
  /** Help text below the control, announced as part of its description. */
  help?: string;
  /** Error text below the control; marks it invalid and forces the `error` intent. */
  error?: string;
  /** Id of the native control; help and error ids derive from it. Generated when omitted. */
  id?: string;
  /** Form field name. */
  name?: string;
  /** Marks the control as required and shows a `*` after the label (default: false). */
  required?: boolean;
  /** Disables the control (default: false). */
  disabled?: boolean;
  /** Padding and text size, matching Button (default: 'md'). */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Colour of the focus ring and focused border, matching Button (default: 'primary'). */
  intent?:
    'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  /** Corner shape (default: 'rounded'). */
  shape?: 'rounded' | 'square';
  /** Classes on the wrapper around label, control and supporting text. */
  class?: string;
  /** Classes on the label; `[&_[data-field-required]]:…` restyles the required marker. */
  labelClass?: string;
  /** Classes on the native control. */
  fieldClass?: string;
  /** Classes on the help text. */
  helpClass?: string;
  /** Classes on the error text. */
  errorClass?: string;
}

/** Border and fill style of a text-like control. */
export type FieldVariant = 'outline' | 'solid' | 'ghost';
