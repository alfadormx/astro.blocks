import type { FieldBaseProps, FieldVariant } from '~/types/field.types';
import { focusBorderClass, focusRingClass } from '~/utils/intentStyles';
import { cn } from '~/utils/styles';

type Size = NonNullable<FieldBaseProps['size']>;
type Shape = NonNullable<FieldBaseProps['shape']>;
type Intent = NonNullable<FieldBaseProps['intent']>;

// Module scope survives across renders within a build; frontmatter does not.
// One counter per prefix keeps each block's numbering independent of the others on the page.
const counters = new Map<string, number>();

export function fieldId(prefix: string): string {
  const next = counters.get(prefix) ?? 0;
  counters.set(prefix, next + 1);
  return `${prefix}-${next}`;
}

export function fieldDescriptionIds(id: string): { helpId: string; errorId: string } {
  return { helpId: `${id}-help`, errorId: `${id}-error` };
}

/** Generated ids first, then the consumer's, each once; undefined when empty. */
export function describedBy({
  helpId,
  errorId,
  extraIds = [],
  consumer,
}: {
  helpId?: string;
  errorId?: string;
  extraIds?: string[];
  consumer?: string | null;
}): string | undefined {
  const generated = [helpId, errorId, ...extraIds].filter((v): v is string => Boolean(v));
  const consumerIds = (consumer ?? '').split(/\s+/).filter(Boolean);
  return [...new Set([...generated, ...consumerIds])].join(' ') || undefined;
}

export function ariaInvalid<T>(error: string | undefined, consumer: T): 'true' | T {
  return error ? 'true' : consumer;
}

// Full literal class strings so Tailwind's scanner sees every one.
export const FIELD_SIZE: Record<Size, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-[1rem]',
  lg: 'px-5 py-3 text-lg',
  xl: 'px-6 py-4 text-xl',
};

export const FIELD_VARIANT: Record<FieldVariant, string> = {
  outline: 'border-border bg-background',
  solid: 'border-transparent bg-surface',
  ghost: 'border-transparent bg-transparent hover:border-border',
};

export const FIELD_SHAPE: Record<Shape, string> = { rounded: 'rounded-md', square: 'rounded-sm' };

// Prop-driven rather than `read-only:` variants, because `:read-only` also matches disabled fields.
export function fieldControlClass({
  base = '',
  afterSize = '',
  size,
  variant,
  shape,
  intent,
  error,
  readOnly = false,
  disabled = false,
  disabledClass = '',
  fieldClass = '',
}: {
  base?: string;
  afterSize?: string;
  size: Size;
  variant: FieldVariant;
  shape: Shape;
  intent: Intent;
  error?: string;
  readOnly?: boolean;
  disabled?: boolean;
  disabledClass?: string;
  fieldClass?: string;
}): string {
  const resolvedIntent = error ? 'error' : intent;
  return cn(
    'block w-full border-2 text-normal placeholder:text-muted outline-none',
    base,
    'transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2',
    FIELD_SIZE[size],
    afterSize,
    FIELD_VARIANT[variant],
    FIELD_SHAPE[shape],
    focusRingClass(resolvedIntent),
    !readOnly && focusBorderClass(resolvedIntent),
    error && 'border-error',
    readOnly && 'bg-surface text-muted',
    disabled && 'opacity-50 cursor-not-allowed',
    disabled && disabledClass,
    fieldClass
  );
}

export function validateFieldLabel(block: string, label: string | undefined): void {
  if (!label?.trim()) throw new Error(`${block}: a label is required`);
}
