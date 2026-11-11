import type { ContactFormAction, ContactFormField } from '~/types/contactform.types';
import { fieldId } from '~/utils/field';

function fail(message: string): never {
  throw new Error(`contactForm: ${message}`);
}

/** A form id unique per rendered instance; field ids derive from it. */
export function contactFormId(): string {
  return fieldId('contact-form');
}

/** The default fields: name, email, phone, subject and message. */
export function defaultContactFields(): ContactFormField[] {
  return [
    { control: 'input', name: 'name', label: 'Name', required: true, autocomplete: 'name' },
    {
      control: 'input',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      autocomplete: 'email',
    },
    { control: 'input', name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' },
    { control: 'input', name: 'subject', label: 'Subject' },
    { control: 'textarea', name: 'message', label: 'Message', required: true, rows: 5 },
  ];
}

/** Throws on a ContactForm config that cannot submit. */
export function validateContactForm(props: {
  action: ContactFormAction;
  fields: ContactFormField[];
  honeypot: string | false;
}): void {
  const { action, fields, honeypot } = props;
  if (fields.length === 0) fail('fields is empty; omit it for the defaults');
  const seen = new Set<string>();
  for (const { name } of fields) {
    if (seen.has(name)) fail(`two fields share the name "${name}"`);
    if (honeypot && name === honeypot) fail(`field "${name}" uses the honeypot name`);
    seen.add(name);
  }
  if (action.type === 'endpoint' && !action.url?.trim()) fail('action.url is required');
  if (action.type === 'mailto' && !action.address?.trim()) fail('action.address is required');
}

export type SubmitResult = 'success' | 'error';

/** POSTs the form data; a non-ok response or a network failure is an error. */
export async function submitToEndpoint(url: string, formData: FormData): Promise<SubmitResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });
    return res.ok ? 'success' : 'error';
  } catch {
    return 'error';
  }
}

/** True when the spam-trap field holds anything but whitespace. */
export function isHoneypotFilled(form: HTMLFormElement, name: string | undefined): boolean {
  if (!name) return false;
  const value = new FormData(form).get(name);
  return typeof value === 'string' && value.trim() !== '';
}

export interface MailtoEntry {
  label: string;
  values: string[];
}

// encodeURIComponent, not URLSearchParams: the latter encodes spaces as `+`, which mail clients
// show literally.
/** A `mailto:` URL with one `Label: value` body line per non-empty field. */
export function buildMailtoUrl(
  address: string,
  content: { subject?: string; entries: MailtoEntry[] }
): string {
  const body = content.entries
    .map((entry) => ({ ...entry, values: entry.values.filter((v) => v.trim() !== '') }))
    .filter((entry) => entry.values.length > 0)
    .map((entry) => `${entry.label}: ${entry.values.join(', ')}`)
    .join('\r\n');
  const subject = content.subject?.trim();
  const params = [
    subject ? `subject=${encodeURIComponent(subject)}` : '',
    body ? `body=${encodeURIComponent(body)}` : '',
  ].filter(Boolean);
  return `mailto:${address}${params.length ? `?${params.join('&')}` : ''}`;
}

/** Mailto entries in field order, read from the form's current values. */
export function mailtoEntries(
  form: HTMLFormElement,
  labels: Record<string, string>
): MailtoEntry[] {
  const data = new FormData(form);
  return Object.entries(labels).map(([name, label]) => ({
    label,
    values: data.getAll(name).filter((v): v is string => typeof v === 'string'),
  }));
}
