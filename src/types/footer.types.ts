import type { ContainerProps } from './container.types';
import type { ButtonProps } from './button.types';
import type { LogoProps } from './logo.types';
import type { LanguageToggleProps } from './languagetoggle.types';
import type { LayerConfig } from './config.types';

export interface FooterProps {
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
  /** Icon buttons alongside the footnote (e.g. social links). */
  socialButtons?: ButtonProps[];
  /** Button config merged under every entry in `socialButtons`. */
  defaultSocialButtonConfig?: LayerConfig<ButtonProps>;
  /** Custom classes for the social buttons wrapper (default: 'md:order-1 flex flex-row gap-1'). */
  socialButtonsClass?: string;
  /** Link-style buttons under the logo (e.g. "Privacy · Terms"). */
  secondaryButtons?: ButtonProps[];
  /** Button config merged under every entry in `secondaryButtons`. */
  defaultSecondaryButtonConfig?: LayerConfig<ButtonProps>;
  /** Custom classes for the secondary buttons wrapper (default: 'flex flex-row gap-1'). */
  secondaryButtonsClass?: string;
  /** LanguageToggle row; rendered when set (`{}` for defaults). */
  languageToggle?: LanguageToggleProps;
  /** Horizontal alignment of the LanguageToggle row (default: 'center'). */
  languageToggleAlign?: 'left' | 'center' | 'right';
}
