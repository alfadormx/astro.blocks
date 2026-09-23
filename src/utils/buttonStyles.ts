import type { ButtonProps } from '~/types/button.types';

type Size = NonNullable<ButtonProps['size']>;
type Shape = NonNullable<ButtonProps['shape']>;
type Variant = NonNullable<ButtonProps['variant']>;
type Intent = NonNullable<ButtonProps['intent']>;

type SizeBranches = { mediaOnly: string; subtitle: string; vertical: string; horizontal: string };

const SIZE_CLASSES: Record<Size, SizeBranches> = {
  xs: {
    mediaOnly: 'size-6',
    subtitle: 'px-4 py-3',
    vertical: 'px-4 py-3 text-xs',
    horizontal: 'px-2.5 py-1.5 text-xs',
  },
  sm: {
    mediaOnly: 'size-8',
    subtitle: 'px-5 py-4',
    vertical: 'px-5 py-4 text-sm',
    horizontal: 'px-3 py-2 text-sm',
  },
  md: {
    mediaOnly: 'size-10',
    subtitle: 'px-6 py-5',
    vertical: 'px-6 py-5 text-[1rem]',
    horizontal: 'px-4 py-2 text-[1rem]',
  },
  lg: {
    mediaOnly: 'size-12',
    subtitle: 'px-8 py-6',
    vertical: 'px-8 py-6 text-lg',
    horizontal: 'px-5 py-3 text-lg',
  },
  xl: {
    mediaOnly: 'size-14',
    subtitle: 'px-10 py-8',
    vertical: 'px-10 py-8 text-xl',
    horizontal: 'px-6 py-4 text-xl',
  },
};

export function sizeClass(
  size: Size,
  {
    mediaOnly = false,
    subtitle = false,
    vertical = false,
  }: { mediaOnly?: boolean; subtitle?: boolean; vertical?: boolean } = {}
): string {
  const s = SIZE_CLASSES[size];
  return mediaOnly ? s.mediaOnly : subtitle ? s.subtitle : vertical ? s.vertical : s.horizontal;
}

export function shapeClass(shape: Shape, mediaOnly = false): string {
  return {
    rounded: 'rounded-md',
    square: mediaOnly ? 'rounded-none' : 'rounded-sm',
    pill: 'rounded-full',
  }[shape];
}

const INTENT_CLASSES: Record<Variant, Record<Intent, string>> = {
  solid: {
    primary: 'bg-primary text-background hover:bg-primary-hover focus-visible:ring-primary',
    secondary: 'bg-secondary text-background hover:bg-secondary-hover focus-visible:ring-secondary',
    tertiary: 'bg-tertiary text-background hover:bg-tertiary-hover focus-visible:ring-tertiary',
    accent: 'bg-accent text-background hover:bg-accent-hover focus-visible:ring-accent',
    success: 'bg-success text-background hover:bg-success-hover focus-visible:ring-success',
    warning: 'bg-warning text-background hover:bg-warning-hover focus-visible:ring-warning',
    error: 'bg-error text-background hover:bg-error-hover focus-visible:ring-error',
    neutral: 'bg-surface text-normal hover:bg-elevated focus-visible:ring-border',
  },
  outline: {
    primary:
      'border-2 border-primary text-primary hover:bg-primary hover:text-background focus-visible:ring-primary',
    secondary:
      'border-2 border-secondary text-secondary hover:bg-secondary hover:text-background focus-visible:ring-secondary',
    tertiary:
      'border-2 border-tertiary text-tertiary hover:bg-tertiary hover:text-background focus-visible:ring-tertiary',
    accent:
      'border-2 border-accent text-accent hover:bg-accent hover:text-background focus-visible:ring-accent',
    success:
      'border-2 border-success text-success hover:bg-success hover:text-background focus-visible:ring-success',
    warning:
      'border-2 border-warning text-warning hover:bg-warning hover:text-background focus-visible:ring-warning',
    error:
      'border-2 border-error text-error hover:bg-error hover:text-background focus-visible:ring-error',
    neutral: 'border-2 border-border text-normal hover:bg-surface focus-visible:ring-border',
  },
  ghost: {
    primary: 'text-primary hover:bg-primary/10 focus-visible:ring-primary',
    secondary: 'text-secondary hover:bg-secondary/10 focus-visible:ring-secondary',
    tertiary: 'text-tertiary hover:bg-tertiary/10 focus-visible:ring-tertiary',
    accent: 'text-accent hover:bg-accent/10 focus-visible:ring-accent',
    success: 'text-success hover:bg-success/10 focus-visible:ring-success',
    warning: 'text-warning hover:bg-warning/10 focus-visible:ring-warning',
    error: 'text-error hover:bg-error/10 focus-visible:ring-error',
    neutral: 'text-normal hover:bg-surface focus-visible:ring-border',
  },
  link: {
    primary: 'text-link hover:text-link-hover hover:underline',
    secondary: 'text-secondary hover:text-secondary-hover hover:underline',
    tertiary: 'text-tertiary hover:text-tertiary-hover hover:underline',
    accent: 'text-accent hover:text-accent-hover hover:underline',
    success: 'text-success hover:text-success-hover hover:underline',
    warning: 'text-warning hover:text-warning-hover hover:underline',
    error: 'text-error hover:text-error-hover hover:underline',
    neutral: 'text-normal hover:text-emphasis hover:underline',
  },
};

export function intentClass(variant: Variant, intent: Intent): string {
  return INTENT_CLASSES[variant][intent];
}

const MEDIA_SIZE_CLASSES: Record<Size, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-7',
};

export function mediaSizeClass(size: Size): string {
  return MEDIA_SIZE_CLASSES[size];
}
