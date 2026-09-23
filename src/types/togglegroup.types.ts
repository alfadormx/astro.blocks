import type { IconConfig } from './icon.types';
import type { ImageProps } from './image.types';

export interface ToggleGroupOption {
  /** Option code published to the selection group. Required and unique within the group. */
  code: string;
  /** Option text; always the input's accessible name, even when hidden. */
  label: string;
  /** Renders the label screen-reader-only, e.g. for image-only cells (default: false). */
  hideLabel?: boolean;
  /** Icon shown next to the label. Ignored when `image` is set. */
  icon?: IconConfig;
  /** Image shown next to the label; wins over `icon`. `alt` defaults to ''. */
  image?: ImageProps;
  /** Position of the icon or image relative to the label (default: 'left'). */
  iconPosition?: 'left' | 'right';
  /** Initially checked. At most one option may be selected. */
  selected?: boolean;
  /** Disables this option; arrow keys skip it. */
  disabled?: boolean;
  /** Extra classes on this option's cell or row, in both states. */
  class?: string;
}

export interface ToggleGroupOptionConfig {
  /** Classes on the option's cell (cell) or row (radio). */
  class?: string;
  /** Classes on the radio marker; radio texture only. */
  markerClass?: string;
  /** Classes on the label text. */
  labelClass?: string;
  /** Icon applied to every option this config layer reaches. */
  icon?: IconConfig;
  /** Image applied to every option this config layer reaches. */
  image?: ImageProps;
}

export type ToggleGroupAppearance =
  { appearance?: 'radio' } | { appearance: 'cell'; variant?: 'solid' | 'outline' | 'ghost' };

export interface ToggleGroupProps {
  /** Selection group name this block publishes to and follows. */
  group: string;
  /** Accessible name of the group. One of `label` / `labelledBy` is required. */
  label?: string;
  /** Id of the element naming the group; wins over `label`. */
  labelledBy?: string;
  /** The mutually exclusive options. */
  options: ToggleGroupOption[];
  /** Size, matching Button (default: 'md'). */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Corner shape, matching Button (default: 'rounded'). The radio marker stays circular. */
  shape?: 'rounded' | 'square' | 'pill';
  /** Color intent of the selected state and focus ring, matching Button (default: 'primary'). */
  intent?:
    'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  /** Arrangement of the options (default: 'horizontal'). */
  layout?: 'horizontal' | 'vertical';
  /** Disables every option (default: false). */
  disabled?: boolean;
  /** Presentation layered onto every option, both states. */
  defaultOptionConfig?: ToggleGroupOptionConfig;
  /** Presentation layered onto the selected state only. */
  selectedOptionConfig?: ToggleGroupOptionConfig;
  /** Presentation layered onto disabled options, last. */
  disabledOptionConfig?: ToggleGroupOptionConfig;
  /** Extra classes on the group root. */
  class?: string;
}
