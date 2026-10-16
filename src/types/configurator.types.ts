import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';
import type { TwoColumnContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { ItemsGridItem, ItemsGridProps, ItemsGridSelection } from './itemsgrid.types';
import type { ModelViewerMutation, ModelViewerProps } from './modelviewer.types';
import type { SelectionMode } from './selection.types';
import type { TabsProps } from './tabs.types';
import type { TextAreaAttributes } from './textarea.types';
import type { ToggleGroupOption, ToggleGroupProps } from './togglegroup.types';

interface ConfiguratorCategoryBase {
  /** Selection group name; unique on the page, not integer-like. */
  name: string;
  /**
   * Button config for this category's tab trigger. A field set here applies in every state, so it
   * beats `tabs.activeItemConfig`; style states only through `tabs.defaultItemConfig` /
   * `tabs.activeItemConfig`. `label` defaults to `heading`; for an icon-only tab set `label: ''`
   * and `icon.ariaLabel`.
   */
  triggerButton?: Omit<ButtonProps, 'id' | 'name'>;
  /** Instruction line above the panel; also the panel's accessible name. */
  heading: string;
  /** Key of `modelViewer.cameraPresets` to move to when this category changes after another did. */
  camera?: string;
}

export type ConfiguratorToggleOption = ToggleGroupOption & {
  /** Scene changes applied while this option is selected. */
  mutations?: ModelViewerMutation[];
};

type ConfiguratorToggleAppearance =
  { appearance: 'radio' } | { appearance?: 'cell'; variant?: 'solid' | 'outline' | 'ghost' };

export type ConfiguratorToggleGroup = Omit<
  ToggleGroupProps,
  'group' | 'label' | 'labelledBy' | 'options'
> &
  ConfiguratorToggleAppearance;

export type ConfiguratorToggleCategory = ConfiguratorCategoryBase & {
  panel: 'toggle';
  options: ConfiguratorToggleOption[];
  toggleGroup?: ConfiguratorToggleGroup;
};

export type ConfiguratorGridOption = Omit<ItemsGridItem, 'code'> & {
  /** Option code published to the category's selection group. */
  code: string;
  /** Scene changes applied while this option is selected. */
  mutations?: ModelViewerMutation[];
};

export type ConfiguratorItemsGrid = Omit<ItemsGridProps, 'items' | 'selection'> & {
  /** Colour of the selected border and focus ring; Configurator moves it into `selection.intent` (default: 'primary'). */
  intent?: Extract<ItemsGridSelection, { mode: 'single' }>['intent'];
};

export type ConfiguratorGridCategory = ConfiguratorCategoryBase & {
  panel: 'grid';
  options: ConfiguratorGridOption[];
  itemsGrid?: ConfiguratorItemsGrid;
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

export type ConfiguratorTextArea = Omit<
  TextAreaAttributes,
  'group' | 'label' | 'hideLabel' | 'value'
>;

export type ConfiguratorTextCategory = ConfiguratorCategoryBase & {
  panel: 'text';
  /** Initial text. */
  value?: string;
  /** Visible field label; when omitted or empty the heading names the field and the label stays hidden. */
  fieldLabel?: string;
  textArea?: ConfiguratorTextArea;
};

export type ConfiguratorCategory =
  ConfiguratorToggleCategory | ConfiguratorGridCategory | ConfiguratorTextCategory;

/** Which categories the summary line lists, in which order, and how parts are joined. */
export type SummaryFormat = {
  /** Category names to list, in this order (default: every category, in category order). */
  categories?: string[];
  /** String between parts (default: ' · '). */
  separator?: string;
};

/** Serialized per-category summary input, in category order; options in spec order. */
export type SummaryCategory = {
  name: string;
  mode: SelectionMode;
  options: { code: string; label: string }[];
};

export interface ConfiguratorProps {
  /**
   * Categories in tab order; each becomes one tab and one selection group. A category holds
   * identity (`name`, `heading`, `camera`, `triggerButton`), content (`options`, `value`,
   * `fieldLabel`) and selection semantics (`mode` / `min` / `max`). Appearance goes in
   * `toggleGroup`, `itemsGrid` or `textArea`, including grid `intent`. At most 12 (one static
   * panel slot each).
   */
  categories: ConfiguratorCategory[];
  /** ModelViewer props; `selections` is built from the categories' options and cameras. */
  modelViewer: Omit<ModelViewerProps, 'selections'>;
  /** ItemsGrid config merged under every grid category's `itemsGrid` (default: { columns: 3, gap: 'tight' }). */
  defaultItemsGridConfig?: LayerConfig<ConfiguratorItemsGrid>;
  /** ToggleGroup config merged under every toggle category's `toggleGroup` (default: { appearance: 'cell' }). */
  defaultToggleGroupConfig?: LayerConfig<ConfiguratorToggleGroup>;
  /** TextArea config merged under every text category's `textArea`; `error` is per category (default: { rows: 2 }). */
  defaultTextAreaConfig?: LayerConfig<Omit<ConfiguratorTextArea, 'error'>>;
  /** Tabs config for the choice panel; style every trigger with `tabs.defaultItemConfig` (default: grid tab list, full-width triggers, outlined primary active tab). */
  tabs?: Omit<TabsProps, 'items'>;
  /** TwoColumnContainer for the two panes (default: { responsive: true }). */
  twoColumnContainer?: TwoColumnContainerProps;
  /**
   * Keeps selections in the URL as a combination code. Category order is the code's group order:
   * append new categories only, never remove or reorder them once codes are shared. Only the
   * first configurator with urlState on a page binds to the URL.
   */
  urlState?: { product?: string; param?: string };
  /** Classes on every panel heading, after its defaults (default: 'mb-4 text-lg font-semibold'). */
  headingClass?: string;
  /** Headline under the viewer (default: { class: 'mt-6 mb-0', titleClass: 'text-2xl font-semibold' }) */
  headline?: HeadlineProps;
  /** Buttons rendered under the summary line (default: []). */
  actions?: ButtonProps[];
  /** Button config merged under every entry in `actions` */
  defaultActionConfig?: LayerConfig<ButtonProps>;
  /** Custom classes for the wrapper around the action buttons (default: 'mt-6 inline-flex flex-wrap gap-3') */
  actionsClass?: string;
  /** Summary line under the viewer: listed categories and separator (default: every category, ' · '). URL state and the viewer still use every category. */
  summary?: SummaryFormat;
  /** Custom classes for the summary line (default: 'mt-4 text-lg'). */
  summaryClass?: string;
  /** Extra classes on the configurator root. */
  class?: string;
}
