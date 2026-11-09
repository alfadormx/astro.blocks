import type { IconConfig } from './icon.types';

export interface AccordionItem {
  /** Id set on the item's `<details>`, so the item can be linked to */
  id?: string;
  /** Text shown in the item's summary row */
  title: string;
  /** Answer body as an HTML string; an `item-${index}` slot replaces it when present */
  content?: string;
}

export type AccordionTitleTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';

export type AccordionMode = 'single' | 'multiple';

export interface AccordionProps {
  /** Items rendered in order, one `<details>` each */
  items: AccordionItem[];
  /** 'single' lets one item be open at a time through the native `name` attribute; 'multiple' lets items open independently (default: 'multiple') */
  mode?: AccordionMode;
  /** Group name written to every `<details>` in 'single' mode; generated when omitted. Ignored in 'multiple' */
  name?: string;
  /** Indices of items open on first render; at most one in 'single' mode (default: []) */
  defaultOpen?: number[];
  /** Element wrapping each title inside `<summary>`; pick a heading to add titles to the outline (default: 'span') */
  titleTag?: AccordionTitleTag;
  /** Decorative icon at the end of each summary row, rotated while the item is open; `false` hides it (default: { name: 'heroicons:chevron-down' }) */
  icon?: Omit<IconConfig, 'ariaLabel'> | false;
  /** Custom classes for the root wrapper */
  class?: string;
  /** Custom classes for each `<details>` (default: 'border-b border-border') */
  itemClass?: string;
  /** Custom classes for each `<summary>` row */
  summaryClass?: string;
  /** Custom classes for each title element (default: 'm-0 text-base font-semibold text-normal') */
  titleClass?: string;
  /** Custom classes for each content panel (default: 'pb-4 text-muted') */
  contentClass?: string;
  /** Custom classes for each icon (default: 'size-5 shrink-0 text-muted') */
  iconClass?: string;
}
