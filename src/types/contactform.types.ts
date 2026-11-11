import type { ButtonProps } from './button.types';
import type { CheckboxAttributes } from './checkbox.types';
import type { CheckboxGroupProps } from './checkboxgroup.types';
import type { LayerConfig } from './config.types';
import type { ContainerProps, TwoColumnContainerProps } from './container.types';
import type { FieldBaseProps } from './field.types';
import type { HeadlineProps } from './headline.types';
import type { InputAttributes } from './input.types';
import type { SelectAttributes } from './select.types';
import type { TextAreaAttributes } from './textarea.types';

/** One form field: a form primitive's props tagged by `control`, with a required `name`. */
export type ContactFormField =
  | ({ control: 'input' } & Omit<InputAttributes, 'name'> & { name: string })
  | ({ control: 'textarea' } & Omit<TextAreaAttributes, 'name'> & { name: string })
  | ({ control: 'select' } & Omit<SelectAttributes, 'name'> & { name: string })
  | ({ control: 'checkbox' } & Omit<CheckboxAttributes, 'name'> & { name: string })
  | ({ control: 'checkboxGroup' } & CheckboxGroupProps);

/** Where the form submits: a form service endpoint, or the visitor's mail client. */
export type ContactFormAction =
  { type: 'endpoint'; url: string } | { type: 'mailto'; address: string };

export interface ContactFormProps {
  /** Submission target: `{ type: 'endpoint', url }` POSTs to a form service such as Formspree or Basin; `{ type: 'mailto', address }` opens the visitor's mail client. */
  action: ContactFormAction;
  /** Ordered fields; a provided list replaces the defaults (default: name, email, phone, subject, message). */
  fields?: ContactFormField[];
  /** Layer merged under every field: size, intent, shape and hideLabel. */
  defaultFieldConfig?: LayerConfig<Pick<FieldBaseProps, 'size' | 'intent' | 'shape' | 'hideLabel'>>;
  /** Configuration for the Headline above the form (default: htmlTag 'h2'). */
  headline?: HeadlineProps;
  /** Configuration for the outer Container. */
  container?: ContainerProps;
  /** Configuration for the submit Button (default: { label: 'Send', variant: 'solid', intent: 'primary' }). */
  submitButton?: Omit<ButtonProps, 'type' | 'href' | 'as'>;
  /** Message shown and focused after a successful send. */
  successMessage?: string;
  /** Message shown and focused when the send fails; the values are kept. */
  errorMessage?: string;
  /** Notice shown and focused after the mail client is opened (mailto mode only). */
  mailtoMessage?: string;
  /** Name of the hidden spam-trap field; `false` removes it. Formspree drops submissions that fill `_gotcha` (default: '_gotcha'). */
  honeypot?: string | false;
  /** Classes on the `<form>` element. */
  formClass?: string;
  /** Side the `aside` slot sits on; used only when the slot has content. */
  asidePosition?: 'left' | 'right';
  /** Classes on the wrapper around the `aside` slot. */
  asideClass?: string;
  /** Configuration for the TwoColumnContainer used when the `aside` slot has content (default: { htmlTag: 'div', responsive: true, content: { air: 'none' } }). */
  twoColumnContainer?: TwoColumnContainerProps;
}
