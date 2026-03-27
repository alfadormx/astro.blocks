import type { HTMLAttributes } from 'astro/types';
import type { ContainerProps } from './container.types';
import type { ButtonProps } from './button.types';
import type { LogoProps } from './logo.types';
import type { LanguageToggleProps } from './languagetoggle.types';

export interface FooterProps extends Omit<HTMLAttributes<'nav'>, 'class'> {
  container?: ContainerProps;
  disclaimer?: string;
  disclaimerClass?: string;
  logo?: LogoProps;
  footnote?: string;
  footnoteClass?: string;
  socialActions?: ButtonProps[];
  defaultSocialActionsConfig?: Partial<ButtonProps>;
  secondaryActions?: ButtonProps[];
  defaultSecondaryActionsConfig?: Partial<ButtonProps>;
  showLanguageToggle?: boolean;
  languageToggleAlign?: 'left' | 'center' | 'right';
  languageToggleConfig?: LanguageToggleProps;
}
