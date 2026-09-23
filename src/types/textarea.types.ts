export interface TextAreaProps {
  /** Selection group the field publishes its text to; omit for a standalone field. */
  group?: string;
  /** Visible label; always the field's accessible name, even when hidden. */
  label: string;
  /** Renders the label screen-reader-only (default: false). */
  hideLabel?: boolean;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Initial text. */
  value?: string;
  /** Help text below the field, announced as part of its description. */
  help?: string;
  /** Visible text rows; sets the initial height (default: 3). */
  rows?: number;
  /** Form field name. */
  name?: string;
  /** Id of the `<textarea>`; help, error and counter ids derive from it. Generated when omitted. */
  id?: string;
  /** Error text below the field; marks it invalid and forces the `error` intent. */
  error?: string;
  /** Maximum length in UTF-16 code units, enforced natively by the browser. */
  maxLength?: number;
  /** Shows a `length / maxLength` counter; requires `maxLength` (default: false). */
  showCounter?: boolean;
  /** Marks the field as required (default: false). */
  required?: boolean;
  /** Disables the field (default: false). */
  disabled?: boolean;
  /** Makes the field read-only; its value is still focusable and selectable (default: false). */
  readOnly?: boolean;
  /** Padding and text size, matching Button (default: 'md'). */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border and fill style (default: 'outline'). */
  variant?: 'outline' | 'solid' | 'ghost';
  /** Colour of the focus ring and focused border, matching Button (default: 'primary'). */
  intent?:
    'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  /** Corner shape (default: 'rounded'). */
  shape?: 'rounded' | 'square';
  /** Classes on the wrapper around label, field and supporting text. */
  class?: string;
  /** Classes on the label. */
  labelClass?: string;
  /** Classes on the `<textarea>`. */
  fieldClass?: string;
  /** Classes on the help text. */
  helpClass?: string;
  /** Classes on the error text. */
  errorClass?: string;
  /** Classes on the counter. */
  counterClass?: string;
}
