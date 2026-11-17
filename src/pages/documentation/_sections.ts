export type SectionKey = 'base' | 'primitives' | 'layout' | 'composite' | 'utilities' | 'guides';

export interface Section {
  key: SectionKey;
  label: string;
}

/** Docs sections, in tab and pager order. */
export const sections: readonly Section[] = [
  { key: 'base', label: 'Base' },
  { key: 'primitives', label: 'Primitives' },
  { key: 'layout', label: 'Layout' },
  { key: 'composite', label: 'Composite' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'guides', label: 'Guides' },
];

export const sectionLabel = (key: string): string | undefined =>
  sections.find((s) => s.key === key)?.label;
