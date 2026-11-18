export type SectionKey = 'base' | 'primitives' | 'layout' | 'composite' | 'utilities' | 'guides';

export interface Section {
  key: SectionKey;
  label: string;
  description: string;
}

/** Docs sections, in tab and pager order. */
export const sections: readonly Section[] = [
  {
    key: 'base',
    label: 'Base',
    description: 'Foundational design tokens the rest of the library is built on.',
  },
  {
    key: 'primitives',
    label: 'Primitives',
    description: 'The smallest building blocks, used directly or inside composites.',
  },
  {
    key: 'layout',
    label: 'Layout',
    description: 'Structural containers that arrange content on the page.',
  },
  {
    key: 'composite',
    label: 'Composite',
    description: 'Higher-level blocks that compose primitives into ready-made sections.',
  },
  {
    key: 'utilities',
    label: 'Utilities',
    description: 'Browser-side helpers that sit beside the blocks, such as URL state.',
  },
  {
    key: 'guides',
    label: 'Guides',
    description: 'How blocks compose, and how to write content and copy for them.',
  },
];

export const sectionLabel = (key: string): string | undefined =>
  sections.find((s) => s.key === key)?.label;
