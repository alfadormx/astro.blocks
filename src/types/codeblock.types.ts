import type { ButtonProps } from './button.types';

export interface CodeBlockProps {
  /** Source to highlight and copy, rendered as text. */
  code: string;
  /** Shiki language id; unknown ids fall back to plain text. */
  lang?: string;
  /** Filename-style caption shown above the code. */
  title?: string;
  /** Copy button merged over the default icon button; `false` hides it (default: rendered). */
  copyButton?: Omit<ButtonProps, 'href'> | false;
  /** Text announced to screen readers after a successful copy. */
  copiedMessage?: string;
  /** Classes added to the root `figure`. */
  class?: string;
}
