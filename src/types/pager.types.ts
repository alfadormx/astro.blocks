import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';

export interface PagerProps {
  /** Previous link; renders when set (default: outline, left arrow, per-language "Previous"). `subtitle` is the page title, shown as the second line. */
  prevButton?: ButtonProps;
  /** Next link; renders when set and sits at the inline end (default: outline, right arrow, per-language "Next"). */
  nextButton?: ButtonProps;
  /** Layer merged under both links, under each link's own values. */
  defaultButtonConfig?: LayerConfig<ButtonProps>;
  /** Accessible name of the navigation landmark (default: per-language "Pagination"). */
  ariaLabel?: string;
  /** Language of the built-in labels (default: the site's default language). */
  langCode?: string;
  /** Space between the links and the slot (default: 'normal'). */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Classes on the `<nav>` (`data-pager`). */
  class?: string;
  /** `id` on the `<nav>`. */
  id?: string;
}
