import type { ButtonProps } from '~/types/button.types';

export type Intent = NonNullable<ButtonProps['intent']>;

type FocusPrefix = 'focus-visible' | 'has-focus-visible';

// Full literal class strings so Tailwind's scanner sees every one.
const FOCUS_RING: Record<FocusPrefix, Record<Intent, string>> = {
  'focus-visible': {
    primary: 'focus-visible:ring-primary',
    secondary: 'focus-visible:ring-secondary',
    tertiary: 'focus-visible:ring-tertiary',
    accent: 'focus-visible:ring-accent',
    success: 'focus-visible:ring-success',
    warning: 'focus-visible:ring-warning',
    error: 'focus-visible:ring-error',
    neutral: 'focus-visible:ring-emphasis',
  },
  'has-focus-visible': {
    primary: 'has-focus-visible:ring-primary',
    secondary: 'has-focus-visible:ring-secondary',
    tertiary: 'has-focus-visible:ring-tertiary',
    accent: 'has-focus-visible:ring-accent',
    success: 'has-focus-visible:ring-success',
    warning: 'has-focus-visible:ring-warning',
    error: 'has-focus-visible:ring-error',
    neutral: 'has-focus-visible:ring-emphasis',
  },
};

const SELECTED_BORDER: Record<Intent, string> = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  tertiary: 'border-tertiary',
  accent: 'border-accent',
  success: 'border-success',
  warning: 'border-warning',
  error: 'border-error',
  neutral: 'border-emphasis',
};

const SELECTED_FILL: Record<Intent, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  neutral: 'bg-emphasis',
};

const FOCUS_BORDER: Record<Intent, string> = {
  primary: 'focus:border-primary',
  secondary: 'focus:border-secondary',
  tertiary: 'focus:border-tertiary',
  accent: 'focus:border-accent',
  success: 'focus:border-success',
  warning: 'focus:border-warning',
  error: 'focus:border-error',
  neutral: 'focus:border-emphasis',
};

export function focusRingClass(intent: Intent, prefix: FocusPrefix = 'focus-visible'): string {
  return FOCUS_RING[prefix][intent];
}

export function selectedBorderClass(intent: Intent): string {
  return SELECTED_BORDER[intent];
}

export function selectedFillClass(intent: Intent): string {
  return SELECTED_FILL[intent];
}

export function focusBorderClass(intent: Intent): string {
  return FOCUS_BORDER[intent];
}
