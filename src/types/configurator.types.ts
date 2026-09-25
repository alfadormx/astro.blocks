import type { ButtonProps } from './button.types';
import type { TwoColumnContainerProps } from './container.types';
import type { ItemsGridItem, ItemsGridProps } from './itemsgrid.types';
import type { ModelViewerMutation, ModelViewerProps } from './modelviewer.types';
import type { SelectionMode } from './selection.types';
import type { TabsProps } from './tabs.types';
import type { TextAreaProps } from './textarea.types';
import type {
  ToggleGroupAppearance,
  ToggleGroupOption,
  ToggleGroupProps,
} from './togglegroup.types';

interface ConfiguratorCategoryBase {
  /** Selection group name; unique on the page, not integer-like. */
  name: string;
  /** Button config for this category's tab trigger. */
  trigger: Partial<ButtonProps>;
  /** Instruction line above the panel; also the panel's accessible name. */
  heading: string;
  /** Key of `viewer.cameraPresets` to move to when this category changes after another did. */
  camera?: string;
}

export type ConfiguratorToggleOption = ToggleGroupOption & {
  /** Scene changes applied while this option is selected. */
  mutations?: ModelViewerMutation[];
};

export type ConfiguratorToggleConfig = Partial<
  Omit<ToggleGroupProps, 'group' | 'label' | 'labelledBy' | 'options'>
> &
  ToggleGroupAppearance;

export type ConfiguratorToggleCategory = ConfiguratorCategoryBase & {
  panel: 'toggle';
  options: ConfiguratorToggleOption[];
  config?: ConfiguratorToggleConfig;
};

export type ConfiguratorGridOption = Omit<ItemsGridItem, 'code'> & {
  /** Option code published to the category's selection group. */
  code: string;
  /** Scene changes applied while this option is selected. */
  mutations?: ModelViewerMutation[];
};

export type ConfiguratorGridConfig = Partial<Omit<ItemsGridProps, 'items' | 'selection'>>;

export type ConfiguratorGridCategory = ConfiguratorCategoryBase & {
  panel: 'grid';
  options: ConfiguratorGridOption[];
  config?: ConfiguratorGridConfig;
} & (
    | { mode: 'single' }
    | {
        mode: 'multiple';
        /** Minimum number of selected options. */
        min?: number;
        /** Maximum number of selected options. */
        max?: number;
      }
  );

export type ConfiguratorTextConfig = Partial<
  Omit<TextAreaProps, 'group' | 'label' | 'hideLabel' | 'value' | 'maxLength' | 'placeholder'>
>;

export type ConfiguratorTextCategory = ConfiguratorCategoryBase & {
  panel: 'text';
  /** Initial text. */
  value?: string;
  /** Maximum length in UTF-16 code units. */
  maxLength?: number;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  config?: ConfiguratorTextConfig;
};

export type ConfiguratorCategory =
  ConfiguratorToggleCategory | ConfiguratorGridCategory | ConfiguratorTextCategory;

/** Serialized per-category summary input, in category order; options in spec order. */
export type SummaryCategory = {
  name: string;
  mode: SelectionMode;
  options: { code: string; label: string }[];
};

export interface ConfiguratorProps {
  /** Categories in tab order; each becomes one tab and one selection group. */
  categories: ConfiguratorCategory[];
  /** ModelViewer props; `selections` is built from the categories' options and cameras. */
  viewer: Omit<ModelViewerProps, 'selections'>;
  /** Button config merged under every category's `trigger`. */
  defaultTriggerConfig?: Partial<ButtonProps>;
  /** ItemsGrid config merged under every grid category's `config` (default: { columns: 3, air: 'tight' }). */
  defaultGridConfig?: ConfiguratorGridConfig;
  /** ToggleGroup config merged under every toggle category's `config` (default: { appearance: 'cell' }). */
  defaultToggleConfig?: ConfiguratorToggleConfig;
  /** TextArea config merged under every text category's `config` (default: { rows: 2 }). */
  defaultTextConfig?: ConfiguratorTextConfig;
  /** Tabs config for the choice panel (default: grid tab list, outlined primary active tab). */
  tabs?: Partial<Omit<TabsProps, 'items'>>;
  /** TwoColumnContainer config for the two panes (default: { responsive: true }). */
  layout?: Partial<TwoColumnContainerProps>;
  /**
   * Keeps selections in the URL as a combination code. Category order is the code's group order:
   * append new categories only, never remove or reorder them once codes are shared. Only the
   * first configurator with urlState on a page binds to the URL.
   */
  urlState?: { product?: string; param?: string };
  /** Extra classes on the configurator root. */
  class?: string;
}
