import type { HTMLAttributes } from 'astro/types';
import type { ContainerProps } from './container.types';
import type { ButtonProps } from './button.types';
import type { LogoProps } from './logo.types';
import type { LanguageToggleProps } from './languagetoggle.types';

export interface FooterProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  /** Props for the Container wrapping the footer content. */
  container?: ContainerProps;
  /** HTML string rendered as a disclaimer block (e.g. legal or compliance copy). */
  disclaimer?: string;
  /** Additional custom classes applied to the disclaimer block. */
  disclaimerClass?: string;
  /** Logo configuration rendered at the top of the footer. */
  logo?: LogoProps;
  /** HTML string rendered as a footnote (e.g. copyright notice). */
  footnote?: string;
  /** Additional custom classes applied to the footnote block. */
  footnoteClass?: string;
  /** Icon buttons rendered alongside the footnote (e.g. social media links). */
  socialActions?: ButtonProps[];
  /** Base Button props merged into each socialActions button. */
  defaultSocialActionsConfig?: Partial<ButtonProps>;
  /** Link-style buttons rendered alongside the logo (e.g. "Privacy · Terms"). */
  secondaryActions?: ButtonProps[];
  /** Base Button props merged into each secondaryActions button. */
  defaultSecondaryActionsConfig?: Partial<ButtonProps>;
  /** Whether the LanguageToggle is rendered in the footer (default: false). */
  showLanguageToggle?: boolean;
  /** Horizontal alignment of the LanguageToggle row (default: 'center'). */
  languageToggleAlign?: 'left' | 'center' | 'right';
  /** Props passed to the LanguageToggle component. */
  languageToggleConfig?: LanguageToggleProps;
}
