import type { ButtonProps } from './button.types';

/** `aria-label` is set by the toggle script from the current theme. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThemeToggleProps extends Omit<ButtonProps, 'aria-label'> {}
