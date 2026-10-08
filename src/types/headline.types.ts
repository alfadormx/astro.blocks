export interface HeadlineProps {
  /** Small label shown above the title */
  tagline?: string;
  /** Main headline text */
  title?: string;
  /** Supporting text shown below the title */
  subtitle?: string;
  /** Custom classes for the tagline element */
  taglineClass?: string;
  /** Custom classes for the title element */
  titleClass?: string;
  /** Custom classes for the subtitle element */
  subtitleClass?: string;
  /** Custom classes for the root element */
  class?: string;
  /** Text alignment (default: 'left') */
  align?: 'left' | 'center' | 'right';
  /** Optional anchor id for deep-linking to this headline */
  anchorId?: string;
  /** Heading element for the title; sets semantics only, not size — resize with `titleClass` (default: 'h2') */
  htmlTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
